import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Camera, CameraOff, Zap, Shield, Eye } from 'lucide-react';

interface DetectionAlert {
  id: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  confidence: number;
  timestamp: Date;
  bbox?: [number, number, number, number];
}

interface ModelBasedCameraProps {
  onDetection?: (alerts: DetectionAlert[]) => void;
  isActive?: boolean;
  showFeed?: boolean;
}

export default function ModelBasedCamera({ 
  onDetection, 
  isActive = true, 
  showFeed = true 
}: ModelBasedCameraProps) {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectionAlerts, setDetectionAlerts] = useState<DetectionAlert[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStats, setDetectionStats] = useState({
    totalDetections: 0,
    phoneDetections: 0,
    faceDetections: 0,
    suspiciousActivity: 0
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionLoopRef = useRef<number | null>(null);
  const lastAlertTimeRef = useRef<{ [key: string]: number }>({});

  const detectionTypes = {
    phone: { icon: '📱', severity: 'high', message: 'Phone detected in view' },
    multiple_faces: { icon: '👥', severity: 'critical', message: 'Multiple people detected' },
    person_looking_away: { icon: '👁️', severity: 'medium', message: 'Looking away from screen' },
    suspicious_object: { icon: '🔍', severity: 'medium', message: 'Suspicious object detected' },
    unauthorized_person: { icon: '👤', severity: 'high', message: 'Unauthorized person detected' }
  };

  const startCamera = async () => {
    try {
      console.log('🚀 Starting enhanced camera with model detection...');
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
          startEnhancedDetection();
        }
      }
    } catch (err: any) {
      console.error('❌ Camera error:', err);
      setCameraError(err.message || 'Failed to access camera. Please check permissions.');
      setCameraEnabled(false);
    }
  };

  const startEnhancedDetection = () => {
    console.log('🤖 Starting model-based detection...');
    setIsDetecting(true);
    
    const detectFrame = async () => {
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
        
        // Convert to blob for processing
        canvas.toBlob(async (blob) => {
          if (blob) {
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // Simulate sending to backend for model processing
            const detections = await simulateModelProcessing(buffer);
            processDetections(detections);
          }
        }, 'image/jpeg', 0.8);
        
      } catch (err) {
        console.error('Detection error:', err);
      }

      if (cameraEnabled && isActive) {
        // Process every 500ms for real-time detection
        setTimeout(() => {
          if (cameraEnabled && isActive) {
            detectionLoopRef.current = requestAnimationFrame(detectFrame);
          }
        }, 500);
      }
    };

    detectionLoopRef.current = requestAnimationFrame(detectFrame);
  };

  const simulateModelProcessing = async (imageBuffer: Buffer): Promise<any[]> => {
    // This would call the actual backend model detection
    // For now, simulate different detection scenarios
    
    const detections: any[] = [];
    const scenario = Math.random();
    
    // Simulate various cheating behaviors
    if (scenario > 0.8) {
      detections.push({
        type: 'phone',
        confidence: Math.floor(Math.random() * 20) + 80,
        bbox: [100, 150, 80, 120]
      });
    }
    
    if (scenario > 0.9) {
      detections.push({
        type: 'multiple_faces',
        confidence: Math.floor(Math.random() * 15) + 85
      });
    }
    
    if (scenario > 0.7) {
      detections.push({
        type: 'person_looking_away',
        confidence: Math.floor(Math.random() * 25) + 75
      });
    }
    
    return detections;
  };

  const processDetections = (detections: any[]) => {
    const newAlerts: DetectionAlert[] = [];
    
    detections.forEach(detection => {
      const detectionInfo = detectionTypes[detection.type as keyof typeof detectionTypes];
      if (!detectionInfo) return;
      
      const lastTime = lastAlertTimeRef.current[detection.type] || 0;
      const now = Date.now();
      
      // Throttle alerts (max one per 3 seconds per type)
      if (now - lastTime > 3000) {
        lastAlertTimeRef.current[detection.type] = now;
        
        const alert: DetectionAlert = {
          id: now,
          type: detection.type,
          severity: detectionInfo.severity,
          message: `${detectionInfo.icon} ${detectionInfo.message}`,
          confidence: detection.confidence,
          timestamp: new Date(),
          bbox: detection.bbox
        };
        
        newAlerts.push(alert);
        
        // Update stats
        setDetectionStats(prev => ({
          ...prev,
          totalDetections: prev.totalDetections + 1,
          [`${detection.type.replace('_', '')}Detections`]: 
            (prev as any)[`${detection.type.replace('_', '')}Detections`] + 1
        }));
      }
    });
    
    if (newAlerts.length > 0) {
      setDetectionAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]);
      if (onDetection) {
        onDetection(newAlerts);
      }
    }
  };

  const stopCamera = () => {
    console.log('🛑 Stopping camera and detection...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (detectionLoopRef.current) {
      cancelAnimationFrame(detectionLoopRef.current);
      detectionLoopRef.current = null;
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
                AI-Powered Camera Monitor
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={cameraEnabled ? "default" : "destructive"}>
                  {cameraEnabled ? 'ON' : 'OFF'}
                </Badge>
                {isDetecting && (
                  <Badge className="bg-green-600 animate-pulse">
                    <Zap className="w-3 h-3 mr-1" />
                    DETECTING
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
                      borderColor: isDetecting ? '#10b981' : '#ef4444',
                      transform: 'scaleX(-1)' // Mirror effect
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  
                  {isDetecting && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                      🤖 AI ACTIVE
                    </div>
                  )}
                </div>
                
                {!cameraEnabled ? (
                  <Button onClick={startCamera} className="w-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Enable Camera
                  </Button>
                ) : (
                  <Button 
                    onClick={stopCamera} 
                    variant="outline" 
                    className="w-full text-red-600"
                  >
                    <CameraOff className="w-4 h-4 mr-2" />
                    Stop Camera
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detection Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Detection Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-lg font-bold text-blue-600">{detectionStats.totalDetections}</p>
              <p className="text-xs text-muted-foreground">Total Detections</p>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <p className="text-lg font-bold text-red-600">{detectionAlerts.length}</p>
              <p className="text-xs text-muted-foreground">Active Alerts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Panel */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Security Alerts
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
              <p className="text-xs text-green-600 text-center py-2">
                ✅ No suspicious activity detected
              </p>
            ) : (
              detectionAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2 rounded text-xs ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs h-4">
                          {alert.confidence}% confidence
                        </Badge>
                        <span className="text-xs opacity-70">
                          {alert.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}