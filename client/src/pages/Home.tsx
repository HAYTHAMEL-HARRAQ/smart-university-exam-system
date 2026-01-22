import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Shield, BarChart3, Users, AlertCircle, LogOut } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    // Clear the session cookie by navigating to login
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Smart University Exam System</h1>
            <p className="text-lg text-muted-foreground">AI-Powered Proctoring & Cheating Detection</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Secure • Intelligent • Fair</span>
            </div>
            <a href="/login">
              <Button size="lg" className="w-full">
                Sign In to Continue
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <Users className="w-5 h-5 mx-auto text-primary" />
              <p className="font-medium">For Students</p>
              <p className="text-xs text-muted-foreground">Take exams securely</p>
            </div>
            <div className="space-y-2">
              <AlertCircle className="w-5 h-5 mx-auto text-primary" />
              <p className="font-medium">For Proctors</p>
              <p className="text-xs text-muted-foreground">Monitor in real-time</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user - show role-based dashboard
  const isDashboardUser = user?.role === 'admin' || user?.role === 'proctor';
  const isStudent = user?.role === 'student';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Smart Exam System</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm bg-muted px-3 py-1 rounded-full capitalize">{user?.role}</div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isStudent && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Available Exams</CardTitle>
                  <CardDescription>View and take your scheduled exams</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/student/exams")} className="w-full">
                    View Exams
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>My Sessions</CardTitle>
                  <CardDescription>Review your exam history and results</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/student/sessions")} variant="outline" className="w-full">
                    View History
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {isDashboardUser && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Live Monitoring
                  </CardTitle>
                  <CardDescription>Monitor active exam sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/proctor")} className="w-full">
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Incidents
                  </CardTitle>
                  <CardDescription>Review flagged incidents</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/proctor/incidents")} variant="outline" className="w-full">
                    View Incidents
                  </Button>
                </CardContent>
              </Card>

              {user?.role === 'admin' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Administration
                    </CardTitle>
                    <CardDescription>Manage exams and users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => navigate("/admin")} variant="outline" className="w-full">
                      Admin Panel
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {user?.role === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle>Analytics & Reports</CardTitle>
                  <CardDescription>View fraud trends and system statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/admin/analytics")} className="w-full">
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
