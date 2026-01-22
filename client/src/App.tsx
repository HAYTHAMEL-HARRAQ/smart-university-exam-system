import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import StudentDashboard from "./pages/StudentDashboard";
import Home from "./pages/Home";
import AdminPanel from "./pages/AdminPanel";
import ProctorDashboard from "./pages/ProctorDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import IncidentManagement from "./pages/IncidentManagement";
import CreateIncident from "./pages/CreateIncident";
import StudentExams from "./pages/StudentExams";
import StudentSessions from "./pages/StudentSessions";
import ExamDetails from "./pages/ExamDetails";
import LiveExamMonitoring from "./pages/LiveExamMonitoring";
// @ts-ignore - temporary ignore for build issues
import SessionMonitor from "./pages/SessionMonitor";
import type { FC } from 'react';
import FraudHeatmap from "./pages/FraudHeatmap";
import AnomalyDetection from "./pages/AnomalyDetection";
import ReportGenerator from "./pages/ReportGenerator";
import ExamInterface from "./pages/ExamInterface";
import ExamWithCamera from "./pages/ExamWithCamera";
import EnhancedExamWithModel from "./pages/EnhancedExamWithModel";
import ModelIntegrationDemo from "./pages/ModelIntegrationDemo";
import RealDetectionDemo from "./pages/RealDetectionDemo";
import YoloModelDemo from "./pages/YoloModelDemo";
import FraudDetectionDemo from "./pages/FraudDetectionDemo";
import OracleDemo from "./pages/OracleDemo";
import MySqlToOracleMigration from "./pages/MySqlToOracleMigration";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path={"/admin"} component={AdminPanel} />
      <Route path={"/admin/analytics"} component={AnalyticsDashboard} />
      <Route path={"/proctor"} component={ProctorDashboard} />
      <Route path={`/proctor/session/:id`} component={SessionMonitor} />
      {/* TODO: Add a route for /proctor/session/:id for detailed monitoring */}
      <Route path={"/proctor/incidents"} component={IncidentManagement} />
      <Route path={"/proctor/incidents/create"} component={CreateIncident} />
      <Route path="/student" component={StudentDashboard} />
      <Route path="/student/exams" component={StudentExams} />
      <Route path={"/student/sessions"} component={StudentSessions} />
      <Route path={"/student/exam-details"} component={ExamDetails} />
      <Route path={"/proctor/live-monitoring"} component={LiveExamMonitoring} />
      <Route path={"/admin/fraud-heatmap"} component={FraudHeatmap} />
      <Route path={"/admin/anomaly-detection"} component={AnomalyDetection} />
      <Route path={"/admin/reports"} component={ReportGenerator} />
      <Route path={"/admin/fraud-demo"} component={FraudDetectionDemo} />
      <Route path={"/admin/oracle-demo"} component={OracleDemo} />
      <Route path={"/admin/migrate-mysql-oracle"} component={MySqlToOracleMigration} />
      <Route path={"/student/exam"} component={ExamInterface} />
      <Route path={"/student/exam-camera"} component={ExamWithCamera} />
      <Route path={"/student/exam-enhanced"} component={EnhancedExamWithModel} />
      <Route path={"/admin/model-demo"} component={ModelIntegrationDemo} />
      <Route path={"/admin/real-detection"} component={RealDetectionDemo} />
      <Route path={"/admin/yolo-demo"} component={YoloModelDemo} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
