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
import MyTutors from "./pages/student/MyTutors";
import StudentProfile from "./pages/student/Profile";
import TutorDashboard from "./pages/tutor/Dashboard";
import TutorAttendance from "./pages/tutor/Attendance";
import TutorStudents from "./pages/tutor/Students";
import TutorProfile from "./pages/tutor/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminTutors from "./pages/admin/Tutors";
import AdminStudents from "./pages/admin/Students";
import AdminAttendance from "./pages/admin/Attendance";
import AdminMap from "./pages/admin/Map";
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
            <Route path="my-tutors" element={<MyTutors />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Tutor Routes */}
          <Route path="/tutor" element={<DashboardLayout role="tutor" />}>
            <Route index element={<TutorDashboard />} />
            <Route path="attendance" element={<TutorAttendance />} />
            <Route path="students" element={<TutorStudents />} />
            <Route path="profile" element={<TutorProfile />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="tutors" element={<AdminTutors />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="map" element={<AdminMap />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
