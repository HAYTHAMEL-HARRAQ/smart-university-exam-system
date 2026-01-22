import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { BookOpen, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function StudentExams() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: false });
  const [, navigate] = useLocation();
  const { data: exams, isLoading, error } = trpc.exams.list.useQuery({});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Available Exams</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
          </div>
          <div className="text-sm bg-muted px-3 py-1 rounded-full capitalize">{user?.role}</div>
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
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Exams</h2>
            <p className="text-red-700">{error.message}</p>
          </div>
        ) : !exams || exams.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No Exams Available</h2>
            <p className="text-muted-foreground">Check back soon for available exams</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{exam.title}</CardTitle>
                  <CardDescription>{exam.courseCode}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{exam.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span>{exam.totalQuestions} questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      <span>Max Score: {exam.maxScore}</span>
                    </div>
                  </div>

                  {exam.description && (
                    <p className="text-sm text-muted-foreground">{exam.description}</p>
                  )}

                  <div className="pt-4">
                    <div className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {exam.status}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      className="flex-1" 
                      disabled={exam.status !== 'active'}
                      onClick={() => {
                        if (exam.status === 'active') {
                          navigate(`/student/exam?examId=${exam.id}&examName=${encodeURIComponent(exam.title)}`);
                        }
                      }}
                    >
                      {exam.status === 'active' ? '📝 Normal Mode' : `${exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}`}
                    </Button>
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700" 
                      disabled={exam.status !== 'active'}
                      onClick={() => {
                        console.log('Camera button clicked', exam.id);
                        navigate(`/student/exam-camera?examId=${exam.id}&examName=${encodeURIComponent(exam.title)}`);
                      }}
                    >
                      {exam.status === 'active' ? '📹 With Camera' : 'Unavailable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
