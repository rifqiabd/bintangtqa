import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface DashboardLayoutProps {
  role: "admin" | "tutor" | "student";
}

const DashboardLayout = ({ role }: DashboardLayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isApproved, setIsApproved] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkApproval = async () => {
      if (role !== "tutor") return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // If we're already on pending page, don't check
      if (location.pathname === "/tutor/pending") return;

      const { data: tutorDetails } = await supabase
        .from("tutor_details")
        .select("is_approved")
        .eq("tutor_id", session.user.id)
        .single();

      setIsApproved(tutorDetails?.is_approved ?? true);
    };

    checkApproval();
  }, [role, location.pathname]);

  return (
    <ProtectedRoute allowedRoles={[role]}>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar 
          role={role} 
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
          isApproved={isApproved}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border flex items-center px-4 lg:px-6 bg-background sticky top-0 z-40">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </header>

          <main className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;