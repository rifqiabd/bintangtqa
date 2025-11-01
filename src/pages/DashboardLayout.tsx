import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";

interface DashboardLayoutProps {
  role: "admin" | "tutor" | "student";
}

const DashboardLayout = ({ role }: DashboardLayoutProps) => {
  return (
    <ProtectedRoute allowedRoles={[role]}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar role={role} />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b border-border flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h2 className="ml-4 text-lg font-semibold">
                {role === "admin" ? "Admin Panel" : role === "tutor" ? "Panel Tutor" : "Panel Siswa"}
              </h2>
            </header>
            <main className="flex-1 p-6 bg-secondary/30">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default DashboardLayout;