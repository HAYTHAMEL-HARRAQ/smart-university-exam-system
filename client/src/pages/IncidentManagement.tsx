import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, Clock, Search, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";

export default function IncidentManagement() {
  const [, navigate] = useLocation();
  const [selectedIncident, setSelectedIncident] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

  // Fetch incidents
  const { data: incidents = [], isLoading: incidentsLoading, refetch: refetchIncidents } = trpc.incidents.list.useQuery({ status: filterStatus });

  // Fetch single incident details for the sidebar
  const { data: incidentDetails, isLoading: detailsLoading, refetch: refetchDetails } = trpc.incidents.getById.useQuery(
    { id: selectedIncident! },
    { enabled: selectedIncident !== null }
  );

  // Update incident status mutation
  const updateIncidentMutation = trpc.incidents.updateStatus.useMutation({
    onSuccess: () => {
      refetchIncidents();
      refetchDetails();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'appealed':
        return 'bg-orange-100 text-orange-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600';
      case 'major':
        return 'text-orange-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'minor':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleUpdateStatus = (status: 'pending' | 'investigating' | 'resolved' | 'appealed' | 'dismissed', resolution?: string) => {
    if (selectedIncident) {
      updateIncidentMutation.mutate({
        id: selectedIncident,
        status,
        resolution,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Incident Management</h1>
            <p className="text-sm text-muted-foreground">Review, investigate, and resolve flagged exam incidents</p>
          </div>
          <Button onClick={() => navigate("/proctor")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Proctor Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Incidents List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>All Incidents</CardTitle>
                <CardDescription>
                  {incidents.length} incidents found. Filter by status:
                  <select
                    className="ml-2 border rounded-md p-1 text-sm"
                    value={filterStatus || ''}
                    onChange={(e) => setFilterStatus(e.target.value || undefined)}
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="appealed">Appealed</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {incidentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading incidents...</p>
                  </div>
                ) : incidents.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">No incidents found with the current filter.</p>
                  </div>
                ) : (
                  <div className="max-h-[600px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Reported</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incidents.map((incident: any) => (
                          <TableRow
                            key={incident.id}
                            onClick={() => setSelectedIncident(incident.id)}
                            className={`cursor-pointer ${selectedIncident === incident.id ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                          >
                            <TableCell className="font-medium">{incident.id}</TableCell>
                            <TableCell>{incident.incidentType.replace('_', ' ')}</TableCell>
                            <TableCell>
                              <span className={`font-medium ${getSeverityColor(incident.severity)}`}>
                                {incident.severity.toUpperCase()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(incident.status)}>
                                {incident.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(incident.createdAt), 'MMM d, h:mm a')}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Incident Details & Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Incident Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedIncident === null ? (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Select an incident to view details</p>
                  </div>
                ) : detailsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading details...</p>
                  </div>
                ) : incidentDetails ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">SESSION ID</p>
                      <p className="text-sm font-medium">{incidentDetails.sessionId}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">TYPE</p>
                      <p className="text-sm font-medium">{incidentDetails.incidentType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">SEVERITY</p>
                      <Badge className={getStatusColor(incidentDetails.severity)}>
                        {incidentDetails.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">DESCRIPTION</p>
                      <p className="text-sm">{incidentDetails.description}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">REPORTED BY</p>
                      <p className="text-sm">{incidentDetails.reportedBy}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">CREATED AT</p>
                      <p className="text-sm">{format(new Date(incidentDetails.createdAt), 'MMM d, yyyy h:mm a')}</p>
                    </div>

                    {incidentDetails.status !== 'resolved' && incidentDetails.status !== 'dismissed' && (
                      <div className="pt-4 border-t space-y-2">
                        <Button
                          onClick={() => handleUpdateStatus('investigating')}
                          disabled={updateIncidentMutation.isPending || incidentDetails.status === 'investigating'}
                          className="w-full"
                        >
                          {incidentDetails.status === 'investigating' ? 'Investigating...' : 'Mark as Investigating'}
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus('resolved', 'Confirmed cheating and applied penalty.')}
                          disabled={updateIncidentMutation.isPending}
                          variant="destructive"
                          className="w-full"
                        >
                          Resolve Incident
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus('dismissed', 'False positive, no action required.')}
                          disabled={updateIncidentMutation.isPending}
                          variant="outline"
                          className="w-full"
                        >
                          Dismiss Incident
                        </Button>
                      </div>
                    )}

                    {(incidentDetails.status === 'resolved' || incidentDetails.status === 'dismissed') && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>{incidentDetails.status === 'resolved' ? 'Resolved' : 'Dismissed'}</span>
                        </div>
                        {incidentDetails.resolution && (
                          <p className="text-xs text-muted-foreground mt-2">Resolution: {incidentDetails.resolution}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Incident not found.</p>
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
