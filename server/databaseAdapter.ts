import { eq, and, desc, gte, lte, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  exams, examSessions, alerts, incidents, videoEvidence, fraudAnalytics,
  Exam, ExamSession, Alert, Incident, VideoEvidence
} from "../drizzle/schema";
import { ENV } from './_core/env';

// Database adapter interface
interface DatabaseAdapter {
  upsertUser(user: InsertUser): Promise<void>;
  getUserByOpenId(openId: string): Promise<any>;
  updateUserRole(userId: number, role: 'user' | 'admin' | 'proctor' | 'student'): Promise<any>;
  
  createExam(exam: typeof exams.$inferInsert): Promise<any>;
  getExamById(examId: number): Promise<any>;
  listExams(status?: string): Promise<any[]>;
  
  getActiveExamSessions(): Promise<any[]>;
  createExamSession(session: typeof examSessions.$inferInsert): Promise<any>;
  getExamSessionById(sessionId: number): Promise<any>;
  updateExamSession(sessionId: number, updates: Partial<ExamSession>): Promise<any>;
  getStudentExamSessions(studentId: number, examId?: number): Promise<any[]>;
  
  createAlert(alert: typeof alerts.$inferInsert): Promise<any>;
  getAlertById(alertId: number): Promise<any>;
  getSessionAlerts(sessionId: number): Promise<any[]>;
  acknowledgeAlert(alertId: number, acknowledgedBy: number, notes?: string): Promise<any>;
  getUnacknowledgedAlerts(limit?: number): Promise<any[]>;
  
  createIncident(incident: typeof incidents.$inferInsert): Promise<any>;
  getIncidentById(incidentId: number): Promise<any>;
  getSessionIncidents(sessionId: number): Promise<any[]>;
  updateIncident(incidentId: number, updates: Partial<Incident>): Promise<any>;
  listIncidents(status?: string, limit?: number): Promise<any[]>;
  
  createVideoEvidence(evidence: typeof videoEvidence.$inferInsert): Promise<any>;
  getSessionVideoEvidence(sessionId: number): Promise<any[]>;
  getAlertVideoEvidence(alertId: number): Promise<any[]>;
  
  createOrUpdateFraudAnalytics(analytics: typeof fraudAnalytics.$inferInsert): Promise<any>;
  getFraudAnalyticsByPeriod(period: string): Promise<any[]>;
  getFraudAnalyticsByCourse(courseCode: string): Promise<any[]>;
  getFraudAnalyticsByDepartment(department: string): Promise<any[]>;
}

// MySQL adapter implementation
class MySQLAdapter implements DatabaseAdapter {
  private db: any;

  constructor() {
    if (process.env.DATABASE_URL) {
      this.db = drizzle(process.env.DATABASE_URL);
    }
  }

  async upsertUser(user: InsertUser): Promise<void> {
    if (!user.openId) {
      throw new Error("User openId is required for upsert");
    }

    if (!this.db) {
      console.warn("[MySQL] Cannot upsert user: database not available");
      return;
    }

    try {
      const values: InsertUser = {
        openId: user.openId,
      };
      const updateSet: Record<string, unknown> = {};

      const textFields = ["name", "email", "loginMethod", "department", "studentId", "profilePhotoUrl"] as const;
      type TextField = (typeof textFields)[number];

      const assignNullable = (field: TextField) => {
        const value = user[field];
        if (value === undefined) return;
        const normalized = value ?? null;
        values[field] = normalized;
        updateSet[field] = normalized;
      };

      textFields.forEach(assignNullable);

      if (user.lastSignedIn !== undefined) {
        values.lastSignedIn = user.lastSignedIn;
        updateSet.lastSignedIn = user.lastSignedIn;
      }
      if (user.role !== undefined) {
        values.role = user.role;
        updateSet.role = user.role;
      } else if (user.openId === ENV.ownerOpenId) {
        values.role = 'admin';
        updateSet.role = 'admin';
      }

      if (!values.lastSignedIn) {
        values.lastSignedIn = new Date();
      }

      if (Object.keys(updateSet).length === 0) {
        updateSet.lastSignedIn = new Date();
      }

      await this.db.insert(users).values(values).onDuplicateKeyUpdate({
        set: updateSet,
      });
    } catch (error) {
      console.error("[MySQL] Failed to upsert user:", error);
      throw error;
    }
  }

