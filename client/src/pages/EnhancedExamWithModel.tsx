import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModelBasedCamera from '@/components/ModelBasedCamera';
import { 
  ArrowLeft, 
  Camera, 
  CameraOff, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Shield,
  Zap 
} from 'lucide-react';

interface DetectionAlert {
  id: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  confidence: number;
  timestamp: Date;
}

export default function EnhancedExamWithModel() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const examId = params.get('examId');
  const examName = params.get('examName') || 'Enhanced Proctored Exam';

  const [examState, setExamState] = useState<'instructions' | 'inProgress' | 'completed'>('instructions');
  const [timeRemaining, setTimeRemaining] = useState(120 * 60); // 2 hours
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [detectionAlerts, setDetectionAlerts] = useState<DetectionAlert[]>([]);
  const [isProctoringActive, setIsProctoringActive] = useState(false);

  // Mock exam questions
  const examQuestions = [
    {
      id: 1,
      question: 'What is the primary purpose of a convolutional neural network?',
      options: [
        'Data storage and retrieval',
        'Pattern recognition in images',
        'Network communication protocols',
        'Database management'
      ],
      correctAnswer: 1,
      category: 'Machine Learning',
    },
    {
      id: 2,
      question: 'Which algorithm is commonly used for object detection in computer vision?',
      options: [
        'Linear Regression',
        'YOLO (You Only Look Once)',
        'K-Means Clustering',
        'Decision Trees'
      ],
      correctAnswer: 1,
      category: 'Computer Vision',
    },
    {
      id: 3,
      question: 'What does the term "overfitting" refer to in machine learning?',
      options: [
        'Model performs poorly on training data',
        'Model memorizes training data too well',
        'Insufficient training data',
        'Incorrect feature selection'
      ],
      correctAnswer: 1,
      category: 'ML Fundamentals',
    },
    {
      id: 4,
      question: 'Which activation function is commonly used in hidden layers of neural networks?',
      options: [
        'Linear',
        'ReLU (Rectified Linear Unit)',
        'Step Function',
        'Sigmoid only'
      ],
      correctAnswer: 1,
      category: 'Neural Networks',
    },
    {
      id: 5,
      question: 'What is the main advantage of transfer learning?',
      options: [
        'Reduced computational cost',
        'Faster training with pre-trained models',
        'Better data visualization',
        'Simplified model architecture'
      ],
      correctAnswer: 1,
      category: 'Deep Learning',
    },
  ];

  // Handle detection alerts from camera component
  const handleDetectionAlerts = (newAlerts: DetectionAlert[]) => {
    setDetectionAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]);
    
    // Auto-flag exam for review if critical alerts detected
    const criticalAlerts = newAlerts.filter(alert => alert.severity === 'critical');
    if (criticalAlerts.length > 0) {
      console.log('🚨 Critical violation detected! Flagging exam for manual review...');
      // In real implementation, this would send alert to proctor dashboard
    }
  };

  // Timer effect
  useEffect(() => {
    if (examState !== 'inProgress' || !isProctoringActive) return;

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
  }, [examState, isProctoringActive]);

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
    console.log('🚀 Starting enhanced proctored exam with AI monitoring...');
    setIsProctoringActive(true);
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
    setIsProctoringActive(false);
    console.log('✅ Exam submitted with', detectionAlerts.length, 'security alerts recorded');
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
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <CardTitle className="text-3xl">{examName}</CardTitle>
              </div>
              <CardDescription>AI-Powered Proctored Examination</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Exam Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-2xl font-bold text-blue-600">{examQuestions.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-2xl font-bold text-purple-600">2h</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">AI Monitoring</p>
                  <p className="text-2xl font-bold text-green-600">ACTIVE</p>
                </div>
              </div>

              {/* Enhanced Instructions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Enhanced Security Features:
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Real-time AI Monitoring:</strong> Advanced computer vision detects phones, multiple faces, and suspicious behavior</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Trained Model Integration:</strong> Uses your custom YOLO model for precise object detection</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Behavioral Analysis:</strong> Monitors eye movement, head position, and attention patterns</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold">⚠</span>
                    <span><strong>Automatic Flagging:</strong> Violations are logged and reviewed by human proctors</span>
                  </li>
                </ul>
              </div>

              {/* Camera Requirement Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Camera className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Camera Access Required</p>
                    <p className="text-sm text-amber-800 mt-1">
                      Your camera will be activated for continuous AI-powered proctoring throughout the exam. 
                      Ensure good lighting and position your camera at eye level.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => navigate('/student/exams')} 
                  variant="outline" 
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Exams
                </Button>
                <Button 
                  onClick={handleStartExam} 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Start Secure Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exam In Progress State */}
      {examState === 'inProgress' && (
        <div className="min-h-screen bg-background p-4">
          {/* Enhanced Header with Security Status */}
          <header className="sticky top-0 z-10 bg-card border-b border-border mb-6">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                    {examName}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {examQuestions.length}
                  </p>
                </div>
                
                <div className="flex items-center gap-6 flex-wrap">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    timeRemaining < 600 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span className="font-bold">{formatTime(timeRemaining)}</span>
                  </div>
                  
                  <Badge 
                    variant={isProctoringActive ? "default" : "destructive"} 
                    className="flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    {isProctoringActive ? 'AI PROCTORING' : 'PROCTORING OFF'}
                  </Badge>
                  
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                    detectionAlerts.length === 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <AlertCircle className="w-3 h-3" />
                    {detectionAlerts.length} ALERTS
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Enhanced Camera Monitoring Sidebar */}
              <div className="lg:col-span-1">
                <ModelBasedCamera 
                  onDetection={handleDetectionAlerts}
                  isActive={isProctoringActive}
                  showFeed={true}
                />
              </div>

              {/* Main Exam Content */}
              <div className="lg:col-span-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">Question {currentQuestion + 1}</CardTitle>
                        <CardDescription className="mt-2 flex items-center gap-2">
                          <span>{question.category}</span>
                          <Badge variant="secondary">{Math.round(((currentQuestion + 1) / examQuestions.length) * 100)}%</Badge>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Security Status</p>
                        <div className="flex items-center gap-2 mt-1">
                          {detectionAlerts.length === 0 ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            detectionAlerts.length === 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {detectionAlerts.length === 0 ? 'Clear' : `${detectionAlerts.length} Alerts`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Question Text */}
                    <div className="bg-muted p-6 rounded-lg border-l-4 border-blue-500">
                      <p className="text-lg font-semibold">{question.question}</p>
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-4">
                      {question.options.map((option, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleAnswerSelect(idx)}
                          className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            answers[currentQuestion] === idx.toString()
                              ? 'border-blue-600 bg-blue-50 shadow-md'
                              : 'border-muted hover:border-blue-300 bg-background hover:bg-blue-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                answers[currentQuestion] === idx.toString()
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-gray-300 text-gray-400'
                              }`}
                            >
                              {answers[currentQuestion] === idx.toString() && (
                                <span className="text-white text-lg font-bold">✓</span>
                              )}
                            </div>
                            <span className="text-base font-medium">{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Navigation and Progress */}
                    <div className="pt-6 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                            style={{ width: `${(answeredCount / examQuestions.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-4 text-sm text-muted-foreground whitespace-nowrap">
                          {answeredCount}/{examQuestions.length} answered
                        </span>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex gap-3">
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
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          >
                            Submit Exam Securely
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleNextQuestion} 
                            className="flex-1"
                          >
                            Next →
                          </Button>
                        )}
                      </div>
                    </div>
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
          <Card className="max-w-3xl w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (score / 100) * 283}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                    <text x="50" y="55" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#10b981">
                      {score}%
                    </text>
                  </svg>
                </div>
              </div>
              <CardTitle className="text-4xl flex items-center justify-center gap-3">
                <Shield className="w-10 h-10 text-green-600" />
                Exam Secured & Submitted!
              </CardTitle>
              <CardDescription className="text-xl mt-3">
                Your enhanced proctored exam has been successfully completed
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Enhanced Results Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-5 rounded-lg text-center border border-green-200">
                  <p className="text-sm text-muted-foreground">Final Score</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{Math.round(score / 5)}/20</p>
                </div>
                
                <div className="bg-blue-50 p-5 rounded-lg text-center border border-blue-200">
                  <p className="text-sm text-muted-foreground">Percentage</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{score}%</p>
                </div>
                
                <div className="bg-purple-50 p-5 rounded-lg text-center border border-purple-200">
                  <p className="text-sm text-muted-foreground">Security Alerts</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{detectionAlerts.length}</p>
                </div>
                
                <div className="bg-amber-50 p-5 rounded-lg text-center border border-amber-200">
                  <p className="text-sm text-muted-foreground">Time Used</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    {Math.floor((120 * 60 - timeRemaining) / 60)}m
                  </p>
                </div>
              </div>

              {/* Security Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Security Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-green-700">✓ AI Proctoring Active</p>
                    <p className="text-muted-foreground ml-2">Continuous monitoring throughout exam</p>
                  </div>
                  <div>
                    <p className="font-semibold text-green-700">✓ Model-Based Detection</p>
                    <p className="text-muted-foreground ml-2">Custom YOLO model integration</p>
                  </div>
                  <div>
                    <p className="font-semibold text-green-700">✓ Behavioral Analysis</p>
                    <p className="text-muted-foreground ml-2">Advanced pattern recognition</p>
                  </div>
                  <div>
                    <p className={`font-semibold ${detectionAlerts.length === 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {detectionAlerts.length === 0 ? '✓' : '⚠'} Security Incidents
                    </p>
                    <p className="text-muted-foreground ml-2">
                      {detectionAlerts.length === 0 
                        ? 'No violations detected' 
                        : `${detectionAlerts.length} incidents recorded for review`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button 
                  onClick={() => navigate('/student/sessions')} 
                  className="flex-1"
                >
                  View Exam Session Details
                </Button>
                <Button 
                  onClick={() => navigate('/student/exams')} 
                  variant="outline" 
                  className="flex-1"
                >
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