import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle, XCircle, BarChart3, Clock, AlertCircle } from "lucide-react";

export default function ExamDetails() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('sessionId');

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">No exam session selected</h2>
          <Button onClick={() => navigate("/student/sessions")} className="mt-4">
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button onClick={() => navigate("/student/sessions")} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sessions
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Performance Breakdown</CardTitle>
              <CardDescription>Detailed analysis of your exam results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Score */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">Overall Score</p>
                  <div className="text-6xl font-bold text-blue-600">72</div>
                  <p className="text-sm text-muted-foreground mt-2">/100</p>
                </div>
              </div>

              {/* Score by Category */}
              <div>
                <h3 className="font-semibold mb-4">Performance by Topic</h3>
                <div className="space-y-3">
                  {[
                    { topic: 'Fundamentals', score: 85, max: 100, correct: 17, total: 20 },
                    { topic: 'Algorithms', score: 72, max: 100, correct: 18, total: 25 },
                    { topic: 'Data Structures', score: 65, max: 100, correct: 13, total: 20 },
                    { topic: 'Advanced Concepts', score: 60, max: 100, correct: 12, total: 20 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.topic}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.correct}/{item.total} correct
                        </p>
                      </div>
                      <div className="w-32">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 h-2 bg-background rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                              style={{ width: `${(item.score / item.max) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-sm">{item.score}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <CheckCircle className="w-6 h-6 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-600">60</p>
                  <p className="text-xs text-muted-foreground">Correct Answers</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <XCircle className="w-6 h-6 mx-auto text-red-600 mb-2" />
                  <p className="text-2xl font-bold text-red-600">15</p>
                  <p className="text-xs text-muted-foreground">Incorrect Answers</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <AlertCircle className="w-6 h-6 mx-auto text-yellow-600 mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">5</p>
                  <p className="text-xs text-muted-foreground">Unanswered</p>
                </div>
              </div>

              {/* Exam Duration */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Time Taken</p>
                  <p className="text-xs text-muted-foreground">1 hour 45 minutes (out of 2 hours)</p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Study Recommendations</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Focus on Data Structures (65%) - Your weakest area</li>
                  <li>✓ Review Advanced Concepts (60%) - Needs improvement</li>
                  <li>✓ Practice more with complex algorithms</li>
                  <li>✓ Great job on Fundamentals (85%) - Keep it up!</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Wrong Answers Review */}
          <Card>
            <CardHeader>
              <CardTitle>Review Incorrect Answers</CardTitle>
              <CardDescription>Learn from your mistakes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { q: 'Question 7: What is the time complexity of binary search?', yourAnswer: 'O(n)', correctAnswer: 'O(log n)', topic: 'Algorithms' },
                { q: 'Question 12: Which data structure is LIFO?', yourAnswer: 'Queue', correctAnswer: 'Stack', topic: 'Data Structures' },
                { q: 'Question 18: What is memoization?', yourAnswer: 'A caching technique', correctAnswer: 'A caching technique for dynamic programming', topic: 'Advanced Concepts' },
              ].map((item, idx) => (
                <div key={idx} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <p className="font-medium text-sm mb-2">{item.q}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Your Answer</p>
                      <p className="text-red-600 font-medium">{item.yourAnswer}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Correct Answer</p>
                      <p className="text-green-600 font-medium">{item.correctAnswer}</p>
                    </div>
                  </div>
                  <Badge className="mt-3">{item.topic}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/student/exams")} className="flex-1">
              Take Another Exam
            </Button>
            <Button onClick={() => navigate("/student/sessions")} variant="outline" className="flex-1">
              View All Sessions
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