  async getUserByOpenId(openId: string) {
    if (!this.db) {
      console.warn("[MySQL] Cannot get user: database not available");
      return undefined;
    }

    const result = await this.db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async updateUserRole(userId: number, role: 'user' | 'admin' | 'proctor' | 'student') {
    if (!this.db) throw new Error("MySQL Database not available");
    
    return await this.db.update(users).set({ role }).where(eq(users.id, userId));
  }

  // Exam operations
  async createExam(exam: typeof exams.$inferInsert) {
    if (!this.db) throw new Error("MySQL Database not available");
    
    const result = await this.db.insert(exams).values(exam);
    return result;
  }

  async getExamById(examId: number) {
    if (!this.db) return undefined;
    
    const result = await this.db.select().from(exams).where(eq(exams.id, examId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async listExams(status?: string) {
    if (!this.db) return [];
    
    const conditions = status ? [eq(exams.status, status as any)] : [];
    return await this.db.select().from(exams).where(conditions.length > 0 ? and(...conditions) : undefined);
  }

  // Exam session operations
  async getActiveExamSessions() {
    if (!this.db) return [];
    
    return await this.db.select().from(examSessions)
      .where(and(
        eq(examSessions.status, 'in_progress'),
        isNull(examSessions.endedAt)
      ))
      .orderBy(desc(examSessions.startedAt));
  }

  async createExamSession(session: typeof examSessions.$inferInsert) {
    if (!this.db) throw new Error("MySQL Database not available");
    
    const result = await this.db.insert(examSessions).values(session);
    return result;
  }

  async getExamSessionById(sessionId: number) {
    if (!this.db) return undefined;
    
    const result = await this.db.select().from(examSessions).where(eq(examSessions.id, sessionId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async updateExamSession(sessionId: number, updates: Partial<ExamSession>) {
    if (!this.db) throw new Error("MySQL Database not available");
    
    return await this.db.update(examSessions).set(updates).where(eq(examSessions.id, sessionId));
  }

  async getStudentExamSessions(studentId: number, examId?: number) {
    if (!this.db) return [];
    
    const conditions = [eq(examSessions.studentId, studentId)];
    if (examId) conditions.push(eq(examSessions.examId, examId));
    
    return await this.db.select().from(examSessions).where(and(...conditions)).orderBy(desc(examSessions.createdAt));
  }

  // Alert operations
  async createAlert(alert: typeof alerts.$inferInsert) {
    if (!this.db) throw new Error("MySQL Database not available");
    
    const result = await this.db.insert(alerts).values(alert);
    return result;
  }

  async getAlertById(alertId: number) {
    if (!this.db) return undefined;
    
    const result = await this.db.select().from(alerts).where(eq(alerts.id, alertId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getSessionAlerts(sessionId: number) {
    if (!this.db) return [];
    
    return await this.db.select().from(alerts).where(eq(alerts.sessionId, sessionId)).orderBy(desc(alerts.createdAt));
  }

  async acknowledgeAlert(alertId: number, acknowledgedBy: number, notes?: string) {
    if (!this.db) throw new Error("MySQL Database not available");
    
    return await this.db.update(alerts).set({
      acknowledged: true,
      acknowledgedBy,
      acknowledgedAt: new Date(),
      notes
    }).where(eq(alerts.id, alertId));
  }

  async getUnacknowledgedAlerts(limit = 50) {
    if (!this.db) return [];
    
    return await this.db.select().from(alerts)
      .where(eq(alerts.acknowledged, false))
      .orderBy(desc(alerts.severity), desc(alerts.createdAt))
      .limit(limit);
  }

  // Incident operations
  async createIncident(incident: typeof incidents.$inferInsert) {
    if (!this.db) throw new Error("MySQL Database not available");
    
    const result = await this.db.insert(incidents).values(incident);
    return result;
  }

  async getIncidentById(incidentId: number) {
    if (!this.db) return undefined;
    
    const result = await this.db.select().from(incidents).where(eq(incidents.id, incidentId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getSessionIncidents(sessionId: number) {
    if (!this.db) return [];
    
    return await this.db.select().from(incidents).where(eq(incidents.sessionId, sessionId));
  }

  async updateIncident(incidentId: number, updates: Partial<Incident>) {
    if (!this.db) throw new Error("MySQL Database not available");
    
    return await this.db.update(incidents).set(updates).where(eq(incidents.id, incidentId));
  }

  async listIncidents(status?: string, limit = 50) {
    if (!this.db) return [];
    
    const conditions = status ? [eq(incidents.status, status as any)] : [];
    return await this.db.select().from(incidents)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(incidents.createdAt))
      .limit(limit);
  }

  // Video evidence operations
  async createVideoEvidence(evidence: typeof videoEvidence.$inferInsert) {
    if (!this.db) throw new Error("MySQL Database not available");
    
    const result = await this.db.insert(videoEvidence).values(evidence);
    return result;
  }

  async getSessionVideoEvidence(sessionId: number) {
    if (!this.db) return [];
    
    return await this.db.select().from(videoEvidence).where(eq(videoEvidence.sessionId, sessionId));
  }

  async getAlertVideoEvidence(alertId: number) {
    if (!this.db) return [];
    
    return await this.db.select().from(videoEvidence).where(eq(videoEvidence.alertId, alertId));
  }

  // Fraud analytics operations
  async createOrUpdateFraudAnalytics(analytics: typeof fraudAnalytics.$inferInsert) {
    if (!this.db) throw new Error("MySQL Database not available");
    
    // Upsert pattern
    const existing = await this.db.select().from(fraudAnalytics)
      .where(and(
        eq(fraudAnalytics.period, analytics.period || ''),
        eq(fraudAnalytics.courseCode, analytics.courseCode || '')
      ))
      .limit(1);
    
    if (existing.length > 0) {
      return await this.db.update(fraudAnalytics).set(analytics).where(eq(fraudAnalytics.id, existing[0].id));
    } else {
      return await this.db.insert(fraudAnalytics).values(analytics);
    }
  }

  async getFraudAnalyticsByPeriod(period: string) {
    if (!this.db) return [];
    
    return await this.db.select().from(fraudAnalytics).where(eq(fraudAnalytics.period, period));
  }

  async getFraudAnalyticsByCourse(courseCode: string) {
    if (!this.db) return [];
    
    return await this.db.select().from(fraudAnalytics).where(eq(fraudAnalytics.courseCode, courseCode));
  }

  async getFraudAnalyticsByDepartment(department: string) {
    if (!this.db) return [];
    
    return await this.db.select().from(fraudAnalytics).where(eq(fraudAnalytics.department, department));
  }
}

import * as oracledb from 'oracledb';

// Oracle adapter implementation
class OracleAdapter implements DatabaseAdapter {
  private pool: any;
  private isAvailable: boolean = false;

  constructor() {
    // Check if oracledb is properly loaded
    if (typeof oracledb.createPool === 'function') {
      this.initializePool();
      this.isAvailable = true;
    } else {
      console.warn('[Oracle] Oracle client not available, falling back to MySQL');
      this.isAvailable = false;
    }
  }

  private async initializePool() {
    try {
      this.pool = await oracledb.createPool({
        user: process.env.ORACLE_USER || 'exam_system',
        password: process.env.ORACLE_PASSWORD || 'oracle_password',
        connectString: process.env.ORACLE_CONNECT_STRING || `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_DB}` || 'localhost:1521/XEPDB1',
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 1,
      });
      console.log('[Oracle] Connection pool created successfully');
    } catch (error) {
      console.error('[Oracle] Failed to create connection pool:', error);
      this.isAvailable = false;
    }
  }

  private async getConnection() {
    if (!this.pool) {
      throw new Error('Oracle pool not initialized');
    }
    return await this.pool.getConnection();
  }

  private async executeQuery(query: string, binds: any[] = []) {
    if (!this.isAvailable) {
      console.error('[Oracle] Oracle not available, using MySQL fallback');
      throw new Error('Oracle not available');
    }
    
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return result;
    } finally {
      await connection.close();
    }
  }

  async upsertUser(user: InsertUser): Promise<void> {
    console.log('[Oracle] Using Oracle database connection');
    if (!this.isAvailable) {
      console.error('[Oracle] Oracle not available, operation failed');
      throw new Error('Oracle not available');
    }
    
    if (!user.openId) {
      throw new Error("User openId is required for upsert");
    }

    try {
      // Check if user exists
      const checkQuery = `SELECT id FROM users WHERE open_id = :openId`;
      const checkResult = await this.executeQuery(checkQuery, [user.openId]);

      if (checkResult.rows.length > 0) {
        // Update existing user
        const updateQuery = `UPDATE users SET 
          name = :name,
          email = :email,
          role = :role,
          login_method = :loginMethod,
          department = :department,
          student_id = :studentId,
          profile_photo_url = :profilePhotoUrl,
          last_signed_in = :lastSignedIn,
          updated_at = CURRENT_TIMESTAMP
          WHERE open_id = :openId`;
          
        await this.executeQuery(updateQuery, [
          user.name || null,
          user.email || null,
          user.role || 'user',
          user.loginMethod || null,
          user.department || null,
          user.studentId || null,
          user.profilePhotoUrl || null,
          user.lastSignedIn || new Date(),
          user.openId
        ]);
      } else {
        // Insert new user
        const insertQuery = `INSERT INTO users (open_id, name, email, role, login_method, department, student_id, profile_photo_url, last_signed_in, created_at, updated_at) 
          VALUES (:openId, :name, :email, :role, :loginMethod, :department, :studentId, :profilePhotoUrl, :lastSignedIn, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
          
        await this.executeQuery(insertQuery, [
          user.openId,
          user.name || null,
          user.email || null,
          user.role || 'user',
          user.loginMethod || null,
          user.department || null,
          user.studentId || null,
          user.profilePhotoUrl || null,
          user.lastSignedIn || new Date()
        ]);
      }
    } catch (error) {
      console.error("[Oracle] Failed to upsert user:", error);
      throw error;
    }
  }

  async getUserByOpenId(openId: string) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `SELECT * FROM users WHERE open_id = :openId`;
      const result = await this.executeQuery(query, [openId]);
      
      if (result.rows.length > 0) {
        // Map Oracle result to user object
        const row = result.rows[0];
        return {
          id: row.ID,
          openId: row.OPEN_ID,
          name: row.NAME,
          email: row.EMAIL,
          role: row.ROLE,
          loginMethod: row.LOGIN_METHOD,
          department: row.DEPARTMENT,
          studentId: row.STUDENT_ID,
          profilePhotoUrl: row.PROFILE_PHOTO_URL,
          lastSignedIn: row.LAST_SIGNED_IN,
          createdAt: row.CREATED_AT,
          updatedAt: row.UPDATED_AT,
        };
      }
      return undefined;
    } catch (error) {
      console.error("[Oracle] Failed to get user by openId:", error);
      return undefined;
    }
  }

  async updateUserRole(userId: number, role: 'user' | 'admin' | 'proctor' | 'student') {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `UPDATE users SET role = :role, updated_at = CURRENT_TIMESTAMP WHERE id = :id`;
      const result = await this.executeQuery(query, [role, userId]);
      return result;
    } catch (error) {
      console.error("[Oracle] Failed to update user role:", error);
      throw error;
    }
  }

  // Exam operations
  async createExam(exam: typeof exams.$inferInsert) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `INSERT INTO exams (title, course_code, department, description, duration, total_questions, max_score, passing_score, scheduled_at, end_at, status, detection_sensitivity, requires_biometric, allowed_devices, created_by, created_at, updated_at) 
        VALUES (:title, :courseCode, :department, :description, :duration, :totalQuestions, :maxScore, :passingScore, :scheduledAt, :endAt, :status, :detectionSensitivity, :requiresBiometric, :allowedDevices, :createdBy, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
      
      const result = await this.executeQuery(query, [
        exam.title,
        exam.courseCode,
        exam.department,
        exam.description,
        exam.duration,
        exam.totalQuestions,
        exam.maxScore,
        exam.passingScore,
        exam.scheduledAt,
        exam.endAt,
        exam.status,
        exam.detectionSensitivity,
        exam.requiresBiometric,
        exam.allowedDevices,
        exam.createdBy
      ]);
      
      return result;
    } catch (error) {
      console.error("[Oracle] Failed to create exam:", error);
      throw error;
    }
  }

  async getExamById(examId: number) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `SELECT * FROM exams WHERE id = :id`;
      const result = await this.executeQuery(query, [examId]);
      
      if (result.rows.length > 0) {
        const row: any = result.rows[0];
        return {
          id: row.ID,
          title: row.TITLE,
          courseCode: row.COURSE_CODE,
          department: row.DEPARTMENT,
          description: row.DESCRIPTION,
          duration: row.DURATION,
          totalQuestions: row.TOTAL_QUESTIONS,
          maxScore: row.MAX_SCORE,
          passingScore: row.PASSING_SCORE,
          scheduledAt: row.SCHEDULED_AT,
          endAt: row.END_AT,
          status: row.STATUS,
          detectionSensitivity: row.DETECTION_SENSITIVITY,
          requiresBiometric: row.REQUIRES_BIOMETRIC,
          allowedDevices: row.ALLOWED_DEVICES,
          createdBy: row.CREATED_BY,
          createdAt: row.CREATED_AT,
          updatedAt: row.UPDATED_AT,
          deletedAt: row.DELETED_AT,
        };
      }
      return undefined;
    } catch (error) {
      console.error("[Oracle] Failed to get exam by ID:", error);
      return undefined;
    }
  }

  async listExams(status?: string) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      let query = `SELECT * FROM exams`;
      const binds: any[] = [];
      
      if (status) {
        query += ` WHERE status = :status`;
        binds.push(status);
      }
      
      query += ` ORDER BY created_at DESC`;
      
      const result = await this.executeQuery(query, binds);
      
      return result.rows.map((row: any) => ({
        id: row.ID,
        title: row.TITLE,
        description: row.DESCRIPTION,
        courseCode: row.COURSE_CODE,
        courseName: row.COURSE_NAME,
        date: row.DATE,
        startTime: row.START_TIME,
        endTime: row.END_TIME,
        duration: row.DURATION,
        status: row.STATUS,
        createdBy: row.CREATED_BY,
        createdAt: row.CREATED_AT,
        updatedAt: row.UPDATED_AT,
      }));
    } catch (error) {
      console.error("[Oracle] Failed to list exams:", error);
      return [];
    }
  }

  // Exam session operations
  async getActiveExamSessions() {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `SELECT * FROM exam_sessions WHERE status = 'in_progress' AND ended_at IS NULL ORDER BY started_at DESC`;
      const result = await this.executeQuery(query);
      
      return result.rows.map((row: any) => ({
        id: row.ID,
        examId: row.EXAM_ID,
        studentId: row.STUDENT_ID,
        proctorId: row.PROCTOR_ID,
        status: row.STATUS,
        startedAt: row.STARTED_AT,
        endedAt: row.ENDED_AT,
        createdAt: row.CREATED_AT,
        updatedAt: row.UPDATED_AT,
      }));
    } catch (error) {
      console.error("[Oracle] Failed to get active exam sessions:", error);
      return [];
    }
  }

  async createExamSession(session: typeof examSessions.$inferInsert) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `INSERT INTO examSessions (examId, studentId, startedAt, endedAt, submittedAt, status, biometricVerified, biometricVerifiedAt, score, percentageScore, passed, videoRecordingUrl, videoMetadata, ipAddress, userAgent, suspiciousActivityCount, createdAt, updatedAt) 
        VALUES (:examId, :studentId, :startedAt, :endedAt, :submittedAt, :status, :biometricVerified, :biometricVerifiedAt, :score, :percentageScore, :passed, :videoRecordingUrl, :videoMetadata, :ipAddress, :userAgent, :suspiciousActivityCount, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
      
      const result = await this.executeQuery(query, [
        session.examId,
        session.studentId,
        session.startedAt,
        session.endedAt,
        session.submittedAt,
        session.status,
        session.biometricVerified,
        session.biometricVerifiedAt,
        session.score,
        session.percentageScore,
        session.passed,
        session.videoRecordingUrl,
        session.videoMetadata,
        session.ipAddress,
        session.userAgent,
        session.suspiciousActivityCount
      ]);
      
      return result;
    } catch (error) {
      console.error("[Oracle] Failed to create exam session:", error);
      throw error;
    }
  }

  async getExamSessionById(sessionId: number) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `SELECT * FROM exam_sessions WHERE id = :id`;
      const result = await this.executeQuery(query, [sessionId]);
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.ID,
          examId: row.EXAM_ID,
          studentId: row.STUDENT_ID,
          proctorId: row.PROCTOR_ID,
          status: row.STATUS,
          startedAt: row.STARTED_AT,
          endedAt: row.ENDED_AT,
          createdAt: row.CREATED_AT,
          updatedAt: row.UPDATED_AT,
        };
      }
      return undefined;
    } catch (error) {
      console.error("[Oracle] Failed to get exam session by ID:", error);
      return undefined;
    }
  }

  async updateExamSession(sessionId: number, updates: Partial<ExamSession>) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      // Build dynamic update query
      const fields = Object.keys(updates);
      if (fields.length === 0) return null;
      
      const setParts = fields.map(field => {
        // Convert camelCase to UPPER_SNAKE_CASE for Oracle
        const oracleField = field.replace(/([A-Z])/g, '_$1').toUpperCase();
        return `${oracleField} = :${field}`;
      });
      
      const query = `UPDATE exam_sessions SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = :sessionId`;
      
      const binds: any = { ...updates, sessionId };
      
      const result = await this.executeQuery(query, Object.values(binds));
      return result;
    } catch (error) {
      console.error("[Oracle] Failed to update exam session:", error);
      throw error;
    }
  }

  async getStudentExamSessions(studentId: number, examId?: number) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      let query = `SELECT * FROM exam_sessions WHERE student_id = :studentId`;
      const binds: any[] = [studentId];
      
      if (examId) {
        query += ` AND exam_id = :examId`;
        binds.push(examId);
      }
      
      query += ` ORDER BY created_at DESC`;
      
      const result = await this.executeQuery(query, binds);
      
      return result.rows.map((row: any) => ({
        id: row.ID,
        examId: row.EXAM_ID,
        studentId: row.STUDENT_ID,
        proctorId: row.PROCTOR_ID,
        status: row.STATUS,
        startedAt: row.STARTED_AT,
        endedAt: row.ENDED_AT,
        createdAt: row.CREATED_AT,
        updatedAt: row.UPDATED_AT,
      }));
    } catch (error) {
      console.error("[Oracle] Failed to get student exam sessions:", error);
      return [];
    }
  }

  // Alert operations
  async createAlert(alert: typeof alerts.$inferInsert) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `INSERT INTO alerts (sessionId, alertType, severity, confidenceScore, description, videoClipUrl, videoClipStartTime, videoClipDuration, metadata, acknowledged, acknowledgedBy, acknowledgedAt, notes, createdAt, updatedAt, deletedAt) 
        VALUES (:sessionId, :alertType, :severity, :confidenceScore, :description, :videoClipUrl, :videoClipStartTime, :videoClipDuration, :metadata, :acknowledged, :acknowledgedBy, :acknowledgedAt, :notes, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, :deletedAt)`;
      
      const result = await this.executeQuery(query, [
        alert.sessionId,
        alert.alertType,
        alert.severity,
        alert.confidenceScore,
        alert.description,
        alert.videoClipUrl,
        alert.videoClipStartTime,
        alert.videoClipDuration,
        alert.metadata,
        alert.acknowledged,
        alert.acknowledgedBy,
        alert.acknowledgedAt,
        alert.notes,
        alert.deletedAt
      ]);
      
      return result;
    } catch (error) {
      console.error("[Oracle] Failed to create alert:", error);
      throw error;
    }
  }

  async getAlertById(alertId: number) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `SELECT * FROM alerts WHERE id = :id`;
      const result = await this.executeQuery(query, [alertId]);
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.ID,
          sessionId: row.SESSION_ID,
          type: row.TYPE,
          message: row.MESSAGE,
          severity: row.SEVERITY,
          acknowledged: row.ACKNOWLEDGED,
          acknowledgedBy: row.ACKNOWLEDGED_BY,
          acknowledgedAt: row.ACKNOWLEDGED_AT,
          notes: row.NOTES,
          createdAt: row.CREATED_AT,
          updatedAt: row.UPDATED_AT,
        };
      }
      return undefined;
    } catch (error) {
      console.error("[Oracle] Failed to get alert by ID:", error);
      return undefined;
    }
  }

  async getSessionAlerts(sessionId: number) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `SELECT * FROM alerts WHERE session_id = :sessionId ORDER BY created_at DESC`;
      const result = await this.executeQuery(query, [sessionId]);
      
      return result.rows.map((row: any) => ({
        id: row.ID,
        sessionId: row.SESSION_ID,
        type: row.TYPE,
        message: row.MESSAGE,
        severity: row.SEVERITY,
        acknowledged: row.ACKNOWLEDGED,
        acknowledgedBy: row.ACKNOWLEDGED_BY,
        acknowledgedAt: row.ACKNOWLEDGED_AT,
        notes: row.NOTES,
        createdAt: row.CREATED_AT,
        updatedAt: row.UPDATED_AT,
      }));
    } catch (error) {
      console.error("[Oracle] Failed to get session alerts:", error);
      return [];
    }
  }

  async acknowledgeAlert(alertId: number, acknowledgedBy: number, notes?: string) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `UPDATE alerts SET acknowledged = 1, acknowledged_by = :acknowledgedBy, acknowledged_at = CURRENT_TIMESTAMP, notes = :notes, updated_at = CURRENT_TIMESTAMP WHERE id = :alertId`;
      
      const result = await this.executeQuery(query, [acknowledgedBy, notes || null, alertId]);
      return result;
    } catch (error) {
      console.error("[Oracle] Failed to acknowledge alert:", error);
      throw error;
    }
  }

  async getUnacknowledgedAlerts(limit = 50) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `SELECT * FROM alerts WHERE acknowledged = 0 ORDER BY severity DESC, created_at DESC FETCH FIRST ${limit} ROWS ONLY`;
      const result = await this.executeQuery(query);
      
      return result.rows.map((row: any) => ({
        id: row.ID,
        sessionId: row.SESSION_ID,
        type: row.TYPE,
        message: row.MESSAGE,
        severity: row.SEVERITY,
        acknowledged: row.ACKNOWLEDGED,
        acknowledgedBy: row.ACKNOWLEDGED_BY,
        acknowledgedAt: row.ACKNOWLEDGED_AT,
        notes: row.NOTES,
        createdAt: row.CREATED_AT,
        updatedAt: row.UPDATED_AT,
      }));
    } catch (error) {
      console.error("[Oracle] Failed to get unacknowledged alerts:", error);
      return [];
    }
  }

  // Incident operations
  async createIncident(incident: typeof incidents.$inferInsert) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `INSERT INTO incidents (sessionId, incidentType, severity, description, status, reportedBy, investigatedBy, resolution, recommendedAction, evidenceUrls, createdAt, updatedAt, resolvedAt, deletedAt) 
        VALUES (:sessionId, :incidentType, :severity, :description, :status, :reportedBy, :investigatedBy, :resolution, :recommendedAction, :evidenceUrls, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, :resolvedAt, :deletedAt)`;
      
      const result = await this.executeQuery(query, [
        incident.sessionId,
        incident.incidentType,
        incident.severity,
        incident.description,
        incident.status,
        incident.reportedBy,
        incident.investigatedBy,
        incident.resolution,
        incident.recommendedAction,
        incident.evidenceUrls,
        incident.resolvedAt,
        incident.deletedAt
      ]);
      
      return result;
    } catch (error) {
      console.error("[Oracle] Failed to create incident:", error);
      throw error;
    }
  }

  async getIncidentById(incidentId: number) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `SELECT * FROM incidents WHERE id = :id`;
      const result = await this.executeQuery(query, [incidentId]);
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.ID,
          sessionId: row.SESSION_ID,
          type: row.TYPE,
          description: row.DESCRIPTION,
          severity: row.SEVERITY,
          status: row.STATUS,
          evidence: row.EVIDENCE,
          createdBy: row.CREATED_BY,
          createdAt: row.CREATED_AT,
          updatedAt: row.UPDATED_AT,
        };
      }
      return undefined;
    } catch (error) {
      console.error("[Oracle] Failed to get incident by ID:", error);
      return undefined;
    }
  }

  async getSessionIncidents(sessionId: number) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `SELECT * FROM incidents WHERE session_id = :sessionId`;
      const result = await this.executeQuery(query, [sessionId]);
      
      return result.rows.map((row: any) => ({
        id: row.ID,
        sessionId: row.SESSION_ID,
        type: row.TYPE,
        description: row.DESCRIPTION,
        severity: row.SEVERITY,
        status: row.STATUS,
        evidence: row.EVIDENCE,
        createdBy: row.CREATED_BY,
        createdAt: row.CREATED_AT,
        updatedAt: row.UPDATED_AT,
      }));
    } catch (error) {
      console.error("[Oracle] Failed to get session incidents:", error);
      return [];
    }
  }

  async updateIncident(incidentId: number, updates: Partial<Incident>) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      // Build dynamic update query
      const fields = Object.keys(updates);
      if (fields.length === 0) return null;
      
      const setParts = fields.map(field => {
        // Convert camelCase to UPPER_SNAKE_CASE for Oracle
        const oracleField = field.replace(/([A-Z])/g, '_$1').toUpperCase();
        return `${oracleField} = :${field}`;
      });
      
      const query = `UPDATE incidents SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = :incidentId`;
      
      const binds: any = { ...updates, incidentId };
      
      const result = await this.executeQuery(query, Object.values(binds));
      return result;
    } catch (error) {
      console.error("[Oracle] Failed to update incident:", error);
      throw error;
    }
  }

  async listIncidents(status?: string, limit = 50) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      let query = `SELECT * FROM incidents`;
      const binds: any[] = [];
      
      if (status) {
        query += ` WHERE status = :status`;
        binds.push(status);
      }
      
      query += ` ORDER BY created_at DESC FETCH FIRST ${limit} ROWS ONLY`;
      
      const result = await this.executeQuery(query, binds);
      
      return result.rows.map((row: any) => ({
        id: row.ID,
        sessionId: row.SESSION_ID,
        type: row.TYPE,
        description: row.DESCRIPTION,
        severity: row.SEVERITY,
        status: row.STATUS,
        evidence: row.EVIDENCE,
        createdBy: row.CREATED_BY,
        createdAt: row.CREATED_AT,
        updatedAt: row.UPDATED_AT,
      }));
    } catch (error) {
      console.error("[Oracle] Failed to list incidents:", error);
      return [];
    }
  }

  // Video evidence operations
  async createVideoEvidence(evidence: typeof videoEvidence.$inferInsert) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `INSERT INTO videoEvidence (sessionId, alertId, incidentId, videoUrl, fileSize, duration, startTime, endTime, contentType, storageKey, retentionDays, expiresAt, createdAt) 
        VALUES (:sessionId, :alertId, :incidentId, :videoUrl, :fileSize, :duration, :startTime, :endTime, :contentType, :storageKey, :retentionDays, :expiresAt, CURRENT_TIMESTAMP)`;
      
      const result = await this.executeQuery(query, [
        evidence.sessionId,
        evidence.alertId,
        evidence.incidentId,
        evidence.videoUrl,
        evidence.fileSize,
        evidence.duration,
        evidence.startTime,
        evidence.endTime,
        evidence.contentType,
        evidence.storageKey,
        evidence.retentionDays,
        evidence.expiresAt
      ]);
      
      return result;
    } catch (error) {
      console.error("[Oracle] Failed to create video evidence:", error);
      throw error;
    }
  }

  async getSessionVideoEvidence(sessionId: number) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `SELECT * FROM video_evidence WHERE session_id = :sessionId`;
      const result = await this.executeQuery(query, [sessionId]);
      
      return result.rows.map((row: any) => ({
        id: row.ID,
        sessionId: row.SESSION_ID,
        alertId: row.ALERT_ID,
        filePath: row.FILE_PATH,
        timestamp: row.TIMESTAMP,
        duration: row.DURATION,
        thumbnailPath: row.THUMBNAIL_PATH,
        createdAt: row.CREATED_AT,
        updatedAt: row.UPDATED_AT,
      }));
    } catch (error) {
      console.error("[Oracle] Failed to get session video evidence:", error);
      return [];
    }
  }

  async getAlertVideoEvidence(alertId: number) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `SELECT * FROM video_evidence WHERE alert_id = :alertId`;
      const result = await this.executeQuery(query, [alertId]);
      
      return result.rows.map((row: any) => ({
        id: row.ID,
        sessionId: row.SESSION_ID,
        alertId: row.ALERT_ID,
        filePath: row.FILE_PATH,
        timestamp: row.TIMESTAMP,
        duration: row.DURATION,
        thumbnailPath: row.THUMBNAIL_PATH,
        createdAt: row.CREATED_AT,
        updatedAt: row.UPDATED_AT,
      }));
    } catch (error) {
      console.error("[Oracle] Failed to get alert video evidence:", error);
      return [];
    }
  }

  // Fraud analytics operations
  async createOrUpdateFraudAnalytics(analytics: typeof fraudAnalytics.$inferInsert) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      // Check if record exists
      const checkQuery = `SELECT id FROM fraudAnalytics WHERE period = :period AND courseCode = :courseCode`;
      const checkResult = await this.executeQuery(checkQuery, [analytics.period || '', analytics.courseCode || '']);
      
      if (checkResult.rows.length > 0) {
        // Update existing record
        const updateQuery = `UPDATE fraudAnalytics SET 
          department = :department,
          totalExamSessions = :totalExamSessions,
          flaggedSessions = :flaggedSessions,
          confirmedIncidents = :confirmedIncidents,
          dismissedIncidents = :dismissedIncidents,
          fraudRate = :fraudRate,
          commonAlertTypes = :commonAlertTypes,
          averageConfidenceScore = :averageConfidenceScore,
          averageSessionScore = :averageSessionScore,
          passRate = :passRate,
          updatedAt = CURRENT_TIMESTAMP
          WHERE id = :id`;
          
        await this.executeQuery(updateQuery, [
          analytics.department || null,
          analytics.totalExamSessions,
          analytics.flaggedSessions,
          analytics.confirmedIncidents,
          analytics.dismissedIncidents,
          analytics.fraudRate,
          analytics.commonAlertTypes,
          analytics.averageConfidenceScore,
          analytics.averageSessionScore,
          analytics.passRate,
          checkResult.rows[0].ID
        ]);
      } else {
        // Insert new record
        const insertQuery = `INSERT INTO fraudAnalytics (examId, courseCode, department, period, totalExamSessions, flaggedSessions, confirmedIncidents, dismissedIncidents, fraudRate, commonAlertTypes, averageConfidenceScore, averageSessionScore, passRate, createdAt, updatedAt) 
          VALUES (:examId, :courseCode, :department, :period, :totalExamSessions, :flaggedSessions, :confirmedIncidents, :dismissedIncidents, :fraudRate, :commonAlertTypes, :averageConfidenceScore, :averageSessionScore, :passRate, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
          
        await this.executeQuery(insertQuery, [
          analytics.examId,
          analytics.courseCode || null,
          analytics.department || null,
          analytics.period || null,
          analytics.totalExamSessions,
          analytics.flaggedSessions,
          analytics.confirmedIncidents,
          analytics.dismissedIncidents,
          analytics.fraudRate,
          analytics.commonAlertTypes,
          analytics.averageConfidenceScore,
          analytics.averageSessionScore,
          analytics.passRate
        ]);
      }
    } catch (error) {
      console.error("[Oracle] Failed to create or update fraud analytics:", error);
      throw error;
    }
  }

  async getFraudAnalyticsByPeriod(period: string) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `SELECT * FROM fraud_analytics WHERE period = :period`;
      const result = await this.executeQuery(query, [period]);
      
      return result.rows.map((row: any) => ({
        id: row.ID,
        period: row.PERIOD,
        courseCode: row.COURSE_CODE,
        department: row.DEPARTMENT,
        totalExams: row.TOTAL_EXAMS,
        totalStudents: row.TOTAL_STUDENTS,
        totalAlerts: row.TOTAL_ALERTS,
        totalIncidents: row.TOTAL_INCIDENTS,
        avgAlertsPerSession: row.AVG_ALERTS_PER_SESSION,
        highRiskPercentage: row.HIGH_RISK_PERCENTAGE,
        createdAt: row.CREATED_AT,
        updatedAt: row.UPDATED_AT,
      }));
    } catch (error) {
      console.error("[Oracle] Failed to get fraud analytics by period:", error);
      return [];
    }
  }

  async getFraudAnalyticsByCourse(courseCode: string) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `SELECT * FROM fraud_analytics WHERE course_code = :courseCode`;
      const result = await this.executeQuery(query, [courseCode]);
      
      return result.rows.map((row: any) => ({
        id: row.ID,
        period: row.PERIOD,
        courseCode: row.COURSE_CODE,
        department: row.DEPARTMENT,
        totalExams: row.TOTAL_EXAMS,
        totalStudents: row.TOTAL_STUDENTS,
        totalAlerts: row.TOTAL_ALERTS,
        totalIncidents: row.TOTAL_INCIDENTS,
        avgAlertsPerSession: row.AVG_ALERTS_PER_SESSION,
        highRiskPercentage: row.HIGH_RISK_PERCENTAGE,
        createdAt: row.CREATED_AT,
        updatedAt: row.UPDATED_AT,
      }));
    } catch (error) {
      console.error("[Oracle] Failed to get fraud analytics by course:", error);
      return [];
    }
  }

  async getFraudAnalyticsByDepartment(department: string) {
    console.log('[Oracle] Using Oracle database connection');
    try {
      const query = `SELECT * FROM fraud_analytics WHERE department = :department`;
      const result = await this.executeQuery(query, [department]);
      
      return result.rows.map((row: any) => ({
        id: row.ID,
        period: row.PERIOD,
        courseCode: row.COURSE_CODE,
        department: row.DEPARTMENT,
        totalExams: row.TOTAL_EXAMS,
        totalStudents: row.TOTAL_STUDENTS,
        totalAlerts: row.TOTAL_ALERTS,
        totalIncidents: row.TOTAL_INCIDENTS,
        avgAlertsPerSession: row.AVG_ALERTS_PER_SESSION,
        highRiskPercentage: row.HIGH_RISK_PERCENTAGE,
        createdAt: row.CREATED_AT,
        updatedAt: row.UPDATED_AT,
      }));
    } catch (error) {
      console.error("[Oracle] Failed to get fraud analytics by department:", error);
      return [];
    }
  }
}

// Main database adapter that can switch between MySQL and Oracle
class DatabaseAdapterFactory {
  private static instance: DatabaseAdapter | null = null;
  private static isOracleAvailable: boolean | null = null;

  static async getInstance(): Promise<DatabaseAdapter> {
    if (!this.instance) {
      // Check if Oracle is configured and available
      const useOracle = process.env.USE_ORACLE === 'true' || false;
      
      if (useOracle) {
        const oracleAdapter = new OracleAdapter();
        // Check if Oracle is actually available
        if (oracleAdapter['isAvailable']) {
          this.instance = oracleAdapter;
          console.log('✅ Using Oracle database adapter');
        } else {
          console.log('⚠️ Oracle not available, falling back to MySQL');
          this.instance = new MySQLAdapter();
        }
      } else {
        this.instance = new MySQLAdapter();
        console.log('✅ Using MySQL database adapter');
      }
    }

    return this.instance;
  }
}

// Export the factory function to get the database adapter
export async function getDatabaseAdapter(): Promise<DatabaseAdapter> {
  return await DatabaseAdapterFactory.getInstance();
}

// Export for direct use
export { DatabaseAdapter, MySQLAdapter, OracleAdapter };