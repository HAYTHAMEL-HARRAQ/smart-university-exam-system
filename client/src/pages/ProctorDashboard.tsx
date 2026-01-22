import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

export default function ProctorDashboard() {
  const [, navigate] = useLocation();
  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);

  // Fetch active exam sessions
  const { data: activeSessions = [], isLoading: sessionsLoading, refetch: refetchSessions } = trpc.sessions.getActive.useQuery();

  // Fetch unacknowledged alerts
  const { data: alerts = [], isLoading: alertsLoading, refetch: refetchAlerts } = trpc.alerts.getUnacknowledged.useQuery();

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = trpc.alerts.acknowledge.useMutation({
    onSuccess: () => {
      refetchAlerts();
      setSelectedAlert(null);
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'phone_detected': '📱 Phone Detected',
      'multiple_faces': '👥 Multiple Faces',
      'off_screen_gaze': '👀 Off-Screen Gaze',
      'suspicious_audio': '🔊 Suspicious Audio',
      'unauthorized_person': '⚠️ Unauthorized Person',
      'unusual_behavior': '🚨 Unusual Behavior',
      'network_anomaly': '🌐 Network Anomaly',
      'other': '❓ Other',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Proctor Dashboard</h1>
            <p className="text-sm text-muted-foreground">Real-time exam monitoring and alerts</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                console.log('Live Monitoring button clicked');
                navigate("/proctor/live-monitoring");
              }} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              📊 Live Monitoring
            </Button>
            <Button onClick={() => navigate("/")} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeSessions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Real-time monitoring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Unacknowledged Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{alerts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Critical Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {alerts.filter((a: any) => a.severity === 'critical').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Immediate action needed</p>
            </CardContent>
          </Card>
        </div>

	        <div className="grid gap-6 lg:grid-cols-3">
	          {/* Active Sessions List */}
	          <div className="lg:col-span-1">
	            <Card>
	              <CardHeader>
	                <CardTitle>Active Sessions</CardTitle>
	                <CardDescription>Students currently taking exams</CardDescription>
	              </CardHeader>
	              <CardContent>
	                {sessionsLoading ? (
	                  <div className="text-center py-8">
	                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
	                    <p className="text-sm text-muted-foreground">Loading sessions...</p>
	                  </div>
	                ) : activeSessions.length === 0 ? (
	                  <div className="text-center py-8">
	                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
	                    <p className="text-muted-foreground">No active exam sessions</p>
	                  </div>
	                ) : (
	                  <div className="space-y-3 max-h-96 overflow-y-auto">
	                    {activeSessions.map((session: any) => (
	                      <div
	                        key={session.id}
	                        className="p-3 border rounded-lg border-border hover:bg-muted/50 transition-colors"
	                      >
	                        <div className="flex items-center justify-between">
	                          <div className="flex-1">
	                            <p className="font-medium text-sm">Session ID: {session.id}</p>
	                            <p className="text-xs text-muted-foreground">Student ID: {session.studentId}</p>
	                          </div>
	                          <div className="text-right">
	                            <Badge variant="secondary" className="mb-1">
	                              {session.status.replace('_', ' ')}
	                            </Badge>
	                            <div className="flex items-center text-xs text-muted-foreground">
	                              <Clock className="w-3 h-3 mr-1" />
	                              {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
	                            </div>
	                          </div>
	                        </div>
	                        <div className="mt-2 flex justify-between items-center">
	                          <span className="text-xs text-orange-600 font-medium">
	                            Alerts: {session.suspiciousActivityCount}
	                          </span>
	                          <Button 
	                            size="sm" 
	                            variant="outline" 
	                            onClick={() => {
	                              console.log('Monitor button clicked for session:', session.id);
	                              navigate(`/proctor/session/${session.id}`);
	                            }}
	                          >
	                            Monitor
	                          </Button>
	                        </div>
	                      </div>
	                    ))}
	                  </div>
	                )}
	              </CardContent>
	            </Card>
	          </div>
	          {/* Alerts List */}
	          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Suspicious activities detected during exams</CardDescription>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading alerts...</p>
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">No unacknowledged alerts</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {alerts.map((alert: any) => (
                      <div
                        key={alert.id}
                        onClick={() => setSelectedAlert(alert.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedAlert === alert.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{getAlertTypeLabel(alert.alertType)}</span>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Confidence: {alert.confidenceScore}%</span>
                              <span>Session ID: {alert.sessionId}</span>
                            </div>
                          </div>
                          {!alert.acknowledged && (
                            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Alert Details & Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alert Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAlert !== null ? (
                  (() => {
                    const alert = alerts.find((a: any) => a.id === selectedAlert);
                    return alert ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">TYPE</p>
                          <p className="text-sm font-medium">{getAlertTypeLabel(alert.alertType)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">SEVERITY</p>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">CONFIDENCE</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-500"
                                style={{ width: `${alert.confidenceScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{alert.confidenceScore}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">DESCRIPTION</p>
                          <p className="text-sm">{alert.description || 'No description'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">TIME</p>
                          <p className="text-sm">{new Date(alert.createdAt).toLocaleString()}</p>
                        </div>

                        {!alert.acknowledged && (
                          <div className="pt-4 border-t space-y-2">
                            <Button
                              onClick={() =>
                                acknowledgeAlertMutation.mutate({
                                  alertId: alert.id,
                                  notes: 'Reviewed by proctor',
                                })
                              }
                              disabled={acknowledgeAlertMutation.isPending}
                              className="w-full"
                            >
                              {acknowledgeAlertMutation.isPending ? 'Acknowledging...' : 'Acknowledge Alert'}
                            </Button>
                            <Button
                              onClick={() => navigate(`/proctor/incidents/create?alertId=${alert.id}`)}
                              variant="outline"
                              className="w-full"
                            >
                              Create Incident
                            </Button>
                          </div>
                        )}

                        {alert.acknowledged && (
                          <div className="pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>Acknowledged</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Select an alert to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
