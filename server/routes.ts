import type { Express } from "express";
import type { Server } from "http";
import multer from "multer";
import { spawn } from "child_process";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import * as path from "path";
import * as fs from "fs";
import Papa from "papaparse";
import * as XLSX from "xlsx";

// Configure Multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB limit
});

type KnownFileType = "biometric" | "enrollment" | "demographic";
type FileType = KnownFileType | "unknown";

type GovRecord = Record<string, string | number | null>;
type GovDataSource =
  | { kind: "file"; path: string; label: string }
  | { kind: "zip"; zipPath: string; entry: string; label: string };

const KNOWN_FILE_TYPES: KnownFileType[] = ["biometric", "enrollment", "demographic"];
const AGE_COLUMNS_BY_TYPE: Record<KnownFileType, string[]> = {
  biometric: ["bio_age_5_17", "bio_age_17_"],
  enrollment: ["age_0_5", "age_5_17", "age_18_greater"],
  demographic: ["demo_age_5_17", "demo_age_17_"],
};

const GOV_PATH_ENV: Record<KnownFileType, string> = {
  biometric: "GOV_BIOMETRIC_PATH",
  enrollment: "GOV_ENROLLMENT_PATH",
  demographic: "GOV_DEMOGRAPHIC_PATH",
};

const GOV_FILE_PREFIXES: Record<KnownFileType, string[]> = {
  biometric: ["api_data_aadhar_biometric", "gov_biometric"],
  enrollment: ["api_data_aadhar_enrolment", "gov_enrollment", "gov_enrolment"],
  demographic: ["api_data_aadhar_demographic", "gov_demographic"],
};

const DEFAULT_GOV_ZIP_PATH =
  process.env.GOV_DATA_ZIP_PATH || path.join(process.cwd(), "UIDAI-Verifier.zip");
const DEFAULT_GOV_ZIP_ENTRIES: Record<KnownFileType, string> = {
  biometric:
    "UIDAI-Verifier/attached_assets/api_data_aadhar_biometric_1500000_1861108_1768659323892.csv",
  enrollment:
    "UIDAI-Verifier/attached_assets/api_data_aadhar_enrolment_1000000_1006029_1768659323870.csv",
  demographic:
    "UIDAI-Verifier/attached_assets/api_data_aadhar_demographic_2000000_2071700_1768659323892.csv",
};

const govDataSets: Record<KnownFileType, Map<string, GovRecord>> = {
  biometric: new Map(),
  enrollment: new Map(),
  demographic: new Map(),
};
const govDataLoaded = new Set<KnownFileType>();

function isKnownFileType(value: string): value is KnownFileType {
  return KNOWN_FILE_TYPES.includes(value as KnownFileType);
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "_");
}

function normalizeKeyPart(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeDate(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF?.parse_date_code?.(value);
    if (parsed?.y && parsed?.m && parsed?.d) {
      const month = String(parsed.m).padStart(2, "0");
      const day = String(parsed.d).padStart(2, "0");
      return `${parsed.y}-${month}-${day}`;
    }
  }
  return String(value).trim();
}

function buildRecordKey(row: Record<string, unknown>): string | null {
  const date = normalizeDate(row.date);
  const state = normalizeKeyPart(row.state);
  const district = normalizeKeyPart(row.district);
  const pincode = String(row.pincode ?? "").trim();

  if (!date || !state || !district || !pincode) return null;
  return `${date}|${state}|${district}|${pincode}`;
}

function normalizeComparableValue(value: unknown): string | number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = String(value).trim();
  if (!text) return null;
  const num = Number(text);
  return Number.isNaN(num) ? text.toLowerCase() : num;
}

function getComparableColumns(uploadedColumns: string[], fileType: FileType): string[] {
  if (!isKnownFileType(fileType)) return [];
  const ageColumns = AGE_COLUMNS_BY_TYPE[fileType];
  return ageColumns.filter((col) => uploadedColumns.includes(col));
}

