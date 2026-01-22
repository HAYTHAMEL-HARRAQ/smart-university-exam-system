import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, AlertTriangle, TrendingUp, Flag } from "lucide-react";

export default function AnomalyDetection() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  // Mock anomaly data
  const anomalies = [
    {
      id: 1,
      type: 'Score Spike',
      severity: 'critical',
      studentId: '2024-1001',
      studentName: 'John Anderson',
      description: 'Unusual score improvement detected',
      details: {
        exam: 'Data Structures Final',
        previousScores: [35, 42, 38, 41],
        currentScore: 92,
        improvement: 124,
        flaggedReason: 'Score jumped 124% from average (40 → 92). Statistically improbable.',
      },
      confidence: 94,
      timestamp: new Date(Date.now() - 2 * 3600000),
    },
    {
      id: 2,
      type: 'Duplicate Exam Anomaly',
      severity: 'critical',
      studentId: '2024-1015',
      studentName: 'Sarah Mitchell',
      description: 'Same exam taken twice with suspicious score variance',
      details: {
        exam: 'Algorithms Challenge',
        firstAttempt: 45,
        secondAttempt: 88,
        timeBetween: '2 days',
        scoreChange: 43,
        flaggedReason: 'Student retook exam after only 2 days with 43-point improvement. High probability of cheating.',
      },
      confidence: 91,
      timestamp: new Date(Date.now() - 5 * 3600000),
    },
    {
      id: 3,
      type: 'Biometric Mismatch',
      severity: 'high',
      studentId: '2024-2003',
      studentName: 'Michael Torres',
      description: 'Face recognition mismatch detected',
      details: {
        exam: 'Advanced Programming',
        issue: 'Face at start ≠ Face during exam',
        confidence: 87,
        flaggedReason: 'Biometric verification failed. Different person detected during exam.',
      },
      confidence: 87,
      timestamp: new Date(Date.now() - 8 * 3600000),
    },
    {
      id: 4,
      type: 'Answer Pattern Anomaly',
      severity: 'high',
      studentId: '2024-1008',
      studentName: 'Emma Watson',
      description: 'Answer patterns match other students suspiciously',
      details: {
        exam: 'Operating Systems',
        matchedWith: ['Student ID: 2024-1009', 'Student ID: 2024-1010'],
        matchPercentage: 89,
        flaggedReason: 'Answer sequence and timing matches 2 other students. Probability of coincidence: < 0.1%',
      },
      confidence: 89,
      timestamp: new Date(Date.now() - 12 * 3600000),
    },
    {
      id: 5,
      type: 'Timing Anomaly',
      severity: 'medium',
      studentId: '2024-1022',
      studentName: 'David Chen',
      description: 'Exam completed suspiciously fast',
      details: {
        exam: 'Database Design',
        expectedTime: '120 minutes',
        actualTime: '18 minutes',
        questionCount: 50,
        flaggedReason: 'Completed 50-question exam in 18 minutes (avg 22 sec/question). Likely guessing or external help.',
      },
      confidence: 76,
      timestamp: new Date(Date.now() - 18 * 3600000),
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-300 text-red-900';
      case 'high':
        return 'bg-orange-50 border-orange-300 text-orange-900';
      case 'medium':
        return 'bg-yellow-50 border-yellow-300 text-yellow-900';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-900';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Anomaly Detection</h1>
            <p className="text-sm text-muted-foreground">Auto-flagged suspicious patterns and behaviors</p>
          </div>
          <Button onClick={() => navigate("/admin")} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Anomalies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{anomalies.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Flagged automatically</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{anomalies.filter(a => a.severity === 'critical').length}</div>
                <p className="text-xs text-muted-foreground mt-1">Require immediate investigation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{anomalies.filter(a => a.severity === 'high').length}</div>
                <p className="text-xs text-muted-foreground mt-1">Needs review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(anomalies.reduce((sum, a) => sum + a.confidence, 0) / anomalies.length)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Detection accuracy</p>
              </CardContent>
            </Card>
          </div>

          {/* Anomalies List */}
          <div className="space-y-4">
            {anomalies.map((anomaly, idx) => (
              <Card key={anomaly.id} className={`border-l-4 ${
                anomaly.severity === 'critical' ? 'border-l-red-600' :
                anomaly.severity === 'high' ? 'border-l-orange-500' :
                'border-l-yellow-500'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Flag className={`w-5 h-5 ${
                          anomaly.severity === 'critical' ? 'text-red-600' :
                          anomaly.severity === 'high' ? 'text-orange-500' :
                          'text-yellow-500'
                        }`} />
                        <CardTitle className="text-lg">{anomaly.type}</CardTitle>
                        <Badge variant={getSeverityBadgeVariant(anomaly.severity)} className="capitalize">
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <CardDescription>{anomaly.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">{anomaly.confidence}% confident</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.floor((Date.now() - anomaly.timestamp.getTime()) / 3600000)} hours ago
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className={`border-t-2 pt-4 ${getSeverityColor(anomaly.severity).replace('border', 'border-t').split(' ').slice(0, -1).join(' ')}`}>
                  {/* Student Info */}
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-sm font-medium">{anomaly.studentName}</p>
                    <p className="text-xs text-muted-foreground">Student ID: {anomaly.studentId}</p>
                  </div>

                  {/* Details based on type */}
                  <div className="space-y-3">
                    {anomaly.type === 'Score Spike' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Previous Average</p>
                            <p className="text-xl font-bold text-orange-600">
                              {anomaly.details.previousScores ? Math.round(anomaly.details.previousScores.reduce((a: number, b: number) => a + b) / anomaly.details.previousScores.length) : 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Current Score</p>
                            <p className="text-xl font-bold text-red-600">{anomaly.details.currentScore}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-background rounded-lg">
                          <p className="text-sm font-medium mb-2">📊 Score History</p>
                          <p className="text-xs text-muted-foreground">{anomaly.details.previousScores?.join(', ')} → {anomaly.details.currentScore}</p>
                        </div>
                      </>
                    )}

                    {anomaly.type === 'Duplicate Exam Anomaly' && (
                      <>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">1st Attempt</p>
                            <p className="text-xl font-bold text-orange-600">{anomaly.details.firstAttempt}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Time Between</p>
                            <p className="text-sm font-semibold">{anomaly.details.timeBetween}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">2nd Attempt</p>
                            <p className="text-xl font-bold text-red-600">{anomaly.details.secondAttempt}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-background rounded-lg border-2 border-red-200">
                          <p className="text-sm font-semibold text-red-900 mb-1">⚠️ High Suspicion</p>
                          <p className="text-xs text-red-800">{anomaly.details.flaggedReason}</p>
                        </div>
                      </>
                    )}

                    {anomaly.type === 'Answer Pattern Anomaly' && (
                      <>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Matched With</p>
                            <div className="flex gap-2 flex-wrap mt-1">
                              {anomaly.details.matchedWith?.map((student: string, i: number) => (
                                <Badge key={i} variant="secondary">{student}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="p-3 bg-background rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Match Percentage</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-orange-500 to-red-600"
                                  style={{ width: `${anomaly.details.matchPercentage}%` }}
                                ></div>
                              </div>
                              <span className="font-semibold text-sm">{anomaly.details.matchPercentage}%</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {anomaly.type === 'Timing Anomaly' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Questions</p>
                            <p className="text-xl font-bold">{anomaly.details.questionCount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Time Used</p>
                            <p className="text-xl font-bold text-red-600">{anomaly.details.actualTime}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-background rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Avg Time per Question</p>
                          <p className="text-sm font-semibold">22 seconds (expected: 144 seconds)</p>
                        </div>
                      </>
                    )}

                    {anomaly.type === 'Biometric Mismatch' && (
                      <div className="p-3 bg-background rounded-lg border-2 border-red-200">
                        <p className="text-sm font-semibold text-red-900 mb-1">🔴 Security Alert</p>
                        <p className="text-xs text-red-800">{anomaly.details.flaggedReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Common reason */}
                  <div className="mt-4 p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Flagged Reason</p>
                    <p className="text-sm text-foreground">{anomaly.details.flaggedReason}</p>
                  </div>
                </CardContent>

                {/* Actions */}
                <div className="border-t p-4 flex gap-2">
                  <Button size="sm" className="flex-1">Create Incident</Button>
                  <Button size="sm" variant="outline" className="flex-1">Review Evidence</Button>
                  <Button size="sm" variant="ghost">Dismiss</Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Detection Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold mb-2">Score Spike Detection</p>
                  <p className="text-muted-foreground">Flags when score improves &gt;100% from historical average</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Duplicate Exam Anomaly</p>
                  <p className="text-muted-foreground">Detects unusual patterns when same exam taken multiple times</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Answer Pattern Matching</p>
                  <p className="text-muted-foreground">Uses ML to detect identical answer sequences</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Timing Analysis</p>
                  <p className="text-muted-foreground">Identifies suspiciously fast completions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
