import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  totalRecords: integer("total_records").notNull(),
  verifiedCount: integer("verified_count").notNull(),
  mismatchCount: integer("mismatch_count").notNull(),
  notFoundCount: integer("not_found_count").notNull(),
  uploadDate: timestamp("upload_date").defaultNow(),
});

export const records = pgTable("records", {
  id: serial("id").primaryKey(),
  uploadId: integer("upload_id").references(() => uploads.id).notNull(),
  // Core data fields from CSV
  date: text("date"), // Keeping as text to handle various formats from CSV
  state: text("state"),
  district: text("district"),
  pincode: text("pincode"),
  // Aadhaar aggregated demographic data
  age_0_5: integer("age_0_5").default(0),
  age_5_17: integer("age_5_17").default(0),
  age_18_greater: integer("age_18_greater").default(0),
  // Demographic dataset specific
  demo_age_5_17: integer("demo_age_5_17").default(0),
  demo_age_17_greater: integer("demo_age_17_greater").default(0),
  // Biometric dataset specific
  bio_age_5_17: integer("bio_age_5_17").default(0),
  bio_age_17_greater: integer("bio_age_17_greater").default(0),
  // Verification results
  status: text("status").notNull(), // 'Verified', 'Mismatch', 'NotFound'
  details: text("details"), // JSON string or text description of what failed
  originalData: jsonb("original_data"), // Store full row data
});

export const insertUploadSchema = createInsertSchema(uploads).omit({ id: true, uploadDate: true });
export const insertRecordSchema = createInsertSchema(records).omit({ id: true });

export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type Record = typeof records.$inferSelect;
export type InsertRecord = z.infer<typeof insertRecordSchema>;

export type VerificationStats = {
  total: number;
  verified: number;
  mismatch: number;
  notFound: number;
  verificationRate: number;
};

export type StateDistribution = {
  state: string;
  verified: number;
  mismatch: number;
  notFound: number;
}[];

export type DistrictAnalysis = {
  district: string;
  total: number;
  verifiedRate: number;
}[];

export type InsightsData = {
  topStates: string[];
  dominantAgeGroup: string;
  verificationRate: number;
  dateRange: { start: string; end: string };
  anomalies: string[];
};