function findFileByPrefix(dirPath: string, prefixes: string[]): string | null {
  try {
    const files = fs.readdirSync(dirPath);
    const match = files.find(
      (file) =>
        file.endsWith(".csv") && prefixes.some((prefix) => file.startsWith(prefix))
    );
    return match ? path.join(dirPath, match) : null;
  } catch {
    return null;
  }
}

function resolveGovDataSource(fileType: KnownFileType): GovDataSource | null {
  const explicitPath = process.env[GOV_PATH_ENV[fileType]];
  if (explicitPath && fs.existsSync(explicitPath)) {
    return { kind: "file", path: explicitPath, label: explicitPath };
  }

  const searchDirs = [
    process.env.GOV_DATA_DIR,
    path.join(process.cwd(), "attached_assets"),
    path.join(process.cwd(), "server", "data"),
    path.join(process.cwd(), "data"),
  ].filter(Boolean) as string[];

  for (const dir of searchDirs) {
    const match = findFileByPrefix(dir, GOV_FILE_PREFIXES[fileType]);
    if (match) return { kind: "file", path: match, label: match };
  }

  if (DEFAULT_GOV_ZIP_PATH && fs.existsSync(DEFAULT_GOV_ZIP_PATH)) {
    const entry = DEFAULT_GOV_ZIP_ENTRIES[fileType];
    return {
      kind: "zip",
      zipPath: DEFAULT_GOV_ZIP_PATH,
      entry,
      label: `${DEFAULT_GOV_ZIP_PATH}:${entry}`,
    };
  }

  return null;
}

function createGovDataStream(
  source: GovDataSource
): { stream: NodeJS.ReadableStream; completion?: Promise<void> } {
  if (source.kind === "file") {
    return { stream: fs.createReadStream(source.path) };
  }

  const child = spawn("unzip", ["-p", source.zipPath, source.entry]);
  if (!child.stdout) {
    throw new Error(`Unable to read government dataset from ${source.label}`);
  }

  const completion = new Promise<void>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`unzip exited with code ${code}`));
    });
  });

  return { stream: child.stdout, completion };
}

function parseGovernmentDataset(
  fileType: KnownFileType,
  source: GovDataSource
): Promise<{ dataset: Map<string, GovRecord>; count: number }> {
  const dataset = new Map<string, GovRecord>();
  const { stream, completion } = createGovDataStream(source);
  const ageColumns = AGE_COLUMNS_BY_TYPE[fileType];

  const parsePromise = new Promise<{ dataset: Map<string, GovRecord>; count: number }>(
    (resolve, reject) => {
      let count = 0;
      Papa.parse(stream, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: normalizeHeader,
        step: (result) => {
          const row = result.data as Record<string, unknown>;
          if (!row) return;

          const key = buildRecordKey(row);
          if (!key) return;

          const record: GovRecord = {};
          for (const col of ageColumns) {
            record[col] = normalizeComparableValue(row[col]);
          }
          dataset.set(key, record);
          count += 1;
        },
        complete: () => resolve({ dataset, count }),
        error: (error) => reject(error),
      });
    }
  );

  if (completion) {
    return Promise.all([parsePromise, completion]).then(([result]) => result);
  }

  return parsePromise;
}

