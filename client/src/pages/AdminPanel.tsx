import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Settings, BarChart3, Users, AlertCircle, Database, ArrowUpRight } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminPanel() {
  const [, navigate] = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    courseCode: "",
    department: "",
    duration: 60,
    detectionSensitivity: "medium" as "low" | "medium" | "high",
  });

  // Fetch exams
  const { data: exams = [], isLoading: examsLoading, refetch: refetchExams } = trpc.exams.list.useQuery({});

  // Create exam mutation
  const createExamMutation = trpc.exams.create.useMutation({
    onSuccess: () => {
      refetchExams();
      setShowCreateForm(false);
      setFormData({
        title: "",
        courseCode: "",
        department: "",
        duration: 60,
        detectionSensitivity: "medium",
      });
    },
  });

  const handleCreateExam = () => {
    createExamMutation.mutate({
      title: formData.title,
      courseCode: formData.courseCode,
      department: formData.department,
      duration: formData.duration,
      detectionSensitivity: formData.detectionSensitivity,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage exams and system configuration</p>
          </div>
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{exams.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {exams.filter((e: any) => e.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {exams.filter((e: any) => e.status === 'scheduled').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {exams.filter((e: any) => e.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Exams List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Exams</CardTitle>
                  <CardDescription>Create and manage university exams</CardDescription>
                </div>
                <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Exam
                </Button>
              </CardHeader>
              <CardContent>
                {examsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading exams...</p>
                  </div>
                ) : exams.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No exams yet. Create one to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {exams.map((exam: any) => (
                      <div key={exam.id} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-all">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="font-medium">{exam.title}</h3>
                            <p className="text-sm text-muted-foreground">{exam.courseCode} • {exam.department}</p>
                          </div>
                          <Badge className={getStatusColor(exam.status)}>
                            {exam.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <span>Duration: {exam.duration} min</span>
                          <span>Sensitivity: {exam.detectionSensitivity}</span>
                          <span>Biometric: {exam.requiresBiometric ? 'Required' : 'Optional'}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Settings className="w-3 h-3 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Create Exam Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Exam</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Exam Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Calculus Final Exam"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="courseCode">Course Code</Label>
                  <Input
                    id="courseCode"
                    placeholder="e.g., MATH-101"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Mathematics"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="sensitivity">Detection Sensitivity</Label>
                  <Select value={formData.detectionSensitivity} onValueChange={(value) => setFormData({ ...formData, detectionSensitivity: value as "low" | "medium" | "high" })}>
                    <SelectTrigger id="sensitivity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    onClick={handleCreateExam}
                    disabled={createExamMutation.isPending || !formData.title || !formData.courseCode}
                    className="w-full"
                  >
                    {createExamMutation.isPending ? 'Creating...' : 'Create Exam'}
                  </Button>
                  <Button onClick={() => setShowCreateForm(false)} variant="outline" className="w-full" type="button">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          {!showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => navigate("/admin/analytics")} variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button onClick={() => navigate("/admin/users")} variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button onClick={() => navigate("/admin/oracle-demo")} variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Oracle Connection
                </Button>
                <Button onClick={() => navigate("/admin/migrate-mysql-oracle")} variant="outline" className="w-full justify-start">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  MySQL to Oracle Migration
                </Button>
                <Button onClick={() => navigate("/admin/settings")} variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
                <Button onClick={() => navigate("/proctor/incidents")} variant="outline" className="w-full justify-start">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Review Incidents
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}


