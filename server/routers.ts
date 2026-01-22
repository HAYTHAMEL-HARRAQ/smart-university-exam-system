import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// Helper to ensure user is proctor or admin
const proctorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'proctor' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Only proctors and admins can access this' });
  }
  return next({ ctx });
});

// Helper to ensure user is admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can access this' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ===== EXAM MANAGEMENT =====
  exams: router({
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        courseCode: z.string().min(1),
        department: z.string().min(1),
        description: z.string().optional(),
        duration: z.number().positive(),
        totalQuestions: z.number().optional(),
        maxScore: z.number().optional(),
        scheduledAt: z.date(),
        detectionSensitivity: z.enum(['low', 'medium', 'high']).default('medium'),
        requiresBiometric: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createExam({
          ...input,
          maxScore: input.maxScore ? input.maxScore.toString() as any : undefined,
          createdBy: ctx.user.id,
          status: 'draft' as any,
        });
        return { success: true } as const;
      }),

    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ input }) => {
        return await db.listExams(input.status);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getExamById(input.id);
      }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['draft', 'scheduled', 'active', 'completed', 'cancelled']),
      }))
      .mutation(async ({ input }) => {
        // In a real app, would use db.updateExam
        return { success: true } as const;
      }),
  }),

  // ===== EXAM SESSIONS =====
  sessions: router({
    create: protectedProcedure
      .input(z.object({
        examId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createExamSession({
          examId: input.examId,
          studentId: ctx.user.id,
          startedAt: new Date(),
          status: 'not_started' as any,
        });
        return { success: true };
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getExamSessionById(input.id);
      }),

    getStudentSessions: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getStudentExamSessions(ctx.user.id);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        status: z.enum(['not_started', 'in_progress', 'submitted', 'paused', 'abandoned', 'flagged']),
      }))
      .mutation(async ({ input, ctx }) => {
        const session = await db.getExamSessionById(input.sessionId);
        if (!session) throw new TRPCError({ code: 'NOT_FOUND' });
        
        // Verify ownership
        if (session.studentId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        await db.updateExamSession(input.sessionId, { status: input.status as any });
        return { success: true } as const;
      }),
    recordBiometricVerification: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        verified: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        const session = await db.getExamSessionById(input.sessionId);
        if (!session) throw new TRPCError({ code: 'NOT_FOUND' });

        if (session.studentId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        await db.updateExamSession(input.sessionId, {
          biometricVerified: input.verified,
          biometricVerifiedAt: input.verified ? new Date() : undefined,
        });
        return { success: true } as const;
      }),

    getActive: proctorProcedure
      .query(async () => {
        return await db.getActiveExamSessions();
      }),

    recordVideoMetadata: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        videoUrl: z.string(),
        metadata: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ input, ctx }): Promise<{ success: boolean }> => {
        const session = await db.getExamSessionById(input.sessionId);
        if (!session) throw new TRPCError({ code: 'NOT_FOUND' });

        if (session.studentId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        await db.updateExamSession(input.sessionId, {
          videoRecordingUrl: input.videoUrl,
          videoMetadata: input.metadata,
        });
        return { success: true } as const;
      }),
  }),

  // ===== ALERTS =====
  alerts: router({
    simulateDetection: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { processDetectionResult } = await import('./services/ociVision');
        const alertCreated = await processDetectionResult(input.sessionId);
        return { success: true, alertCreated };
      }),
    create: protectedProcedure // Changed to protectedProcedure so the student client can call it to record alerts
      .input(z.object({
        sessionId: z.number(),
        alertType: z.enum([
          'phone_detected', 'multiple_faces', 'off_screen_gaze',
          'suspicious_audio', 'unauthorized_person', 'unusual_behavior',
          'network_anomaly', 'other'
        ]),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        confidenceScore: z.number().min(0).max(100),
        description: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
        videoClipUrl: z.string().optional(), // Added videoClipUrl
      }))
      .mutation(async ({ input }): Promise<{ success: boolean }> => {
        await db.createAlert({
          sessionId: input.sessionId,
          alertType: input.alertType,
          severity: input.severity,
          confidenceScore: input.confidenceScore.toString() as any,
          description: input.description,
          metadata: input.metadata,
          videoClipUrl: input.videoClipUrl,
          acknowledged: false,
        });
        return { success: true } as const;
      }),

	    getById: protectedProcedure
	      .input(z.object({ alertId: z.number() }))
	      .query(async ({ input }) => {
	        return await db.getAlertById(input.alertId);
	      }),

	    getSessionAlerts: proctorProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSessionAlerts(input.sessionId);
      }),

    getUnacknowledged: proctorProcedure
      .query(async (): Promise<any[]> => {
        return await db.getUnacknowledgedAlerts();
      }),

    acknowledge: proctorProcedure
      .input(z.object({
        alertId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.acknowledgeAlert(input.alertId, ctx.user.id, input.notes);
        return { success: true } as const;
      }),
  }),

  // ===== INCIDENTS =====
  incidents: router({
    create: proctorProcedure
      .input(z.object({
        sessionId: z.number(),
        incidentType: z.enum([
          'cheating_confirmed', 'unauthorized_assistance',
          'technical_violation', 'false_positive', 'other'
        ]),
        severity: z.enum(['minor', 'moderate', 'major', 'critical']),
        description: z.string().min(1),
        recommendedAction: z.string().optional(),
        evidenceUrls: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createIncident({
          ...input,
          reportedBy: ctx.user.id,
          status: 'pending',
        });
        return { success: true };
      }),

    list: proctorProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ input }) => {
        return await db.listIncidents(input.status);
      }),

    getById: proctorProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getIncidentById(input.id);
      }),

    updateStatus: proctorProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'investigating', 'resolved', 'appealed', 'dismissed']),
        resolution: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateIncident(input.id, {
          status: input.status as any,
          resolution: input.resolution,
          investigatedBy: ctx.user.id,
          resolvedAt: input.status === 'resolved' ? new Date() : undefined,
        });
        return { success: true } as const;
      }),
  }),

  // ===== ANALYTICS =====
  analytics: router({
    getFraudTrendsByPeriod: adminProcedure
      .input(z.object({ period: z.string() }))
      .query(async ({ input }) => {
        return await db.getFraudAnalyticsByPeriod(input.period);
      }),

    getFraudTrendsByCourse: adminProcedure
      .input(z.object({ courseCode: z.string() }))
      .query(async ({ input }) => {
        return await db.getFraudAnalyticsByCourse(input.courseCode);
      }),

    getFraudTrendsByDepartment: adminProcedure
      .input(z.object({ department: z.string() }))
      .query(async ({ input }) => {
        return await db.getFraudAnalyticsByDepartment(input.department);
      }),
  }),
});

export type AppRouter = typeof appRouter;