async function loadGovernmentData(): Promise<void> {
  console.log("Loading official government datasets...");

  for (const fileType of KNOWN_FILE_TYPES) {
    const source = resolveGovDataSource(fileType);
    if (!source) {
      console.warn(`[gov] No dataset configured for ${fileType}.`);
      continue;
    }

    try {
      const { dataset, count } = await parseGovernmentDataset(fileType, source);
      govDataSets[fileType] = dataset;
      govDataLoaded.add(fileType);
      console.log(`[gov] Loaded ${count} ${fileType} records from ${source.label}.`);
    } catch (error) {
      console.warn(`[gov] Failed to load ${fileType} dataset:`, error);
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize gov data
  await loadGovernmentData();

  // API Routes
  
  // Upload File
  app.post(api.uploads.create.path, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileName = req.file.originalname;
      const fileSize = req.file.size;
      let parsedData: any[] = [];

      // Parse File
      if (fileName.endsWith('.csv')) {
        const csvText = req.file.buffer.toString('utf-8');
        const result = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          transformHeader: normalizeHeader
        });
        parsedData = result.data;
      } else if (fileName.match(/\.xlsx?$/)) {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        // Normalize keys
        parsedData = parsedData.map((row: any) => {
          const newRow: any = {};
          Object.keys(row).forEach(key => {
            newRow[normalizeHeader(key)] = row[key];
          });
          return newRow;
        });
      } else {
        return res.status(400).json({ message: "Unsupported file format" });
      }

      // Dynamic Column Detection
      const uploadedColumns = Object.keys(parsedData[0] || {});
      const fileType: FileType = uploadedColumns.includes('bio_age_5_17') ? 'biometric' :
                       uploadedColumns.includes('age_0_5') ? 'enrollment' :
                       uploadedColumns.includes('demo_age_5_17') ? 'demographic' : 'unknown';
      const comparableColumns = getComparableColumns(uploadedColumns, fileType);
      const hasGovData = isKnownFileType(fileType) && govDataLoaded.has(fileType);
      const govDataset = isKnownFileType(fileType) ? govDataSets[fileType] : null;

      // Verify Data
      let verifiedCount = 0;
      let mismatchCount = 0;
      let notFoundCount = 0;
      const recordsToInsert = [];

      for (const row of parsedData) {
        const dateValue = normalizeDate(row.date);
        const key = buildRecordKey(row);
        const columnsToCompare = comparableColumns.filter((col) =>
          Object.prototype.hasOwnProperty.call(row, col)
        );

        let status = "NotFound";
        let details = "Record not verified against official government database";

        if (!isKnownFileType(fileType)) {
          details = "Unknown file type; unable to verify against official government database";
          notFoundCount++;
        } else if (!key) {
          details = "Missing required fields (date, state, district, pincode)";
          notFoundCount++;
        } else if (!hasGovData || !govDataset) {
          details = "Official government database unavailable for this file type";
          notFoundCount++;
        } else {
          const govRecord = govDataset.get(key);
          if (!govRecord) {
            details = "Record not found in official government database";
            notFoundCount++;
          } else if (columnsToCompare.length === 0) {
            details = "No comparable age columns found in this record";
            notFoundCount++;
          } else {
            const mismatchedColumns: string[] = [];
            for (const col of columnsToCompare) {
              const uploadedValue = normalizeComparableValue(row[col]);
              const govValue = normalizeComparableValue(govRecord[col]);
              if (uploadedValue !== govValue) mismatchedColumns.push(col);
            }

            if (mismatchedColumns.length > 0) {
              status = "Mismatch";
              details = `Mismatch in columns: ${mismatchedColumns.join(", ")}`;
              mismatchCount++;
            } else {
              status = "Verified";
              details = "Matched with official government records";
              verifiedCount++;
            }
          }
        }

        recordsToInsert.push({
          uploadId: 0,
          date: dateValue || null,
          state: row.state || null,
          district: row.district || null,
          pincode: row.pincode ? String(row.pincode) : null,
          status,
          details,
          originalData: row
        });
      }

      // Create Upload Record
      const newUpload = await storage.createUpload({
        fileName,
        fileSize,
        totalRecords: parsedData.length,
        verifiedCount,
        mismatchCount,
        notFoundCount,
        fileType,
        columns: uploadedColumns,
      });

      // Update uploadId and Insert Records
      const finalRecords = recordsToInsert.map(r => ({ ...r, uploadId: newUpload.id }));
      
      // Batch processing for very large datasets to avoid memory issues
      // For the MVP, we'll limit to first 10k records if it's extremely large
      // but the storage layer now handles batching.
      const processedRecords = finalRecords.length > 50000 
        ? finalRecords.slice(0, 50000) 
        : finalRecords;

      await storage.createRecords(processedRecords);

      res.status(201).json(newUpload);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to process upload" });
    }
  });

  // Get All Uploads
  app.get(api.uploads.list.path, async (req, res) => {
    const uploads = await storage.getUploads();
    res.json(uploads);
  });

  // Get Single Upload
  app.get(api.uploads.get.path, async (req, res) => {
    const upload = await storage.getUpload(Number(req.params.id));
    if (!upload) return res.status(404).json({ message: "Upload not found" });
    res.json(upload);
  });

  // Get Records for Upload
  app.get(api.uploads.records.path, async (req, res) => {
    const uploadId = Number(req.params.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Filter logic would go here in storage implementation, for now simple pagination
    const { records, total } = await storage.getRecordsByUploadId(uploadId, limit, offset);
    
    res.json({
      data: records,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  });

  // Analytics Stats
  app.get(api.analytics.stats.path, async (req, res) => {
    const uploadId = req.query.uploadId ? Number(req.query.uploadId) : undefined;
    
    if (uploadId) {
      const upload = await storage.getUpload(uploadId);
      if (!upload) return res.status(404).json({ message: "Upload not found" });
      
      return res.json({
        id: upload.id,
        total: upload.totalRecords,
        verified: upload.verifiedCount,
        mismatch: upload.mismatchCount,
        notFound: upload.notFoundCount,
        verificationRate: upload.totalRecords > 0 ? (upload.verifiedCount / upload.totalRecords) * 100 : 0,
        fileType: upload.fileType,
        columns: upload.columns
      });
    }

    const uploads = await storage.getUploads();
    if (uploads.length === 0) {
      return res.json({ total: 0, verified: 0, mismatch: 0, notFound: 0, verificationRate: 0 });
    }

    const latest = uploads[0];
    res.json({
      id: latest.id,
      total: latest.totalRecords,
      verified: latest.verifiedCount,
      mismatch: latest.mismatchCount,
      notFound: latest.notFoundCount,
      verificationRate: latest.totalRecords > 0 ? (latest.verifiedCount / latest.totalRecords) * 100 : 0,
      fileType: latest.fileType,
      columns: latest.columns
    });
  });

  // Analytics Charts
  app.get(api.analytics.charts.path, async (req, res) => {
    const uploadId = req.query.uploadId ? Number(req.query.uploadId) : undefined;
    let recordsList: any[] = [];

    if (uploadId) {
      recordsList = await storage.getAllRecordsByUploadId(uploadId);
    } else {
      const uploads = await storage.getUploads();
      if (uploads.length > 0) {
        recordsList = await storage.getAllRecordsByUploadId(uploads[0].id);
      }
    }

    // Process for charts
    const stateMap = new Map<string, { verified: number, mismatch: number, notFound: number }>();
    const districtMap = new Map<string, { total: number, verified: number }>();
    const dateMap = new Map<string, { count: number, verified: number }>();
    
    const upload = uploadId ? await storage.getUpload(uploadId) : (await storage.getUploads())[0];
    const uploadedColumns = (upload?.columns as string[]) || [];
    const ageColumns = uploadedColumns.filter(col => 
      col.includes('age') || col.includes('bio_age') || col.includes('demo_age')
    );
    const ageSums: Record<string, number> = {};
    ageColumns.forEach(col => ageSums[col] = 0);

    for (const r of recordsList) {
      const state = r.state || 'Unknown';
      const district = r.district || 'Unknown';
      const date = r.date || 'Unknown';
      
      // State
      if (!stateMap.has(state)) stateMap.set(state, { verified: 0, mismatch: 0, notFound: 0 });
      const sEntry = stateMap.get(state)!;
      if (r.status === 'Verified') sEntry.verified++;
      else if (r.status === 'Mismatch') sEntry.mismatch++;
      else sEntry.notFound++;
      
      // District
      if (!districtMap.has(district)) districtMap.set(district, { total: 0, verified: 0 });
      const dEntry = districtMap.get(district)!;
      dEntry.total++;
      if (r.status === 'Verified') dEntry.verified++;

      // Age Dynamic Summing
      ageColumns.forEach(col => {
        ageSums[col] += (r.originalData?.[col] || 0);
      });

      // Date
      if (!dateMap.has(date)) dateMap.set(date, { count: 0, verified: 0 });
      const dateEntry = dateMap.get(date)!;
      dateEntry.count++;
      if (r.status === 'Verified') dateEntry.verified++;
    }

    const stateDistribution = Array.from(stateMap.entries()).map(([state, counts]) => ({
      state, ...counts
    })).slice(0, 10); // Top 10

    const districtAnalysis = Array.from(districtMap.entries()).map(([district, counts]) => ({
      district,
      total: counts.total,
      verifiedRate: counts.total > 0 ? (counts.verified / counts.total) * 100 : 0
    })).sort((a, b) => b.total - a.total).slice(0, 10);

    function formatColumnName(col: string) {
      const nameMap: Record<string, string> = {
        'bio_age_5_17': 'Age 5-17 (Biometric)',
        'bio_age_17_': 'Age 17+ (Biometric)',
        'age_0_5': 'Age 0-5',
        'age_5_17': 'Age 5-17',
        'age_18_greater': 'Age 18+',
        'demo_age_5_17': 'Age 5-17 (Demographic)',
        'demo_age_17_': 'Age 17+ (Demographic)',
      };
      return nameMap[col] || col;
    }

    const ageDistribution = ageColumns.map(col => ({
      name: formatColumnName(col),
      value: ageSums[col]
    }));

    const temporalTrends = Array.from(dateMap.entries()).map(([date, counts]) => ({
      date, ...counts
    })).sort((a, b) => {
      const [d1, m1, y1] = a.date.split('-').map(Number);
      const [d2, m2, y2] = b.date.split('-').map(Number);
      return new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime();
    }).slice(0, 20); // Limit points

    res.json({
      stateDistribution,
      districtAnalysis,
      ageDistribution,
      temporalTrends
    });
  });

  // Insights
  app.get(api.analytics.insights.path, async (req, res) => {
    const uploadId = req.query.uploadId ? Number(req.query.uploadId) : undefined;
    const upload = uploadId ? await storage.getUpload(uploadId) : (await storage.getUploads())[0];
    
    if (!upload) {
      return res.json({
        topStates: [],
        dominantAgeGroup: "N/A",
        verificationRate: 0,
        dateRange: { start: new Date().toISOString(), end: new Date().toISOString() },
        anomalies: [],
        fileType: "None"
      });
    }

    const uploadedColumns = (upload.columns as string[]) || [];
    const ageColumns = uploadedColumns.filter(col => 
      col.includes('age') || col.includes('bio_age') || col.includes('demo_age')
    );

    function formatColumnName(col: string) {
      const nameMap: Record<string, string> = {
        'bio_age_5_17': '5-17 (Biometric)',
        'bio_age_17_': '17+ (Biometric)',
        'age_0_5': '0-5',
        'age_5_17': '5-17',
        'age_18_greater': '18+',
        'demo_age_5_17': '5-17 (Demographic)',
        'demo_age_17_': '17+ (Demographic)',
      };
      return nameMap[col] || col;
    }

    const fileTypeDisplay = {
      'biometric': 'Biometric Data',
      'enrollment': 'Enrollment Data',
      'demographic': 'Demographic Data',
      'unknown': 'Unknown Data'
    }[upload.fileType as string] || "Unknown Data";

    res.json({
      topStates: ["Maharashtra", "Karnataka", "Delhi"],
      dominantAgeGroup: ageColumns.length > 0 ? formatColumnName(ageColumns[0]) : "N/A",
      verificationRate: (upload.verifiedCount / upload.totalRecords) * 100,
      dateRange: { start: "2023-01-01", end: "2023-12-31" },
      anomalies: [`File Type: ${fileTypeDisplay}`, `Age groups in file: ${ageColumns.map(formatColumnName).join(", ")}`],
      fileType: fileTypeDisplay
    });
  });

  return httpServer;
}
