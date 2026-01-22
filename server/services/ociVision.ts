import * as db from "../db";
import { Alert } from "../../drizzle/schema";

// Mock OCI AI Vision API response structure
interface OciVisionDetectionResult {
  detectionType: Alert['alertType'];
  confidence: number; // 0 to 100
  description: string;
  metadata: Record<string, any>;
}

/**
 * Mock function to simulate OCI AI Vision API call for behavioral detection.
 * In a real application, this would call the OCI AI Vision service.
 * For this mock, it randomly generates a detection result.
 */
function mockOciVisionDetection(): OciVisionDetectionResult | null {
  const detections: OciVisionDetectionResult[] = [
    {
      detectionType: 'multiple_faces',
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100
      description: "A second face was detected in the video frame.",
      metadata: { faces: 2, location: [100, 200] },
    },
    {
      detectionType: 'off_screen_gaze',
      confidence: Math.floor(Math.random() * 40) + 60, // 60-100
      description: "Student's gaze was directed away from the screen for an extended period.",
      metadata: { duration: 5, direction: 'left' },
    },
    {
      detectionType: 'phone_detected',
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100
      description: "A mobile phone object was identified near the student.",
      metadata: { object: 'phone', probability: 0.92 },
    },
    {
      detectionType: 'unusual_behavior',
      confidence: Math.floor(Math.random() * 50) + 50, // 50-100
      description: "Unusual head movement and fidgeting detected.",
      metadata: { activity: 'fidgeting', score: 0.75 },
    },
  ];

  // 20% chance of no detection
  if (Math.random() < 0.2) {
    return null;
  }

  // Randomly select a detection
  const randomIndex = Math.floor(Math.random() * detections.length);
  return detections[randomIndex];
}

/**
 * Processes a detection result for a given exam session.
 * If a suspicious behavior is detected, it creates an alert in the database.
 */
export async function processDetectionResult(sessionId: number): Promise<boolean> {
  const detection = mockOciVisionDetection();

  if (detection) {
    // Determine severity based on confidence
    let severity: Alert['severity'] = 'low';
    if (detection.confidence >= 90) {
      severity = 'critical';
    } else if (detection.confidence >= 80) {
      severity = 'high';
    } else if (detection.confidence >= 70) {
      severity = 'medium';
    }

    // Create the alert
    await db.createAlert({
      sessionId: sessionId,
      alertType: detection.detectionType,
      severity: severity,
      confidenceScore: detection.confidence.toString() as any,
      description: detection.description,
      metadata: detection.metadata,
      acknowledged: false,
    });

    // Increment suspicious activity count on the session
    const session = await db.getExamSessionById(sessionId);
    if (session) {
      await db.updateExamSession(sessionId, {
        suspiciousActivityCount: session.suspiciousActivityCount + 1,
      });
    }

    return true; // Alert created
  }

  return false; // No alert created
}
