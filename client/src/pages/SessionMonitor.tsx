import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function SessionMonitor() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const id = path.split('/').pop();
    setSessionId(id || null);
  }, []);

  const mockSession = {
    id: sessionId || '1',
    studentId: 42,
    examId: 3,
    studentName: 'Emma Watson',
    examName: 'Data Structures Final',
    status: 'in_progress',
    startedAt: new Date(Date.now() - 25 * 60000),
    score: null,
    biometricVerified: true,
    suspiciousActivityCount: 2,
    ipAddress: '192.168.1.105',
    timeRemaining: 55,
  };

  const mockAlerts = [
    {
      id: 1,
      type: 'phone_detected',
      severity: 'high',
      message: '📱 Phone detected in view',
      timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
      id: 2,
      type: 'off_screen_gaze',
      severity: 'medium',
      message: '👀 Student looking away from screen',
      timestamp: new Date(Date.now() - 2 * 60000),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Session Monitor</h1>
            <p className="text-sm text-muted-foreground">Real-time monitoring for Session #{mockSession.id}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/proctor")} variant="outline" className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Student:</span>
                <span className="font-medium">{mockSession.studentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Student ID:</span>
                <span className="font-medium">{mockSession.studentId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Session Status:</span>
                <Badge className="bg-blue-100 text-blue-800">{mockSession.status}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Biometric:</span>
                <Badge variant="outline" className="bg-green-50">
                  ✓ Verified
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Exam Info */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Exam:</span>
                <span className="font-medium">{mockSession.examName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Exam ID:</span>
                <span className="font-medium">{mockSession.examId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Time Remaining:</span>
                <span className="font-bold text-orange-600">{mockSession.timeRemaining} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Started:</span>
                <span className="text-sm">{mockSession.startedAt.toLocaleTimeString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>
              Suspicious Activities ({mockSession.suspiciousActivityCount})
            </CardTitle>
            <CardDescription>Alerts detected during this session</CardDescription>
          </CardHeader>
          <CardContent>
            {mockAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-muted-foreground">No suspicious activities detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-lg ${
                      alert.severity === 'high'
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-yellow-50 border-yellow-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{alert.message}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge
                        className={
                          alert.severity === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button variant="outline" className="h-12">
            📞 Send Message to Student
          </Button>
          <Button variant="outline" className="h-12">
            ⏸️ Pause Exam
          </Button>
          <Button variant="outline" className="h-12">
            📋 Create Incident Report
          </Button>
          <Button variant="outline" className="h-12">
            🔔 Flag for Review
          </Button>
        </div>
      </main>
    </div>
  );
}
