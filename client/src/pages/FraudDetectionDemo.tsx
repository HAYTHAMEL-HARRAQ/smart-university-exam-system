import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { useLocation } from 'wouter';

export default function FraudDetectionDemo() {
  const [, navigate] = useLocation();
  const [detectedFrauds, setDetectedFrauds] = useState<Array<{
    id: number;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    confidence: number;
  }>>([]);

  const fraudTypes = [
    {
      id: 1,
      type: 'phone_detected',
      severity: 'high' as const,
      message: '📱 Phone detected in camera view',
      confidence: 92,
    },
    {
      id: 2,
      type: 'multiple_faces',
      severity: 'critical' as const,
      message: '👥 Multiple people detected in frame',
      confidence: 87,
    },
    {
      id: 3,
      type: 'unusual_typing',
      severity: 'medium' as const,
      message: '⌨️ Unusual typing pattern detected',
      confidence: 76,
    },
    {
      id: 4,
      type: 'off_screen',
      severity: 'high' as const,
      message: '👁️ Student looking away from screen',
      confidence: 84,
    },
    {
      id: 5,
      type: 'background_voice',
      severity: 'medium' as const,
      message: '🔊 Background voice detected',
      confidence: 68,
    },
    {
      id: 6,
      type: 'screen_sharing',
      severity: 'critical' as const,
      message: '💻 Screen sharing detected (cheating attempt)',
      confidence: 95,
    },
  ];

  const simulateFraud = (fraud: typeof fraudTypes[0]) => {
    const newAlert = {
      id: Date.now(),
      type: fraud.type,
      severity: fraud.severity,
      message: fraud.message,
      timestamp: new Date(),
      confidence: fraud.confidence,
    };
    setDetectedFrauds((prev) => [newAlert, ...prev.slice(0, 9)]);
  };

  const clearAlerts = () => {
    setDetectedFrauds([]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-600">CRITICAL</Badge>;
      case 'high':
        return <Badge className="bg-orange-600">HIGH</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600">MEDIUM</Badge>;
      case 'low':
        return <Badge className="bg-blue-600">LOW</Badge>;
      default:
        return <Badge>UNKNOWN</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">🚨 Fraud Detection Demo</h1>
              <p className="text-muted-foreground mt-2">
                Simulate different types of exam fraud detection
              </p>
            </div>
            <Button onClick={() => navigate('/admin')} variant="outline">
              Back to Admin
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fraud Simulation Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fraud Types</CardTitle>
                <CardDescription>Click to simulate detection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {fraudTypes.map((fraud) => (
                  <Button
                    key={fraud.id}
                    onClick={() => simulateFraud(fraud)}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                  >
                    <div>
                      <p className="font-semibold text-sm">{fraud.message}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {fraud.confidence}%
                        </Badge>
                        {getSeverityBadge(fraud.severity)}
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Button
              onClick={clearAlerts}
              variant="destructive"
              className="w-full mt-4"
            >
              Clear All Alerts
            </Button>
          </div>

          {/* Alerts Display */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Detected Alerts</CardTitle>
                    <CardDescription>
                      Real-time fraud detection events
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-red-600">
                      {detectedFrauds.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Alerts</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {detectedFrauds.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <p className="text-green-700 font-semibold">
                        No fraud detected
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Click fraud types on the left to simulate detection
                      </p>
                    </div>
                  ) : (
                    detectedFrauds.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border-2 ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold">{alert.message}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                Confidence: {alert.confidence}%
                              </Badge>
                              {getSeverityBadge(alert.severity)}
                            </div>
                            <p className="text-xs opacity-70 mt-2">
                              {alert.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Detection Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-2xl font-bold text-red-600">
                      {detectedFrauds.filter((a) => a.severity === 'critical')
                        .length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Critical</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-2xl font-bold text-orange-600">
                      {detectedFrauds.filter((a) => a.severity === 'high').length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">High</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-2xl font-bold text-yellow-600">
                      {detectedFrauds.filter((a) => a.severity === 'medium')
                        .length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Medium</p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">How It Works</p>
                      <ul className="text-sm text-blue-800 mt-2 space-y-1">
                        <li>✓ Real-time camera monitoring</li>
                        <li>✓ AI-powered fraud detection</li>
                        <li>✓ Automatic alert triggering</li>
                        <li>✓ Proctor notifications</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
