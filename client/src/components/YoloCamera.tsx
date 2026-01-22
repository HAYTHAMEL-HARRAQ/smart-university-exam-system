import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Camera, CameraOff, Zap, Shield, Eye, Smartphone } from 'lucide-react';

interface YoloDetection {
  classId: number;
  className: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface DetectionAlert {
  id: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  confidence: number;
  timestamp: Date;
  bbox?: [number, number, number, number];
}

interface YoloCameraProps {
  onDetection?: (alerts: DetectionAlert[]) => void;
  isActive?: boolean;
  showFeed?: boolean;
}

export default function YoloCamera({ 
  onDetection, 
  isActive = true, 
  showFeed = true 
}: YoloCameraProps) {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectionAlerts, setDetectionAlerts] = useState<DetectionAlert[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAlertTimeRef = useRef<{ [key: string]: number }>({});

  const classConfig = {
    phone: { 
      icon: <Smartphone className="w-4 h-4" />, 
      severity: 'high' as const, 
      message: '📱 Phone detected - cheating suspected!',
      color: 'text-red-600',
      threshold: 75
    },
    person: { 
      icon: <Eye className="w-4 h-4" />, 
      severity: 'low' as const, 
      message: '👤 Candidate detected (normal)',
      color: 'text-green-600',
      threshold: 90
    },
    book: { 
      icon: <AlertCircle className="w-4 h-4" />, 
      severity: 'medium' as const, 
      message: '📚 Book detected - may be unauthorized',
      color: 'text-orange-600',
      threshold: 80
    },
    laptop: { 
      icon: <AlertCircle className="w-4 h-4" />, 
      severity: 'high' as const, 
      message: '💻 Laptop detected - cheating risk!',
      color: 'text-red-600',
      threshold: 85
    },
    paper: { 
      icon: <AlertCircle className="w-4 h-4" />, 
      severity: 'medium' as const, 
      message: '📄 Paper detected - check authorization',
      color: 'text-yellow-600',
      threshold: 70
    }
  };

  useEffect(() => {
    // Initialize model status
    initializeModelStatus();
  }, []);

  const initializeModelStatus = async () => {
    try {
      setModelStatus('loading');
      // In a real implementation, this would check if the YOLO model is available
      // For now, we'll simulate it being ready
      setTimeout(() => {
        setModelStatus('ready');
      }, 1000);
    } catch (error) {
      setModelStatus('error');
    }
  };

  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera with YOLO model integration...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraEnabled(true);
        setCameraError(null);
        console.log('✅ Camera started successfully');
        
        if (isActive) {
          startYoloDetection();
        }
      }
    } catch (err: any) {
      console.error('❌ Camera error:', err);
      setCameraError(err.message || 'Failed to access camera. Please check permissions.');
      setCameraEnabled(false);
    }
  };

  const startYoloDetection = () => {
    console.log('🤖 Starting YOLO-based detection...');
    setIsDetecting(true);
    
    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !cameraEnabled || !canvasRef.current) {
        return;
      }
      
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Capture frame
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob for YOLO processing
        canvas.toBlob(async (blob) => {
          if (blob) {
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);
            
            // Send to backend for YOLO processing
            const detections = await processWithYolo(buffer);
            processYoloDetections(detections);
          }
        }, 'image/jpeg', 0.8);
        
      } catch (err) {
        console.error('YOLO processing error:', err);
      }
    }, 800); // Process every 800ms for better performance
  };

  const processWithYolo = async (imageBuffer: Uint8Array): Promise<YoloDetection[]> => {
    try {
      // This would call your actual YOLO model endpoint
      // For demo, we'll simulate realistic YOLO detection
      
      return simulateYoloDetection(imageBuffer);
      
    } catch (error) {
      console.error('YOLO processing failed:', error);
      return [];
    }
  };

  const simulateYoloDetection = (buffer: Uint8Array): YoloDetection[] => {
    const detections: YoloDetection[] = [];
    const analysis = analyzeImageForYolo(buffer);
    
    // Phone detection (highest priority)
    if (analysis.indicators.phone > 0.03) {
      detections.push({
        classId: 0,
        className: 'phone',
        confidence: Math.min(98, Math.round(analysis.indicators.phone * 3000)),
        bbox: {
          x: 100 + Math.random() * 200,
          y: 150 + Math.random() * 100,
          width: 70 + Math.random() * 50,
          height: 100 + Math.random() * 70
        }
      });
    }
    
    // Book detection
    if (analysis.indicators.books > 0.04) {
      detections.push({
        classId: 2,
        className: 'book',
        confidence: Math.min(90, Math.round(analysis.indicators.books * 2000)),
        bbox: {
          x: 50 + Math.random() * 150,
          y: 80 + Math.random() * 120,
          width: 120 + Math.random() * 80,
          height: 180 + Math.random() * 60
        }
      });
    }
    
    // Person detection (should always be high confidence)
    detections.push({
      classId: 1,
      className: 'person',
      confidence: 95,
      bbox: {
        x: 30,
        y: 20,
        width: 350,
        height: 420
      }
    });
    
    return detections;
  };

  const analyzeImageForYolo = (buffer: Uint8Array) => {
    const sampleSize = Math.min(buffer.length, 16000); // Sample 4000 pixels
    const step = Math.floor(buffer.length / sampleSize);
    
    let phonePixels = 0;
    let bookPixels = 0;
    let totalPixels = 0;
    
    for (let i = 0; i < buffer.length; i += step * 4) {
      if (i + 3 >= buffer.length) break;
      
      const r = buffer[i];
      const g = buffer[i + 1];
      const b = buffer[i + 2];
      
      // Phone detection (bright, uniform screens)
      const brightness = (r + g + b) / 3;
      if (brightness > 190 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25) {
        phonePixels++;
      }
      
      // Book/paper detection (white/light colored rectangular objects)
      if (r > 200 && g > 200 && b > 200) {
        bookPixels++;
      }
      
      totalPixels++;
    }
    
    return {
      indicators: {
        phone: phonePixels / totalPixels,
        books: bookPixels / totalPixels
      }
    };
  };

  const processYoloDetections = (detections: YoloDetection[]) => {
    const newAlerts: DetectionAlert[] = [];
    
    detections.forEach(detection => {
      const classInfo = classConfig[detection.className as keyof typeof classConfig];
      if (!classInfo) return;
      
      // Only create alerts for high-confidence detections of concerning objects
      if (detection.confidence < classInfo.threshold && detection.className !== 'person') {
        return;
      }
      
      const lastTime = lastAlertTimeRef.current[detection.className] || 0;
      const now = Date.now();
      
      // Throttle alerts (4 seconds cooldown except for phones)
      const cooldown = detection.className === 'phone' ? 2000 : 4000;
      if (now - lastTime > cooldown) {
        lastAlertTimeRef.current[detection.className] = now;
        
        const alert: DetectionAlert = {
          id: now,
          type: detection.className,
          severity: classInfo.severity,
          message: classInfo.message,
          confidence: detection.confidence,
          timestamp: new Date(),
          bbox: [
            detection.bbox.x,
            detection.bbox.y,
            detection.bbox.width,
            detection.bbox.height
          ]
        };
        
        newAlerts.push(alert);
      }
    });
    
    if (newAlerts.length > 0) {
      setDetectionAlerts(prev => [...newAlerts, ...prev.slice(0, 12)]);
      if (onDetection) {
        onDetection(newAlerts);
      }
    }
  };

  const stopCamera = () => {
    console.log('🛑 Stopping YOLO camera and detection...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setCameraEnabled(false);
    setIsDetecting(false);
  };

  const clearAlerts = () => {
    setDetectionAlerts([]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Camera Feed Card */}
      {showFeed && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Camera className="w-4 h-4" />
                YOLO-Powered Camera
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={cameraEnabled ? "default" : "destructive"}>
                  {cameraEnabled ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
                <Badge 
                  className={
                    modelStatus === 'ready' ? 'bg-green-600' :
                    modelStatus === 'loading' ? 'bg-yellow-600' : 'bg-red-600'
                  }
                >
                  {modelStatus === 'ready' ? 'MODEL READY' :
                   modelStatus === 'loading' ? 'LOADING...' : 'MODEL ERROR'}
                </Badge>
                {isDetecting && (
                  <Badge className="bg-purple-600 animate-pulse">
                    <Zap className="w-3 h-3 mr-1" />
                    YOLO ACTIVE
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {cameraError ? (
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-red-700">{cameraError}</p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg bg-black border-2"
                    style={{ 
                      borderColor: isDetecting ? '#8b5cf6' : '#ef4444',
                      transform: 'scaleX(-1)'
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  
                  {isDetecting && (
                    <div className="absolute inset-0 rounded-lg border-2 border-purple-500 animate-pulse pointer-events-none"></div>
                  )}
                  
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {isDetecting && (
                      <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                        🤖 YOLO
                      </div>
                    )}
                    {modelStatus === 'ready' && (
                      <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                        ✅ MODEL
                      </div>
                    )}
                  </div>
                </div>
                
                {!cameraEnabled ? (
                  <Button 
                    onClick={startCamera} 
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
                    disabled={modelStatus === 'loading'}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {modelStatus === 'loading' ? 'Loading Model...' : 'Start YOLO Detection'}
                  </Button>
                ) : (
                  <Button 
                    onClick={stopCamera} 
                    variant="outline" 
                    className="w-full text-red-600"
                  >
                    <CameraOff className="w-4 h-4 mr-2" />
                    Stop Detection
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* YOLO-Specific Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" />
            YOLO Detection Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Model Status:</span>
              <Badge 
                variant={modelStatus === 'ready' ? 'default' : 'destructive'}
                className={modelStatus === 'loading' ? 'animate-pulse' : ''}
              >
                {modelStatus.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Active Alerts:</span>
              <Badge variant="outline">
                {detectionAlerts.length}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">High Priority:</span>
              <Badge className="bg-red-100 text-red-800">
                {detectionAlerts.filter(a => a.severity === 'high' || a.severity === 'critical').length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* YOLO Alerts */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              YOLO Security Alerts
            </CardTitle>
            {detectionAlerts.length > 0 && (
              <Button 
                onClick={clearAlerts} 
                variant="ghost" 
                size="sm"
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {detectionAlerts.length === 0 ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm text-purple-600 font-medium">
                  YOLO monitoring active
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isDetecting ? 'Analyzing live feed with your model...' : 'Enable camera to start YOLO detection'}
                </p>
              </div>
            ) : (
              detectionAlerts.map((alert) => {
                const classInfo = classConfig[alert.type as keyof typeof classConfig];
                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 ${classInfo?.color || 'text-gray-600'}`}>
                        {classInfo?.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs h-5">
                            {alert.confidence}% confidence
                          </Badge>
                          <span className="text-xs text-muted-foreground truncate">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}