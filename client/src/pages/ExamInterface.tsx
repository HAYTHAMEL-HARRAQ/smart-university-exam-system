import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function ExamInterface() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const examId = params.get('examId');
  const examName = params.get('examName') || 'Exam';

  const [examState, setExamState] = useState<'instructions' | 'inProgress' | 'completed'>('instructions');
  const [timeRemaining, setTimeRemaining] = useState(120 * 60); // 120 minutes in seconds
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);

  // Mock exam data
  const examQuestions = [
    {
      id: 1,
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 1,
      category: 'Algorithms',
    },
    {
      id: 2,
      question: 'Which data structure uses LIFO principle?',
      options: ['Queue', 'Stack', 'Linked List', 'Tree'],
      correctAnswer: 1,
      category: 'Data Structures',
    },
    {
      id: 3,
      question: 'What does SQL stand for?',
      options: ['Structured Query Language', 'Simple Question Language', 'Sequential Query Logic', 'Structured Question List'],
      correctAnswer: 0,
      category: 'Databases',
    },
    {
      id: 4,
      question: 'Which sorting algorithm has the best average case time complexity?',
      options: ['Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort'],
      correctAnswer: 1,
      category: 'Algorithms',
    },
    {
      id: 5,
      question: 'What is the primary purpose of an index in a database?',
      options: ['To store data', 'To speed up data retrieval', 'To encrypt data', 'To compress data'],
      correctAnswer: 1,
      category: 'Databases',
    },
  ];

  // Timer effect
  useEffect(() => {
    if (examState !== 'inProgress') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          setExamState('completed');
          calculateScore();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState]);

  const calculateScore = () => {
    let correctCount = 0;
    examQuestions.forEach((q, idx) => {
      if (parseInt(answers[idx] || '-1') === q.correctAnswer) {
        correctCount++;
      }
    });
    const calculatedScore = Math.round((correctCount / examQuestions.length) * 100);
    setScore(calculatedScore);
  };

  const handleStartExam = () => {
    setExamState('inProgress');
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers({
      ...answers,
      [currentQuestion]: optionIndex.toString(),
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < examQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitExam = () => {
    calculateScore();
    setExamState('completed');
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const question = examQuestions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Instructions State */}
      {examState === 'instructions' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="text-3xl">{examName}</CardTitle>
              <CardDescription>Exam Instructions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Exam Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-3xl font-bold text-blue-600">{examQuestions.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-3xl font-bold text-purple-600">2h</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Important Instructions:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>You have 120 minutes to complete this exam</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Answer all {examQuestions.length} questions</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>You can navigate between questions before submitting</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Your biometric information will be verified during the exam</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold">⚠</span>
                    <span>Suspicious activity (multiple faces, phone detected, etc.) will be flagged</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold">⚠</span>
                    <span>Once submitted, your exam cannot be edited</span>
                  </li>
                </ul>
              </div>

              {/* Academic Integrity */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900">Academic Integrity Commitment</p>
                    <p className="text-sm text-yellow-800 mt-1">
                      I understand and agree to maintain academic integrity. I will not cheat, plagiarize, or engage in any dishonest behavior during this exam.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={() => navigate('/student/exams')} variant="outline" className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleStartExam} className="flex-1 bg-green-600 hover:bg-green-700">
                  Start Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exam In Progress State */}
      {examState === 'inProgress' && (
        <div className="min-h-screen bg-background p-4">
          {/* Header with Timer */}
          <header className="sticky top-0 z-10 bg-card border-b border-border mb-6">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{examName}</h1>
                <p className="text-sm text-muted-foreground">Question {currentQuestion + 1} of {examQuestions.length}</p>
              </div>
              <div className={`text-3xl font-bold font-mono ${timeRemaining < 600 ? 'text-red-600' : 'text-green-600'}`}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          </header>

          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Question Area */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">Question {currentQuestion + 1}</CardTitle>
                        <CardDescription className="mt-2">{question.category}</CardDescription>
                      </div>
                      <Badge variant="outline">{Math.round(((currentQuestion + 1) / examQuestions.length) * 100)}%</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Question Text */}
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-lg font-semibold">{question.question}</p>
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-3">
                      {question.options.map((option, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleAnswerSelect(idx)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            answers[currentQuestion] === idx.toString()
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-muted hover:border-blue-300 bg-background'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                answers[currentQuestion] === idx.toString()
                                  ? 'border-blue-600 bg-blue-600'
                                  : 'border-gray-300'
                              }`}
                            >
                              {answers[currentQuestion] === idx.toString() && (
                                <span className="text-white text-sm font-bold">✓</span>
                              )}
                            </div>
                            <span className="text-sm font-medium">{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 pt-6 border-t">
                      <Button
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestion === 0}
                        variant="outline"
                        className="flex-1"
                      >
                        ← Previous
                      </Button>
                      {currentQuestion === examQuestions.length - 1 ? (
                        <Button
                          onClick={handleSubmitExam}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          Submit Exam
                        </Button>
                      ) : (
                        <Button onClick={handleNextQuestion} className="flex-1">
                          Next →
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Question Navigator Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Progress</CardTitle>
                    <CardDescription>{answeredCount} of {examQuestions.length} answered</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                        style={{ width: `${(answeredCount / examQuestions.length) * 100}%` }}
                      ></div>
                    </div>

                    {/* Question Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      {examQuestions.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentQuestion(idx)}
                          className={`aspect-square rounded-lg font-semibold text-xs transition-all ${
                            idx === currentQuestion
                              ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                              : answers[idx] !== undefined
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    {/* Time Warning */}
                    {timeRemaining < 600 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-red-900">⏰ Time Running Out!</p>
                        <p className="text-xs text-red-700 mt-1">{Math.floor(timeRemaining / 60)} minutes remaining</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exam Completed State */}
      {examState === 'completed' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (score / 100) * 283}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                    <text x="50" y="55" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#10b981">
                      {score}%
                    </text>
                  </svg>
                </div>
              </div>
              <CardTitle className="text-3xl">Exam Submitted!</CardTitle>
              <CardDescription className="text-lg mt-2">Your exam has been successfully submitted</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Score Breakdown */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {Math.round((score / 100) * examQuestions.length)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">out of {examQuestions.length}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
                  <p className="text-sm text-muted-foreground">Your Score</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{Math.round(score / 5)}/20</p>
                  <p className="text-xs text-muted-foreground mt-1">Converted Scale</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
                  <p className="text-sm text-muted-foreground">Time Taken</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{Math.floor((120 * 60 - timeRemaining) / 60)}m</p>
                  <p className="text-xs text-muted-foreground mt-1">of 120 minutes</p>
                </div>
              </div>

              {/* Result Message */}
              {score >= 80 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Excellent Performance!</p>
                      <p className="text-sm text-green-800 mt-1">You have passed the exam with flying colors. Great job!</p>
                    </div>
                  </div>
                </div>
              ) : score >= 60 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">Good Job!</p>
                      <p className="text-sm text-blue-800 mt-1">You have passed the exam. Keep practicing to improve your score.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900">Keep Studying</p>
                      <p className="text-sm text-orange-800 mt-1">Your score is below passing. Review the material and try again soon.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={() => navigate('/student/sessions')} className="flex-1">
                  View My Sessions
                </Button>
                <Button onClick={() => navigate('/student/exams')} variant="outline" className="flex-1">
                  Return to Exams
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
