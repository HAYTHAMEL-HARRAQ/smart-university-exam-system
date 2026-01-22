import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, AlertCircle, Clock, Users, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function LiveExamMonitoring() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const [refreshing, setRefreshing] = useState(false);

  // Mock live exams data
  const [liveExams] = useState([
    {
      id: 1,
      title: 'Data Structures Final Exam',
      courseCode: 'CS301',
      activeStudents: 12,
      totalStudents: 25,
      startedAt: new Date(Date.now() - 45 * 60000),
      duration: 120,
      alerts: 2,
      criticalAlerts: 1,
    },
    {
      id: 2,
      title: 'Operating Systems',
      courseCode: 'CS401',
      activeStudents: 8,
      totalStudents: 20,
      startedAt: new Date(Date.now() - 30 * 60000),
      duration: 90,
      alerts: 0,
      criticalAlerts: 0,
    },
    {
      id: 3,
      title: 'Advanced Algorithms',
      courseCode: 'CS481',
      activeStudents: 15,
      totalStudents: 30,
      startedAt: new Date(Date.now() - 60 * 60000),
      duration: 150,
      alerts: 5,
      criticalAlerts: 2,
    },
  ]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getTimeRemaining = (startedAt: Date, duration: number) => {
    const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 60000);
    const remaining = duration - elapsed;
    return remaining > 0 ? `${remaining}m remaining` : 'Time\'s up';
  };

  const getProgressPercent = (startedAt: Date, duration: number) => {
    const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 60000);
    return Math.min((elapsed / duration) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Live Exam Monitoring</h1>
            <p className="text-sm text-muted-foreground">Real-time exam sessions in progress</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button onClick={() => navigate("/proctor")} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{liveExams.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Students In Exam</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{liveExams.reduce((sum, e) => sum + e.activeStudents, 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all exams</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{liveExams.reduce((sum, e) => sum + e.alerts, 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Requiring attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{liveExams.reduce((sum, e) => sum + e.criticalAlerts, 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Immediate action needed</p>
            </CardContent>
          </Card>
        </div>

        {/* Live Exams List */}
        <div className="space-y-4">
          {liveExams.map((exam) => (
            <Card key={exam.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{exam.title}</CardTitle>
                    <CardDescription>{exam.courseCode}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {exam.criticalAlerts > 0 && (
                      <Badge variant="destructive" className="animate-pulse">
                        {exam.criticalAlerts} Critical
                      </Badge>
                    )}
                    {exam.alerts > exam.criticalAlerts && (
                      <Badge variant="secondary">
                        {exam.alerts - exam.criticalAlerts} Alerts
                      </Badge>
                    )}
                    <Badge variant="outline">LIVE</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Exam Progress</p>
                    <span className="text-sm text-muted-foreground">{getTimeRemaining(exam.startedAt, exam.duration)}</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                      style={{ width: `${getProgressPercent(exam.startedAt, exam.duration)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Exam Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Students Active</p>
                      <p className="font-semibold">{exam.activeStudents}/{exam.totalStudents}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-semibold">{exam.duration} minutes</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    exam.alerts > 0 ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'
                  }`}>
                    <AlertCircle className={`w-5 h-5 ${exam.alerts > 0 ? 'text-orange-600' : 'text-green-600'}`} />
                    <div>
                      <p className="text-xs text-muted-foreground">Alerts</p>
                      <p className={`font-semibold ${exam.alerts > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {exam.alerts > 0 ? `${exam.alerts} Alert${exam.alerts !== 1 ? 's' : ''}` : 'None'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alert Messages */}
                {exam.alerts > 0 && (
                  <div className="space-y-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    {exam.id === 1 && (
                      <>
                        <div className="flex items-start gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-red-900">Critical: Multiple faces detected (Student ID: 1024)</p>
                            <p className="text-xs text-red-700">Confidence: 92% | 2 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 mt-0.5 text-orange-600 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-orange-900">Phone detected during exam (Student ID: 1018)</p>
                            <p className="text-xs text-orange-700">Confidence: 78% | 5 minutes ago</p>
                          </div>
                        </div>
                      </>
                    )}
                    {exam.id === 3 && (
                      <>
                        <div className="flex items-start gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-red-900">Suspicious audio pattern (Student ID: 2015)</p>
                            <p className="text-xs text-red-700">Confidence: 85% | 3 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-red-900">Unauthorized person detected (Student ID: 2031)</p>
                            <p className="text-xs text-red-700">Confidence: 88% | 1 minute ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 mt-0.5 text-orange-600 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-orange-900">Off-screen gaze detected (Student ID: 2008)</p>
                            <p className="text-xs text-orange-700">Confidence: 72% | 8 minutes ago</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigate(`/proctor/session/${exam.id}`)} 
                    className="flex-1" 
                    size="sm"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  {exam.alerts > 0 && (
                    <Button 
                      onClick={() => navigate(`/proctor/session/${exam.id}`)} 
                      variant="outline" 
                      className="flex-1" 
                      size="sm"
                    >
                      Manage Alerts
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Auto-refresh info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Data updates automatically every 30 seconds</p>
        </div>
      </main>
    </div>
  );
}
