import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/Auth/ErrorBoundary";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import LandingPage from "./pages/Landing/LandingPage";
import AdminLogin from "./pages/Login/AdminLogin";
import StudentLogin from "./pages/Login/StudentLogin";
import StudentSignup from "./pages/Login/StudentSignup";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import StudentsPage from "./pages/Admin/StudentsPage";
import StudentProfile from "./pages/Admin/StudentProfile";
import SubjectsPage from "./pages/Admin/SubjectsPage";
import MarksPage from "./pages/Admin/MarksPage";
import ReportsPage from "./pages/Admin/ReportsPage";
import ActivityLogPage from "./pages/Admin/ActivityLogPage";
import AttendancePage from "./pages/Admin/AttendancePage";
import LeaveApprovalsPage from "./pages/Admin/LeaveApprovalsPage";
import NoticesPage from "./pages/Admin/NoticesPage";
import CalendarPage from "./pages/Admin/CalendarPage";
import FeeManagementPage from "./pages/Admin/FeeManagementPage";
import StudentDashboard from "./pages/Student/StudentDashboard";
import DevelopersPage from "./pages/Developers/DevelopersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login/admin" element={<AdminLogin />} />
              <Route path="/login/student" element={<StudentLogin />} />
              <Route path="/signup/student" element={<StudentSignup />} />
              <Route path="/developers" element={<DevelopersPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin", "staff", "viewer"]} redirectTo="/login/admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="students/:id" element={<StudentProfile />} />
                <Route path="subjects" element={<SubjectsPage />} />
                <Route path="marks" element={<MarksPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="leaves" element={<LeaveApprovalsPage />} />
                <Route path="notices" element={<NoticesPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="fees" element={<FeeManagementPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="logs" element={<ActivityLogPage />} />
              </Route>
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={["student"]} redirectTo="/login/student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
