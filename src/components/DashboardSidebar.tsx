import { NavLink } from "react-router-dom";
import { Home, Users, Calendar, MapPin, LogOut, User, GraduationCap, X, BookOpen, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  role: "admin" | "tutor" | "student";
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const DashboardSidebar = ({ role, isCollapsed = false, isMobileOpen = false, onMobileClose }: DashboardSidebarProps) => {
  const navigate = useNavigate();

  const adminItems = [
    { title: "Dashboard", url: "/admin", icon: Home },
    { title: "Semua Tutor", url: "/admin/tutors", icon: Users },
    { title: "Semua Siswa", url: "/admin/students", icon: User },
    { title: "Laporan Absensi", url: "/admin/attendance", icon: Calendar },
    { title: "Peta Lokasi", url: "/admin/map", icon: MapPin },
    { title: "Mata Pelajaran", url: "/admin/subjects", icon: BookOpen },
    { title: "Enrol Siswa", url: "/admin/enrol", icon: UserPlus },
  ];

  const tutorItems = [
    { title: "Dashboard", url: "/tutor", icon: Home },
    { title: "Siswa Saya", url: "/tutor/students", icon: Users },
    { title: "Absensi", url: "/tutor/attendance", icon: Calendar },
    { title: "Profil", url: "/tutor/profile", icon: User },
  ];

  const studentItems = [
    { title: "Dashboard", url: "/student", icon: Home },
    { title: "Cari Tutor", url: "/student/find-tutors", icon: MapPin },
    { title: "Tutor Saya", url: "/student/my-tutors", icon: Users },
    { title: "Profil", url: "/student/profile", icon: User },
  ];

  const items = role === "admin" ? adminItems : role === "tutor" ? tutorItems : studentItems;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Berhasil logout");
      navigate("/");
    } catch (error) {
      toast.error("Gagal logout");
    }
  };

  const handleNavClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col h-full bg-background border-r transition-all duration-300",
        // Desktop
        "hidden lg:flex",
        isCollapsed ? "w-16" : "w-64",
        // Mobile
        "lg:relative fixed inset-y-0 left-0 z-50",
        isMobileOpen ? "flex w-64" : "hidden lg:flex"
      )}>
        {/* Mobile Close Button */}
        <div className="lg:hidden absolute top-4 right-4">
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-5 border-b bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white shadow-lg">
            <GraduationCap className="h-7 w-7" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight text-foreground">Bintang TQA</span>
              <span className="text-xs text-muted-foreground capitalize">
                {role === "admin" ? "Admin Panel" : role === "tutor" ? "Panel Tutor" : "Panel Siswa"}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Navigasi
            </div>
          )}
          {items.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  "text-foreground",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "justify-center"
                )
              }
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="text-base">{item.title}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer - Logout */}
        <div className="p-3 border-t bg-muted/30">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors",
              "bg-muted text-foreground hover:bg-destructive hover:text-destructive-foreground",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="text-base">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
