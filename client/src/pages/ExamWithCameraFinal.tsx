import React, { useState, useRef, useEffect } from 'react';

const ExamWithCameraFinal = () => {
  // const navigate = useNavigate(); // Removed router dependency
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionLoopRef = useRef<number | null>(null);
  const lastAlertTimeRef = useRef<{[key: string]: number}>({});

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [examState, setExamState] = useState<'ready' | 'inProgress' | 'completed'>('ready');
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [score, setScore] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});

  const examQuestions = [
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: 2
    },
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correctAnswer: 1
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswer: 1
    }
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: false
      });
      
      if (videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        setCameraEnabled(true);
        startFraudDetection();
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const startFraudDetection = () => {
    const detectFrame = () => {
      if (!videoRef.current || !cameraEnabled || !canvasRef.current) return;
      
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple but effective phone detection
        const phoneDetections = detectPhones(data, canvas.width, canvas.height);
        
        phoneDetections.forEach(detection => {
          triggerAlert({
            type: 'phone_detected',
            severity: 'high',
            message: `📱 Phone detected! (${detection.confidence}% confidence)`,
          });
        });

      } catch (err) {
        console.error('Detection error:', err);
      }

      if (cameraEnabled) {
        setTimeout(() => {
          if (cameraEnabled) {
            detectionLoopRef.current = requestAnimationFrame(detectFrame);
          }
        }, 800); // Every 800ms
      }
    };

    detectionLoopRef.current = requestAnimationFrame(detectFrame);
  };

  function detectPhones(data: Uint8ClampedArray, width: number, height: number) {
    const detections = [];
    const blockSize = 30;
    
    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        let brightPixels = 0;
        let totalPixels = 0;
        
        for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
          for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
            const index = ((y + dy) * width + (x + dx)) * 4;
            const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
            
            if (brightness > 170) brightPixels++;
            totalPixels++;
          }
        }
        
        if (brightPixels / totalPixels > 0.4) {
          detections.push({
            x: x,
            y: y,
            confidence: Math.round((brightPixels / totalPixels) * 100)
          });
        }
      }
    }
    
    return detections;
  }

  const triggerAlert = (alert: {type: string, severity: string, message: string}) => {
    const lastTime = lastAlertTimeRef.current[alert.type] || 0;
    const now = Date.now();

    if (now - lastTime > 2000) { // 2 second cooldown
      lastAlertTimeRef.current[alert.type] = now;
      const newAlert = {
        id: now,
        ...alert,
        timestamp: new Date(),
      };
      
      setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionLoopRef.current) {
      cancelAnimationFrame(detectionLoopRef.current);
      detectionLoopRef.current = null;
    }
    setCameraEnabled(false);
  };

  const calculateScore = () => {
    let correctCount = 0;
    examQuestions.forEach((q, idx) => {
      if (parseInt(answers[idx] || '-1') === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(Math.round((correctCount / examQuestions.length) * 100));
  };

  useEffect(() => {
    if (examState !== 'inProgress' || !cameraEnabled) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          setExamState('completed');
          calculateScore();
          stopCamera();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, cameraEnabled]);

  const handleStartExam = () => {
    startCamera();
    setExamState('inProgress');
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: optionIndex.toString() }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < examQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitExam = () => {
    calculateScore();
    setExamState('completed');
    stopCamera();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (examState === 'completed') {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-6">Exam Results</h1>
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-4">{score}%</div>
            <p className="text-xl mb-8">Your exam score</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Exam with Camera Monitoring</h1>
            <div className="text-right">
              <div className="text-sm text-gray-600">Time Remaining</div>
              <div className="text-2xl font-mono font-bold text-red-600">{formatTime(timeRemaining)}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Exam Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Camera Feed */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Camera Monitoring</h2>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-64 object-cover rounded-lg border-2 ${cameraEnabled ? 'border-green-500' : 'border-gray-300'}`}
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas ref={canvasRef} className="hidden" />
                {!cameraEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <button
                      onClick={handleStartExam}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                      Start Exam & Enable Camera
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Question Area */}
            {cameraEnabled && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Question {currentQuestion + 1} of {examQuestions.length}
                </h2>
                <p className="text-lg mb-6">{examQuestions[currentQuestion].question}</p>
                
                <div className="space-y-3">
                  {examQuestions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-4 rounded-lg border-2 ${
                        answers[currentQuestion] === index.toString()
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {currentQuestion < examQuestions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitExam}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Submit Exam
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Alerts Sidebar */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Monitoring Alerts</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">🛡️</div>
                  <p>No alerts yet</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded border-l-4 ${
                    alert.severity === 'high' ? 'bg-red-50 border-red-500' :
                    alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-green-50 border-green-500'
                  }`}>
                    <div className="font-medium">{alert.message}</div>
                    <div className="text-xs text-gray-500">
                      {alert.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamWithCameraFinal;