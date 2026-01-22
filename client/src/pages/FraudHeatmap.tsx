import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, AlertTriangle, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function FraudHeatmap() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const [timeRange, setTimeRange] = useState("month");

  // Mock heatmap data - fraud incidents by location/department/time
  const heatmapData = [
    { department: 'Computer Science', incidents: 24, rate: '12%', trend: 'up' },
    { department: 'Mathematics', incidents: 18, rate: '9%', trend: 'stable' },
    { department: 'Physics', incidents: 14, rate: '7%', trend: 'down' },
    { department: 'Chemistry', incidents: 16, rate: '8%', trend: 'up' },
    { department: 'Biology', incidents: 12, rate: '6%', trend: 'stable' },
  ];

  const hourlyData = [
    { hour: '9AM', incidents: 2, severity: 'low' },
    { hour: '10AM', incidents: 5, severity: 'medium' },
    { hour: '11AM', incidents: 8, severity: 'high' },
    { hour: '12PM', incidents: 3, severity: 'low' },
    { hour: '1PM', incidents: 6, severity: 'medium' },
    { hour: '2PM', incidents: 9, severity: 'high' },
    { hour: '3PM', incidents: 4, severity: 'low' },
    { hour: '4PM', incidents: 7, severity: 'medium' },
  ];

  const dayOfWeekData = [
    { day: 'Mon', incidents: 12, rate: '8%' },
    { day: 'Tue', incidents: 14, rate: '9%' },
    { day: 'Wed', incidents: 18, rate: '11%' },
    { day: 'Thu', incidents: 16, rate: '10%' },
    { day: 'Fri', incidents: 22, rate: '14%' },
    { day: 'Sat', incidents: 8, rate: '5%' },
    { day: 'Sun', incidents: 6, rate: '4%' },
  ];

  const getHeatColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-400';
      case 'low':
        return 'bg-green-400';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Fraud Heatmap</h1>
            <p className="text-sm text-muted-foreground">Visualize fraud patterns across departments, times, and trends</p>
          </div>
          <Button onClick={() => navigate("/admin/analytics")} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Analytics
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {['week', 'month', 'quarter', 'year'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="capitalize"
              >
                {range}
              </Button>
            ))}
          </div>

          {/* Department Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Fraud by Department</CardTitle>
              <CardDescription>Heatmap showing fraud incident density by department</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {heatmapData.map((item, idx) => {
                const intensity = parseInt(item.rate) / 12; // Normalize to 0-1
                const bgColor = intensity > 0.7 ? 'bg-red-100' : intensity > 0.5 ? 'bg-orange-100' : intensity > 0.3 ? 'bg-yellow-100' : 'bg-green-100';
                const borderColor = intensity > 0.7 ? 'border-red-500' : intensity > 0.5 ? 'border-orange-500' : intensity > 0.3 ? 'border-yellow-500' : 'border-green-500';

                return (
                  <div key={idx} className={`p-4 rounded-lg border-2 ${bgColor} ${borderColor}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{item.department}</h3>
                        <p className="text-sm text-muted-foreground">{item.incidents} incidents detected</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">{item.rate}</p>
                        <Badge variant={item.trend === 'up' ? 'destructive' : item.trend === 'down' ? 'secondary' : 'outline'}>
                          {item.trend === 'up' && '↑ Increasing'}
                          {item.trend === 'down' && '↓ Decreasing'}
                          {item.trend === 'stable' && '→ Stable'}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${intensity > 0.7 ? 'bg-red-600' : intensity > 0.5 ? 'bg-orange-600' : intensity > 0.3 ? 'bg-yellow-600' : 'bg-green-600'}`}
                        style={{ width: `${item.rate}` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Time of Day Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Fraud by Time of Day</CardTitle>
              <CardDescription>Peak hours for suspicious activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {hourlyData.map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className={`w-full h-24 rounded-lg mb-2 flex items-center justify-center text-white font-bold transition-transform hover:scale-105 ${getHeatColor(item.severity)}`}>
                      {item.incidents}
                    </div>
                    <p className="text-sm font-medium">{item.hour}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.severity}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">⚠️ High-Risk Hours</h4>
                <p className="text-sm text-muted-foreground">Peak fraud activity occurs between 11AM-2PM and 2PM-4PM. Enhanced monitoring recommended during these hours.</p>
              </div>
            </CardContent>
          </Card>

          {/* Day of Week Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Fraud by Day of Week</CardTitle>
              <CardDescription>Fraud incidents distributed across weekdays</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dayOfWeekData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 font-semibold text-center">{item.day}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all"
                            style={{ width: `${(item.incidents / 22) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">{item.incidents}</span>
                      </div>
                    </div>
                    <Badge variant={item.rate > '10%' ? 'destructive' : 'secondary'}>
                      {item.rate}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">📊 Key Insight</h4>
                <p className="text-sm text-red-800">Friday shows the highest fraud rate (14%) with 22 incidents. This may be due to end-of-week fatigue or week-end proximity.</p>
              </div>
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Fraud Hotspots</CardTitle>
              <CardDescription>Geographic and location-based fraud clustering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border border-red-300">
                  <h4 className="font-semibold text-red-900 mb-2">🔴 Critical Hotspot</h4>
                  <p className="text-sm text-red-800 mb-2">Lab Building - Room 205</p>
                  <p className="text-xs text-red-700">24 incidents in past month (15% of total)</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg border border-orange-300">
                  <h4 className="font-semibold text-orange-900 mb-2">🟠 High Risk</h4>
                  <p className="text-sm text-orange-800 mb-2">Main Hall - Testing Center A</p>
                  <p className="text-xs text-orange-700">18 incidents in past month (11% of total)</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg border border-yellow-300">
                  <h4 className="font-semibold text-yellow-900 mb-2">🟡 Moderate Risk</h4>
                  <p className="text-sm text-yellow-800 mb-2">Science Wing - Room 301</p>
                  <p className="text-xs text-yellow-700">12 incidents in past month (7% of total)</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-300">
                  <h4 className="font-semibold text-green-900 mb-2">🟢 Safe Area</h4>
                  <p className="text-sm text-green-800 mb-2">Admin Building - Proctored Room</p>
                  <p className="text-xs text-green-700">2 incidents in past month (1% of total)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/admin/analytics")} className="flex-1">
              Back to Analytics
            </Button>
            <Button variant="outline" className="flex-1">
              Export Heatmap Report
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
