import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardLayout from "./pages/DashboardLayout";
import StudentDashboard from "./pages/student/Dashboard";
import FindTutors from "./pages/student/FindTutors";
import TutorDashboard from "./pages/tutor/Dashboard";
import TutorAttendance from "./pages/tutor/Attendance";
import AdminDashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Student Routes */}
          <Route path="/student" element={<DashboardLayout role="student" />}>
            <Route index element={<StudentDashboard />} />
            <Route path="find-tutors" element={<FindTutors />} />
          </Route>

          {/* Tutor Routes */}
          <Route path="/tutor" element={<DashboardLayout role="tutor" />}>
            <Route index element={<TutorDashboard />} />
            <Route path="attendance" element={<TutorAttendance />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminDashboard />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
