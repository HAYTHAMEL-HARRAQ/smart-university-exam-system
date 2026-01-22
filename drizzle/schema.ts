import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "proctor", "student"]).default("user").notNull(),
  department: varchar("department", { length: 255 }),
  studentId: varchar("studentId", { length: 64 }).unique(),
  profilePhotoUrl: text("profilePhotoUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Exams table - stores exam configurations
export const exams = mysqlTable("exams", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  courseCode: varchar("courseCode", { length: 64 }).notNull(),
  department: varchar("department", { length: 255 }).notNull(),
  description: text("description"),
  duration: int("duration").notNull(), // in minutes
  totalQuestions: int("totalQuestions"),
  maxScore: decimal("maxScore", { precision: 10, scale: 2 }),
  passingScore: decimal("passingScore", { precision: 10, scale: 2 }), // minimum score to pass
  scheduledAt: timestamp("scheduledAt").notNull(),
  endAt: timestamp("endAt"),
  status: mysqlEnum("status", ["draft", "scheduled", "active", "completed", "cancelled"]).default("draft").notNull(),
  detectionSensitivity: mysqlEnum("detectionSensitivity", ["low", "medium", "high"]).default("medium").notNull(),
  requiresBiometric: boolean("requiresBiometric").default(true).notNull(),
  allowedDevices: json("allowedDevices"), // JSON array of allowed device types
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"), // soft delete
});

export type Exam = typeof exams.$inferSelect;
export type InsertExam = typeof exams.$inferInsert;

// Exam sessions - tracks individual student exam attempts
export const examSessions = mysqlTable("examSessions", {
  id: int("id").autoincrement().primaryKey(),
  examId: int("examId").notNull(),
  studentId: int("studentId").notNull(),
  startedAt: timestamp("startedAt").notNull(),
  endedAt: timestamp("endedAt"),
  submittedAt: timestamp("submittedAt"),
  status: mysqlEnum("status", ["not_started", "in_progress", "submitted", "paused", "abandoned", "flagged"]).default("not_started").notNull(),
  biometricVerified: boolean("biometricVerified").default(false).notNull(),
  biometricVerifiedAt: timestamp("biometricVerifiedAt"),
  score: decimal("score", { precision: 10, scale: 2 }),
  percentageScore: decimal("percentageScore", { precision: 5, scale: 2 }), // 0-100%
  passed: boolean("passed"), // derived from score vs passingScore
  videoRecordingUrl: text("videoRecordingUrl"),
  videoMetadata: json("videoMetadata"), // stores video duration, size, etc.
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  suspiciousActivityCount: int("suspiciousActivityCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExamSession = typeof examSessions.$inferSelect;
export type InsertExamSession = typeof examSessions.$inferInsert;

// AI-generated alerts for suspicious activities
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  alertType: mysqlEnum("alertType", [
    "phone_detected",
    "multiple_faces",
    "off_screen_gaze",
    "suspicious_audio",
    "unauthorized_person",
    "unusual_behavior",
    "network_anomaly",
    "other"
  ]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  confidenceScore: decimal("confidenceScore", { precision: 5, scale: 2 }).notNull(), // 0-100
  description: text("description"),
  videoClipUrl: text("videoClipUrl"),
  videoClipStartTime: int("videoClipStartTime"), // timestamp in seconds
  videoClipDuration: int("videoClipDuration"), // duration in seconds
  metadata: json("metadata"), // additional detection data
  acknowledged: boolean("acknowledged").default(false).notNull(),
  acknowledgedBy: int("acknowledgedBy"),
  acknowledgedAt: timestamp("acknowledgedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"), // soft delete for archiving
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

// Incidents - formal records of confirmed cheating or violations
export const incidents = mysqlTable("incidents", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  incidentType: mysqlEnum("incidentType", [
    "cheating_confirmed",
    "unauthorized_assistance",
    "technical_violation",
    "false_positive",
    "other"
  ]).notNull(),
  severity: mysqlEnum("severity", ["minor", "moderate", "major", "critical"]).default("moderate").notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["pending", "investigating", "resolved", "appealed", "dismissed"]).default("pending").notNull(),
  reportedBy: int("reportedBy").notNull(),
  investigatedBy: int("investigatedBy"),
  resolution: text("resolution"),
  recommendedAction: varchar("recommendedAction", { length: 255 }),
  evidenceUrls: json("evidenceUrls"), // array of video clip URLs
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
  deletedAt: timestamp("deletedAt"), // soft delete for archiving
});

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

// Video evidence storage metadata
export const videoEvidence = mysqlTable("videoEvidence", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  alertId: int("alertId"),
  incidentId: int("incidentId"),
  videoUrl: text("videoUrl").notNull(),
  fileSize: int("fileSize"), // in bytes
  duration: int("duration"), // in seconds
  startTime: int("startTime"), // timestamp in seconds from session start
  endTime: int("endTime"),
  contentType: varchar("contentType", { length: 64 }).default("video/mp4").notNull(),
  storageKey: varchar("storageKey", { length: 512 }).notNull(), // S3 key
  retentionDays: int("retentionDays").default(90).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VideoEvidence = typeof videoEvidence.$inferSelect;
export type InsertVideoEvidence = typeof videoEvidence.$inferInsert;

// Analytics aggregation table for fraud trends
export const fraudAnalytics = mysqlTable("fraudAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  examId: int("examId"),
  courseCode: varchar("courseCode", { length: 64 }),
  department: varchar("department", { length: 255 }),
  period: varchar("period", { length: 32 }), // e.g., "2024-01"
  totalExamSessions: int("totalExamSessions").default(0).notNull(),
  flaggedSessions: int("flaggedSessions").default(0).notNull(),
  confirmedIncidents: int("confirmedIncidents").default(0).notNull(),
  dismissedIncidents: int("dismissedIncidents").default(0).notNull(),
  fraudRate: decimal("fraudRate", { precision: 5, scale: 2 }).default("0.00").notNull(), // percentage
  commonAlertTypes: json("commonAlertTypes"), // top alert types with counts
  averageConfidenceScore: decimal("averageConfidenceScore", { precision: 5, scale: 2 }),
  averageSessionScore: decimal("averageSessionScore", { precision: 5, scale: 2 }),
  passRate: decimal("passRate", { precision: 5, scale: 2 }), // percentage of students who passed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Audit Log Table - Track all important actions
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 255 }).notNull(), // e.g., "incident_resolved", "exam_created"
  entityType: varchar("entityType", { length: 64 }), // e.g., "exam", "incident", "user"
  entityId: int("entityId"),
  oldValue: json("oldValue"), // previous value
  newValue: json("newValue"), // new value
  description: text("description"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;