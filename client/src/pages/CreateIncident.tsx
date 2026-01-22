import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";

// Helper to parse query string
const useQuery = () => {
  const [, params] = useRoute("/proctor/incidents/create");
  return params;
};

export default function CreateIncident() {
  const [, navigate] = useLocation();
  const query = useQuery();
  const alertId = query?.alertId ? parseInt(query.alertId as string) : null;

  const [formData, setFormData] = useState({
    sessionId: 0,
    incidentType: "cheating_confirmed",
    severity: "moderate",
    description: "",
    recommendedAction: "",
    evidenceUrls: [] as string[],
  });

  // Fetch alert details if an alertId is provided
  const { data: alert, isLoading: alertLoading } = trpc.alerts.getById.useQuery(
    { alertId: alertId! },
    { enabled: alertId !== null, refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (alert) {
      setFormData(prev => ({
        ...prev,
        sessionId: alert.sessionId,
        description: `Incident created from Alert #${alert.id}: ${alert.description || alert.alertType}`,
        evidenceUrls: alert.videoClipUrl ? [alert.videoClipUrl] : [],
      }));
    }
  }, [alert]);

  // Create incident mutation
  const createIncidentMutation = trpc.incidents.create.useMutation({
    onSuccess: () => {
      toast.success("Incident created successfully!");
      navigate("/proctor/incidents");
    },
    onError: (error) => {
      toast.error(`Failed to create incident: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sessionId || !formData.description) {
      toast.error("Session ID and Description are required.");
      return;
    }

    createIncidentMutation.mutate({
      sessionId: formData.sessionId,
      incidentType: formData.incidentType as any,
      severity: formData.severity as any,
      description: formData.description,
      recommendedAction: formData.recommendedAction || undefined,
      evidenceUrls: formData.evidenceUrls.length > 0 ? formData.evidenceUrls : undefined,
    });
  };

  if (alertId !== null && alertLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (alertId !== null && !alert) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Alert Not Found</h1>
        <p className="text-muted-foreground mb-6">The alert you are trying to create an incident from does not exist.</p>
        <Button onClick={() => navigate("/proctor")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Proctor Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Create New Incident</h1>
            <p className="text-sm text-muted-foreground">Formalize a suspicious activity into a reportable incident</p>
          </div>
          <Button onClick={() => navigate("/proctor/incidents")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Incidents
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Session ID */}
              <div>
                <Label htmlFor="sessionId">Exam Session ID</Label>
                <Input
                  id="sessionId"
                  type="number"
                  placeholder="e.g., 12345"
                  value={formData.sessionId || ''}
                  onChange={(e) => setFormData({ ...formData, sessionId: parseInt(e.target.value) || 0 })}
                  disabled={alertId !== null}
                />
                {alertId !== null && <p className="text-xs text-muted-foreground mt-1">Pre-filled from Alert #{alertId}</p>}
              </div>

              {/* Incident Type */}
              <div>
                <Label htmlFor="incidentType">Incident Type</Label>
                <Select value={formData.incidentType} onValueChange={(value) => setFormData({ ...formData, incidentType: value as any })}>
                  <SelectTrigger id="incidentType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cheating_confirmed">Cheating Confirmed</SelectItem>
                    <SelectItem value="unauthorized_assistance">Unauthorized Assistance</SelectItem>
                    <SelectItem value="technical_violation">Technical Violation</SelectItem>
                    <SelectItem value="false_positive">False Positive</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Severity */}
              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value as any })}>
                  <SelectTrigger id="severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the incident and evidence."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                />
              </div>

              {/* Recommended Action */}
              <div>
                <Label htmlFor="recommendedAction">Recommended Action (Optional)</Label>
                <Input
                  id="recommendedAction"
                  placeholder="e.g., 0-grade, 1-year suspension"
                  value={formData.recommendedAction}
                  onChange={(e) => setFormData({ ...formData, recommendedAction: e.target.value })}
                />
              </div>

              {/* Evidence URLs (Simplified for now) */}
              <div>
                <Label htmlFor="evidenceUrls">Evidence URLs (Video Clips, Screenshots)</Label>
                <Textarea
                  id="evidenceUrls"
                  placeholder="Enter one URL per line."
                  value={formData.evidenceUrls.join('\n')}
                  onChange={(e) => setFormData({ ...formData, evidenceUrls: e.target.value.split('\n').filter(url => url.trim() !== '') })}
                  rows={3}
                />
                {alert?.videoClipUrl && <p className="text-xs text-muted-foreground mt-1">Alert video clip URL pre-filled.</p>}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createIncidentMutation.isPending || !formData.sessionId || !formData.description}
              >
                {createIncidentMutation.isPending ? 'Creating Incident...' : 'Create Incident'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
