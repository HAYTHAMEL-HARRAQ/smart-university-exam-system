import { eq, and, desc, gte, lte, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  exams, examSessions, alerts, incidents, videoEvidence, fraudAnalytics,
  Exam, ExamSession, Alert, Incident, VideoEvidence
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { getDatabaseAdapter, DatabaseAdapter } from './databaseAdapter';

// Use the database adapter for all operations
export async function getDb(): Promise<DatabaseAdapter> {
  return await getDatabaseAdapter();
}

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  return await db.upsertUser(user);
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  return await db.getUserByOpenId(openId);
}

export async function updateUserRole(userId: number, role: 'user' | 'admin' | 'proctor' | 'student') {
  const db = await getDb();
  return await db.updateUserRole(userId, role);
}

// ===== EXAM OPERATIONS =====

export async function createExam(exam: typeof exams.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.createExam(exam);
}

export async function getExamById(examId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  return await db.getExamById(examId);
}

export async function listExams(status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.listExams(status);
}

// ===== EXAM SESSION OPERATIONS =====

export async function getActiveExamSessions() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.getActiveExamSessions();
}

export async function createExamSession(session: typeof examSessions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.createExamSession(session);
}

export async function getExamSessionById(sessionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  return await db.getExamSessionById(sessionId);
}

export async function updateExamSession(sessionId: number, updates: Partial<ExamSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.updateExamSession(sessionId, updates);
}

export async function getStudentExamSessions(studentId: number, examId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.getStudentExamSessions(studentId, examId);
}

// ===== ALERT OPERATIONS =====

export async function createAlert(alert: typeof alerts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.createAlert(alert);
}

export async function getAlertById(alertId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  return await db.getAlertById(alertId);
}

export async function getSessionAlerts(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.getSessionAlerts(sessionId);
}

export async function acknowledgeAlert(alertId: number, acknowledgedBy: number, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.acknowledgeAlert(alertId, acknowledgedBy, notes);
}

export async function getUnacknowledgedAlerts(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.getUnacknowledgedAlerts(limit);
}

// ===== INCIDENT OPERATIONS =====

export async function createIncident(incident: typeof incidents.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.createIncident(incident);
}

export async function getIncidentById(incidentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  return await db.getIncidentById(incidentId);
}

export async function getSessionIncidents(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.getSessionIncidents(sessionId);
}

export async function updateIncident(incidentId: number, updates: Partial<Incident>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.updateIncident(incidentId, updates);
}

export async function listIncidents(status?: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.listIncidents(status, limit);
}

// ===== VIDEO EVIDENCE OPERATIONS =====

export async function createVideoEvidence(evidence: typeof videoEvidence.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.createVideoEvidence(evidence);
}

export async function getSessionVideoEvidence(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.getSessionVideoEvidence(sessionId);
}

export async function getAlertVideoEvidence(alertId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.getAlertVideoEvidence(alertId);
}

// ===== FRAUD ANALYTICS OPERATIONS =====

export async function createOrUpdateFraudAnalytics(analytics: typeof fraudAnalytics.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.createOrUpdateFraudAnalytics(analytics);
}

export async function getFraudAnalyticsByPeriod(period: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.getFraudAnalyticsByPeriod(period);
}

export async function getFraudAnalyticsByCourse(courseCode: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.getFraudAnalyticsByCourse(courseCode);
}

export async function getFraudAnalyticsByDepartment(department: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.getFraudAnalyticsByDepartment(department);
}
