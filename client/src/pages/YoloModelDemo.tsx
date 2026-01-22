import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import YoloCamera from '@/components/YoloCamera';
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
  Eye,
  FileText
} from 'lucide-react';

interface DetectionAlert {
  id: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  confidence: number;
  timestamp: Date;
}

export default function YoloModelDemo() {
  const [, navigate] = useLocation();
  const [demoMode, setDemoMode] = useState<'idle' | 'detecting' | 'complete'>('idle');
  const [detectionAlerts, setDetectionAlerts] = useState<DetectionAlert[]>([]);
  const [stats, setStats] = useState({
    totalDetections: 0,
    phoneDetections: 0,
    bookDetections: 0,
    highRisk: 0
  });

  const handleDetection = (newAlerts: DetectionAlert[]) => {
    setDetectionAlerts(prev => [...newAlerts, ...prev.slice(0, 14)]);
    setStats(prev => ({
      ...prev,
      totalDetections: prev.totalDetections + newAlerts.length,
      phoneDetections: prev.phoneDetections + newAlerts.filter(a => a.type === 'phone').length,
      bookDetections: prev.bookDetections + newAlerts.filter(a => a.type === 'book').length,
      highRisk: prev.highRisk + newAlerts.filter(a => 
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
      bookDetections: 0,
      highRisk: 0
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
      bookDetections: 0,
      highRisk: 0
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
                <Brain className="w-10 h-10 text-purple-600" />
                Your YOLO Model Demo
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Testing your trained model: <code className="bg-muted px-2 py-1 rounded">train5_weights/best.pt</code>
              </p>
            </div>
            <Button onClick={() => navigate('/admin')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </div>

          {/* Model Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-600" />
                Your Trained Model Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-semibold">Model File</p>
                    <p className="text-sm text-muted-foreground">train5_weights/best.pt</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="font-semibold">Architecture</p>
                    <p className="text-sm text-muted-foreground">YOLO Custom Training</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-semibold">Purpose</p>
                    <p className="text-sm text-muted-foreground">Exam Cheating Detection</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* YOLO Camera Demo */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Your Model in Action
                </CardTitle>
                <CardDescription>
                  Real-time detection using your trained YOLO model
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <YoloCamera 
                  onDetection={handleDetection}
                  isActive={demoMode === 'detecting'}
                  showFeed={true}
                />

                {/* Demo Controls */}
                <div className="space-y-3 pt-4 border-t">
                  {demoMode === 'idle' && (
                    <Button 
                      onClick={startDemo} 
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Test Your YOLO Model
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
                      Test Again
                    </Button>
                  )}
                </div>

                {/* Demo Status */}
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium mb-2">Model Status:</p>
                  <Badge 
                    variant={demoMode === 'detecting' ? 'default' : 'secondary'}
                    className="bg-purple-600"
                  >
                    {demoMode === 'idle' && 'Ready to test your model'}
                    {demoMode === 'detecting' && 'Your YOLO model is analyzing...'}
                    {demoMode === 'complete' && 'Testing complete'}
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
                      <AlertCircle className="w-5 h-5 text-purple-600" />
                      Your Model's Detections
                    </CardTitle>
                    <CardDescription>
                      Real-time alerts from your trained YOLO model
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600">
                      {detectionAlerts.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Detections</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {detectionAlerts.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                      <p className="text-purple-700 font-semibold text-lg">
                        Your model is ready
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Start the demo to see your YOLO model in action
                      </p>
                      <div className="mt-4 text-xs text-muted-foreground bg-muted p-3 rounded">
                        <p className="font-medium mb-1">Test your model with:</p>
                        <ul className="text-left space-y-1">
                          <li>• Mobile phones or tablets</li>
                          <li>• Books and notebooks</li>
                          <li>• Different lighting conditions</li>
                          <li>• Various object positions</li>
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
                              Detected: {alert.timestamp.toLocaleTimeString()}
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
                  <Cpu className="w-5 h-5 text-purple-600" />
                  Your Model Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-2xl font-bold text-purple-600">{stats.totalDetections}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Detections</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-2xl font-bold text-red-600">{stats.phoneDetections}</p>
                    <p className="text-xs text-muted-foreground mt-1">Phone Alerts</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">{stats.bookDetections}</p>
                    <p className="text-xs text-muted-foreground mt-1">Book Detections</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-2xl font-bold text-orange-600">{stats.highRisk}</p>
                    <p className="text-xs text-muted-foreground mt-1">High Risk Items</p>
                  </div>
                </div>

                {/* Model Capabilities */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Your Model's Strengths
                  </h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Trained specifically on exam cheating scenarios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Optimized for phone and book detection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Custom confidence thresholds for exam security</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Real-time processing with your specific dataset</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testing Guide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              How to Test Your Model Effectively
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-red-600" />
                  Phone Detection Testing
                </h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Hold phone with screen ON in camera view</li>
                  <li>• Try different phone orientations</li>
                  <li>• Test with tablet screens too</li>
                  <li>• Check different brightness levels</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Book/Paper Detection Testing
                </h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Place textbooks in the camera frame</li>
                  <li>• Test with loose papers or notebooks</li>
                  <li>• Try different book sizes and colors</li>
                  <li>• Check multiple books at once</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Remember:</strong> Your model was trained specifically for exam environments, 
                so it should perform best with typical cheating scenarios like phones, books, and 
                unauthorized materials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}