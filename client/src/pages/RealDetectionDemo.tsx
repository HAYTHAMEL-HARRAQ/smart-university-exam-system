import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RealDetectionCamera from '@/components/RealDetectionCamera';
import { 
  ArrowLeft, 
  Brain, 
  Zap, 
  Shield, 
  Camera, 
  AlertCircle,
  CheckCircle2,
  Cpu,
  Smartphone,
  Eye
} from 'lucide-react';

interface DetectionAlert {
  id: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  confidence: number;
  timestamp: Date;
}

export default function RealDetectionDemo() {
  const [, navigate] = useLocation();
  const [demoMode, setDemoMode] = useState<'idle' | 'detecting' | 'complete'>('idle');
  const [detectionAlerts, setDetectionAlerts] = useState<DetectionAlert[]>([]);
  const [stats, setStats] = useState({
    totalDetections: 0,
    phoneDetections: 0,
    objectDetections: 0,
    suspiciousActivity: 0
  });

  const handleDetection = (newAlerts: DetectionAlert[]) => {
    setDetectionAlerts(prev => [...newAlerts, ...prev.slice(0, 14)]);
    setStats(prev => ({
      ...prev,
      totalDetections: prev.totalDetections + newAlerts.length,
      phoneDetections: prev.phoneDetections + newAlerts.filter(a => a.type === 'phone').length,
      objectDetections: prev.objectDetections + newAlerts.filter(a => 
        a.type === 'suspicious_object' || a.type === 'multiple_objects'
      ).length,
      suspiciousActivity: prev.suspiciousActivity + newAlerts.filter(a => 
        a.severity === 'high' || a.severity === 'critical'
      ).length
    }));
  };

  const startDemo = () => {
    setDemoMode('detecting');
    setDetectionAlerts([]);
    setStats({
      totalDetections: 0,
      phoneDetections: 0,
      objectDetections: 0,
      suspiciousActivity: 0
    });
  };

  const stopDemo = () => {
    setDemoMode('complete');
  };

  const resetDemo = () => {
    setDemoMode('idle');
    setDetectionAlerts([]);
    setStats({
      totalDetections: 0,
      phoneDetections: 0,
      objectDetections: 0,
      suspiciousActivity: 0
    });
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Eye className="w-10 h-10 text-green-600" />
                Real Detection Demo
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Actual camera-based object detection system
              </p>
            </div>
            <Button onClick={() => navigate('/admin')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </div>

          {/* How It Works Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                How Real Detection Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-8 h-8 text-red-600 mt-1" />
                  <div>
                    <p className="font-semibold">Phone Detection</p>
                    <p className="text-sm text-muted-foreground">Analyzes brightness patterns to spot mobile devices</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className="w-8 h-8 text-purple-600 mt-1" />
                  <div>
                    <p className="font-semibold">Object Recognition</p>
                    <p className="text-sm text-muted-foreground">Identifies books, laptops, and other suspicious items</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-8 h-8 text-yellow-600 mt-1" />
                  <div>
                    <p className="font-semibold">Pattern Analysis</p>
                    <p className="text-sm text-muted-foreground">Detects unusual color distributions and movements</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Demo Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Live Camera Feed
                </CardTitle>
                <CardDescription>
                  Real-time object detection in action
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RealDetectionCamera 
                  onDetection={handleDetection}
                  isActive={demoMode === 'detecting'}
                  showFeed={true}
                />

                {/* Demo Controls */}
                <div className="space-y-3 pt-4 border-t">
                  {demoMode === 'idle' && (
                    <Button 
                      onClick={startDemo} 
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Start Real Detection
                    </Button>
                  )}
                  
                  {demoMode === 'detecting' && (
                    <Button 
                      onClick={stopDemo} 
                      variant="destructive" 
                      className="w-full"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Stop Detection
                    </Button>
                  )}
                  
                  {demoMode === 'complete' && (
                    <Button 
                      onClick={resetDemo} 
                      variant="outline" 
                      className="w-full"
                    >
                      Reset Demo
                    </Button>
                  )}
                </div>

                {/* Demo Status */}
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium mb-2">Detection Status:</p>
                  <Badge 
                    variant={demoMode === 'detecting' ? 'default' : 'secondary'}
                    className={demoMode === 'detecting' ? 'animate-pulse' : ''}
                  >
                    {demoMode === 'idle' && 'Ready to detect'}
                    {demoMode === 'detecting' && 'Actively analyzing'}
                    {demoMode === 'complete' && 'Analysis complete'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detection Results */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Detection Results
                    </CardTitle>
                    <CardDescription>
                      Real-time alerts from actual image analysis
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-red-600">
                      {detectionAlerts.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Active Alerts</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {detectionAlerts.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <p className="text-green-700 font-semibold text-lg">
                        No detections yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Point your camera at different objects to test detection
                      </p>
                      <div className="mt-4 text-xs text-muted-foreground bg-muted p-3 rounded">
                        <p className="font-medium mb-1">Try these tests:</p>
                        <ul className="text-left space-y-1">
                          <li>• Show a phone or bright screen</li>
                          <li>• Place books or notebooks in view</li>
                          <li>• Move objects around the frame</li>
                          <li>• Change lighting conditions</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    detectionAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border-2 ${getSeverityColor(alert.severity)}`}
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold">{alert.message}</p>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                Confidence: {alert.confidence}%
                              </Badge>
                              <Badge 
                                className={`text-xs ${
                                  alert.severity === 'critical' ? 'bg-red-600' :
                                  alert.severity === 'high' ? 'bg-orange-600' :
                                  alert.severity === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                                }`}
                              >
                                {alert.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-xs opacity-70 mt-2">
                              Detected at {alert.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  Analysis Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">{stats.totalDetections}</p>
                    <p className="text-xs text-muted-foreground mt-1">Objects Found</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-2xl font-bold text-red-600">{stats.phoneDetections}</p>
                    <p className="text-xs text-muted-foreground mt-1">Phone Alerts</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-2xl font-bold text-purple-600">{stats.objectDetections}</p>
                    <p className="text-xs text-muted-foreground mt-1">Objects Detected</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-2xl font-bold text-orange-600">{stats.suspiciousActivity}</p>
                    <p className="text-xs text-muted-foreground mt-1">Suspicious Items</p>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Detection Methods
                  </h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Brightness pattern analysis for phone screens</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Color distribution mapping for object identification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Edge detection for suspicious item boundaries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Real-time frame processing every second</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Usage Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Testing Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-red-600" />
                  Phone Detection Test
                </h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Hold a phone with screen on in front of camera</li>
                  <li>• Show a bright laptop or tablet screen</li>
                  <li>• Watch for brightness-based alerts</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-600" />
                  Object Detection Test
                </h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Place books, notebooks, or papers in view</li>
                  <li>• Add multiple objects to test variety detection</li>
                  <li>• Move objects to trigger motion alerts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}