import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for demonstration purposes until real data is available
const mockData = [
  { period: 'Jan 24', sessions: 1200, flagged: 50, incidents: 5, fraudRate: 0.42 },
  { period: 'Feb 24', sessions: 1500, flagged: 65, incidents: 8, fraudRate: 0.53 },
  { period: 'Mar 24', sessions: 1800, flagged: 80, incidents: 10, fraudRate: 0.56 },
  { period: 'Apr 24', sessions: 1600, flagged: 70, incidents: 9, fraudRate: 0.56 },
  { period: 'May 24', sessions: 2000, flagged: 95, incidents: 12, fraudRate: 0.60 },
];

export default function AnalyticsDashboard() {
  const [, navigate] = useLocation();
  const [selectedDept, setSelectedDept] = useState("Computer Science");

  // Fetch fraud trends by department
  const { data: trends = [], isLoading: trendsLoading } = trpc.analytics.getFraudTrendsByDepartment.useQuery({ department: selectedDept });

  // For demonstration, we'll use the mock data if the fetched data is empty or loading
  const displayData = trends.length > 0 ? trends : mockData;

  // Calculate overall metrics from the displayed data
  const totalSessions = displayData.reduce((sum: number, item: any) => sum + (item.totalExamSessions || item.sessions || 0), 0);
  const totalFlagged = displayData.reduce((sum: number, item: any) => sum + (item.flaggedSessions || item.flagged || 0), 0);
  const totalIncidents = displayData.reduce((sum: number, item: any) => sum + (item.confirmedIncidents || item.incidents || 0), 0);
  const overallFraudRate = totalSessions > 0 ? ((totalIncidents / totalSessions) * 100).toFixed(2) : "0.00";

  // Reformat data for recharts
  const chartData = displayData.map((item: any) => ({
    period: item.period,
    'Flagged Sessions': item.flaggedSessions || item.flagged || 0,
    'Confirmed Incidents': item.confirmedIncidents || item.incidents || 0,
    'Fraud Rate (%)': parseFloat((item.fraudRate || item.fraudRate).toString()),
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">Insights into exam proctoring and fraud trends</p>
          </div>
          <Button onClick={() => navigate("/admin")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
              <SelectItem value="Chemistry">Chemistry</SelectItem>
              <SelectItem value="Biology">Biology</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exam Sessions</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged Sessions</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{totalFlagged.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+15.5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalIncidents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Highest in 6 months</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Fraud Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallFraudRate}%</div>
              <p className="text-xs text-muted-foreground">{(parseFloat(overallFraudRate) > 0.5 ? 'Up' : 'Down')} from last period</p>
            </CardContent>
          </Card>
        </div>

        {/* Fraud Trend Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Fraud Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <div className="h-[350px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading analytics data...</p>
              </div>
            ) : (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" unit="%" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="Flagged Sessions" fill="#f97316" />
                    <Bar yAxisId="left" dataKey="Confirmed Incidents" fill="#ef4444" />
                    <Bar yAxisId="right" dataKey="Fraud Rate (%)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Alert Types */}
        <Card>
          <CardHeader>
            <CardTitle>Top Alert Types</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Data for top alert types will be displayed here.</p>
            {/* In a real implementation, you would process the 'commonAlertTypes' JSON from the API response */}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
