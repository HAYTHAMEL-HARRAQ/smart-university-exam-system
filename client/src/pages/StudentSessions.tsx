import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Clock, CheckCircle, AlertCircle, Calendar, X } from "lucide-react";
import { useState } from "react";

export default function StudentSessions() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const { data: sessions, isLoading, error } = trpc.sessions.getStudentSessions.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'flagged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Exam History</h1>
            <p className="text-sm text-muted-foreground">Review your past exam sessions</p>
          </div>
          <div className="text-sm bg-muted px-3 py-1 rounded-full capitalize">{user?.name}</div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Sessions</h2>
            <p className="text-red-700">{error.message}</p>
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No Exam Sessions Yet</h2>
            <p className="text-muted-foreground mb-6">You haven't taken any exams yet. Go to Available Exams to start!</p>
            <Button onClick={() => window.location.href = '/student/exams'}>
              Browse Exams
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Exam Session #{session.id}</CardTitle>
                      <CardDescription>Started: {new Date(session.startedAt).toLocaleString()}</CardDescription>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                      {session.status.replace(/_/g, ' ')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Exam ID: {session.examId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                        <span>
                          Biometric: {session.biometricVerified ? (
                            <span className="text-green-600 font-semibold">Verified</span>
                          ) : (
                            <span className="text-red-600 font-semibold">Not Verified</span>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                        <span>Suspicious Activity: {session.suspiciousActivityCount || 0}</span>
                      </div>
                      {session.score !== null && session.score !== undefined && (
                        <div className="text-sm font-semibold text-blue-600">
                          Score: {Math.round(parseInt(String(session.score)) / 5)}/20
                        </div>
                      )}
                    </div>

                    <div className="flex items-end justify-end">
                      <Button variant="outline" size="sm" onClick={() => setSelectedSession(session)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Exam Session Details</CardTitle>
                <CardDescription>Session #{selectedSession.id}</CardDescription>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold mb-3">Session Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Session ID</p>
                    <p className="font-medium">#{selectedSession.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Exam ID</p>
                    <p className="font-medium">{selectedSession.examId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{selectedSession.status.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Started</p>
                    <p className="font-medium">{new Date(selectedSession.startedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="font-semibold mb-3">Performance</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Score</p>
                    <p className="font-bold text-lg text-blue-600">{Math.round(Number(selectedSession.score) / 5)}/20</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Suspicious Activity Count</p>
                    <p className="font-medium">{selectedSession.suspiciousActivityCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Biometric Verified</p>
                    <p className="font-medium">
                      {selectedSession.biometricVerified ? (
                        <span className="text-green-600">✓ Yes</span>
                      ) : (
                        <span className="text-red-600">✗ No</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">IP Address</p>
                    <p className="font-medium text-xs">{selectedSession.ipAddress}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-semibold mb-3">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Session Started</p>
                      <p className="font-medium">{new Date(selectedSession.startedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedSession.endedAt && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-muted-foreground">Session Ended</p>
                        <p className="font-medium">{new Date(selectedSession.endedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className={`p-3 rounded-lg ${getStatusColor(selectedSession.status)}`}>
                <p className="text-sm font-medium">
                  {selectedSession.status === 'submitted' && '✓ Exam submitted successfully'}
                  {selectedSession.status === 'flagged' && '⚠️ This exam has been flagged for review'}
                  {selectedSession.status === 'in_progress' && '⏳ Exam is still in progress'}
                  {selectedSession.status === 'paused' && '⏸️ Exam is paused'}
                </p>
              </div>

              {/* Close Button */}
              <Button
                onClick={() => setSelectedSession(null)}
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
