import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, Download, FileText, Calendar, Filter } from "lucide-react";
import { useState } from "react";

export default function ReportGenerator() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [dateRange, setDateRange] = useState('month');

  const reports = [
    {
      id: 1,
      title: 'Comprehensive Fraud Report',
      description: 'Full analysis of fraud incidents, patterns, and statistics',
      sections: ['Executive Summary', 'Fraud Incidents', 'Heatmap Analysis', 'Recommendations'],
      pages: 12,
      format: 'PDF',
    },
    {
      id: 2,
      title: 'Student Performance Report',
      description: 'Detailed scores, anomalies, and performance trends',
      sections: ['Summary Statistics', 'Individual Results', 'Trend Analysis', 'Comparative Analysis'],
      pages: 8,
      format: 'PDF',
    },
    {
      id: 3,
      title: 'Proctor Activity Report',
      description: 'Proctor performance, alerts managed, and incident resolution',
      sections: ['Activity Summary', 'Alert Management', 'Incident Tracking', 'Performance Metrics'],
      pages: 6,
      format: 'PDF',
    },
    {
      id: 4,
      title: 'Department Comparison Report',
      description: 'Cross-department statistics and performance benchmarking',
      sections: ['Overview', 'Fraud Rates by Dept', 'Performance Metrics', 'Recommendations'],
      pages: 10,
      format: 'PDF',
    },
    {
      id: 5,
      title: 'Compliance & Audit Report',
      description: 'Audit logs, compliance checklist, and regulatory adherence',
      sections: ['Audit Trail', 'Compliance Status', 'System Access Log', 'Recommendations'],
      pages: 15,
      format: 'PDF',
    },
    {
      id: 6,
      title: 'Incident Investigation Report',
      description: 'Detailed analysis of specific fraud incidents and evidence',
      sections: ['Incident Summary', 'Evidence Review', 'Timeline', 'Conclusions', 'Actions Taken'],
      pages: 20,
      format: 'PDF',
    },
  ];

  const generatePDF = (report: any) => {
    // Simulate PDF generation
    const sections = report.sections.join(', ');
    alert(`Generating ${report.title}... Report would be ${report.pages} pages with sections: ${sections}. This would trigger a PDF download.`);
  };

  const previewReport = (report: any) => {
    setSelectedReport(report);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Report Generator</h1>
            <p className="text-sm text-muted-foreground">Generate and download comprehensive PDF reports</p>
          </div>
          <Button onClick={() => navigate("/admin")} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Quick Actions */}
          {!selectedReport && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Report Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <div className="flex gap-2">
                      {['week', 'month', 'quarter', 'year', 'custom'].map((range) => (
                        <Button
                          key={range}
                          variant={dateRange === range ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDateRange(range)}
                          className="capitalize"
                        >
                          {range}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Include Sections</label>
                    <div className="space-y-2">
                      {['Executive Summary', 'Data Analysis', 'Visualizations', 'Recommendations', 'Appendix'].map((section) => (
                        <label key={section} className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="w-4 h-4" />
                          <span className="text-sm">{section}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Reports */}
              <div>
                <h2 className="text-xl font-bold mb-4">Available Reports</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {reports.map((report) => (
                    <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => previewReport(report)}>
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <Badge variant="outline">{report.pages}p</Badge>
                        </div>
                        <CardTitle className="text-base">{report.title}</CardTitle>
                        <CardDescription className="text-xs">{report.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Sections</p>
                          <div className="flex flex-wrap gap-1">
                            {report.sections.slice(0, 2).map((section, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {section}
                              </Badge>
                            ))}
                            {report.sections.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{report.sections.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Report Preview */}
          {selectedReport && (
            <div className="space-y-4">
              <Button
                onClick={() => setSelectedReport(null)}
                variant="outline"
                size="sm"
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Reports
              </Button>

              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedReport.title}</CardTitle>
                      <CardDescription>{selectedReport.description}</CardDescription>
                    </div>
                    <Badge>{selectedReport.pages} Pages</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Report Preview */}
                  <div className="bg-white border border-gray-300 rounded-lg p-12 space-y-8">
                    {/* Header */}
                    <div className="text-center border-b pb-8">
                      <h1 className="text-3xl font-bold text-gray-900">{selectedReport.title}</h1>
                      <p className="text-gray-600 mt-2">Generated on {new Date().toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500 mt-1">University Exam Proctoring System</p>
                    </div>

                    {/* Executive Summary */}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Executive Summary</h2>
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="bg-blue-50 p-4 rounded text-center border border-blue-200">
                          <p className="text-3xl font-bold text-blue-600">165</p>
                          <p className="text-sm text-gray-600">Total Exams</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded text-center border border-green-200">
                          <p className="text-3xl font-bold text-green-600">420</p>
                          <p className="text-sm text-gray-600">Students</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded text-center border border-red-200">
                          <p className="text-3xl font-bold text-red-600">18</p>
                          <p className="text-sm text-gray-600">Incidents</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded text-center border border-orange-200">
                          <p className="text-3xl font-bold text-orange-600">4.3%</p>
                          <p className="text-sm text-gray-600">Fraud Rate</p>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        This report provides a comprehensive analysis of exam proctoring activities, fraud detection patterns, and system performance metrics. Our advanced anomaly detection system flagged {selectedReport.id === 6 ? '42' : '34'} suspicious patterns, leading to {selectedReport.id === 6 ? '12' : '8'} confirmed fraud incidents.
                      </p>
                    </div>

                    {/* Key Findings */}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Findings</h2>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Fraud detection accuracy improved by 23% with new ML models</li>
                        <li>• Friday shows 40% higher fraud rate than other weekdays</li>
                        <li>• Computer Science department has highest incident rate (12%)</li>
                        <li>• Peak fraud time: 2PM-4PM window</li>
                        <li>• 89% of detected frauds involved multiple red flags</li>
                      </ul>
                    </div>

                    {/* Data Table */}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Department Statistics</h2>
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-100 border border-gray-300">
                            <th className="p-2 text-left">Department</th>
                            <th className="p-2 text-center">Exams</th>
                            <th className="p-2 text-center">Students</th>
                            <th className="p-2 text-center">Incidents</th>
                            <th className="p-2 text-center">Fraud Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { dept: 'Computer Science', exams: 42, students: 112, incidents: 12, rate: '10.7%' },
                            { dept: 'Mathematics', exams: 35, students: 98, incidents: 7, rate: '7.1%' },
                            { dept: 'Physics', exams: 28, students: 85, incidents: 4, rate: '4.7%' },
                            { dept: 'Chemistry', exams: 32, students: 95, incidents: 5, rate: '5.3%' },
                            { dept: 'Biology', exams: 28, students: 92, incidents: 3, rate: '3.3%' },
                          ].map((row, idx) => (
                            <tr key={idx} className="border border-gray-300 hover:bg-gray-50">
                              <td className="p-2">{row.dept}</td>
                              <td className="p-2 text-center">{row.exams}</td>
                              <td className="p-2 text-center">{row.students}</td>
                              <td className="p-2 text-center font-semibold text-red-600">{row.incidents}</td>
                              <td className="p-2 text-center font-semibold">{row.rate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h2 className="text-lg font-bold text-blue-900 mb-3">Recommendations</h2>
                      <ol className="list-decimal list-inside space-y-2 text-blue-900 text-sm">
                        <li>Increase proctor monitoring during 2PM-4PM peak hours</li>
                        <li>Implement stricter biometric verification in Computer Science</li>
                        <li>Investigate students with score spikes &gt; 50%</li>
                        <li>Enhance exam paper randomization</li>
                        <li>Review repeat exam policies with high score changes</li>
                      </ol>
                    </div>
                  </div>

                  {/* Download Options */}
                  <div className="space-y-3 border-t pt-6">
                    <p className="text-sm font-medium">Export Report</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => generatePDF(selectedReport)}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <FileText className="w-4 h-4 mr-2" />
                        Open in Editor
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Share Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
