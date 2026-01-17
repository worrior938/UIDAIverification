import { db } from "./db";
import { uploads, records, type Upload, type InsertUpload, type Record, type InsertRecord } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Uploads
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUpload(id: number): Promise<Upload | undefined>;
  getUploads(): Promise<Upload[]>;
  
  // Records
  createRecords(recordsList: InsertRecord[]): Promise<Record[]>;
  getRecordsByUploadId(uploadId: number, limit?: number, offset?: number): Promise<{ records: Record[], total: number }>;
  getAllRecordsByUploadId(uploadId: number): Promise<Record[]>;
  
  // Stats
  getUploadStats(uploadId: number): Promise<{ verified: number, mismatch: number, notFound: number, total: number }>;
}

export class DatabaseStorage implements IStorage {
  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const [upload] = await db.insert(uploads).values(insertUpload).returning();
    return upload;
  }

  async getUpload(id: number): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload;
  }

  async getUploads(): Promise<Upload[]> {
    return await db.select().from(uploads).orderBy(desc(uploads.uploadDate));
  }

  async createRecords(recordsList: InsertRecord[]): Promise<Record[]> {
    if (recordsList.length === 0) return [];
    
    const BATCH_SIZE = 1000;
    const allInserted: Record[] = [];
    
    for (let i = 0; i < recordsList.length; i += BATCH_SIZE) {
      const batch = recordsList.slice(i, i + BATCH_SIZE);
      const inserted = await db.insert(records).values(batch).returning();
      allInserted.push(...inserted);
    }
    
    return allInserted;
  }

  async getRecordsByUploadId(uploadId: number, limit: number = 50, offset: number = 0): Promise<{ records: Record[], total: number }> {
    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(records).where(eq(records.uploadId, uploadId));
    const total = Number(countResult.count);
    
    const rows = await db.select()
      .from(records)
      .where(eq(records.uploadId, uploadId))
      .limit(limit)
      .offset(offset);
      
    return { records: rows, total };
  }

  async getAllRecordsByUploadId(uploadId: number): Promise<Record[]> {
    return await db.select().from(records).where(eq(records.uploadId, uploadId));
  }

  async getUploadStats(uploadId: number): Promise<{ verified: number, mismatch: number, notFound: number, total: number }> {
    const upload = await this.getUpload(uploadId);
    if (!upload) return { verified: 0, mismatch: 0, notFound: 0, total: 0 };
    return {
      verified: upload.verifiedCount,
      mismatch: upload.mismatchCount,
      notFound: upload.notFoundCount,
      total: upload.totalRecords
    };
  }
}

export const storage = new DatabaseStorage();
