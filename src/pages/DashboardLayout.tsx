import { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  role: "admin" | "tutor" | "student";
}

const DashboardLayout = ({ role }: DashboardLayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={[role]}>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar 
          role={role} 
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border flex items-center px-4 lg:px-6 bg-background sticky top-0 z-40">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Desktop Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex mr-4"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <h2 className="text-base lg:text-lg font-semibold truncate">
              {role === "admin" ? "Admin Panel" : role === "tutor" ? "Panel Tutor" : "Panel Siswa"}
            </h2>
          </header>
          <main className="flex-1 p-4 lg:p-6 bg-secondary/30 overflow-y-auto pt-20 lg:pt-16">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
