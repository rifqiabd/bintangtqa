import { NavLink } from "react-router-dom";
import { Home, Users, Calendar, MapPin, LogOut, User, GraduationCap, X, BookOpen, UserPlus, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  role: "admin" | "tutor" | "student";
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isApproved?: boolean;
}

const DashboardSidebar = ({ role, isCollapsed = false, isMobileOpen = false, onMobileClose, isApproved = true }: DashboardSidebarProps) => {
  const navigate = useNavigate();

  const adminItems = [
    { title: "Dashboard", url: "/admin", icon: Home },
    { title: "Semua Tutor", url: "/admin/tutors", icon: Users },
    { title: "Semua Siswa", url: "/admin/students", icon: User },
    { title: "Persetujuan Tutor", url: "/admin/tutor-approval", icon: UserCheck },
    { title: "Laporan Absensi", url: "/admin/attendance", icon: Calendar },
    { title: "Peta Lokasi", url: "/admin/map", icon: MapPin },
    { title: "Mata Pelajaran", url: "/admin/subjects", icon: BookOpen },
    { title: "Enrol Siswa", url: "/admin/enrol", icon: UserPlus },
  ];

  const tutorItems = isApproved ? [
    { title: "Dashboard", url: "/tutor", icon: Home },
    { title: "Siswa Saya", url: "/tutor/students", icon: Users },
    { title: "Absensi", url: "/tutor/attendance", icon: Calendar },
    { title: "Profil", url: "/tutor/profile", icon: User },
  ] : [];

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
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
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
        "lg:relative fixed inset-y-0 left-0 z-[70]",
        isMobileOpen ? "flex w-64" : "hidden lg:flex"
      )}>
        {/* Mobile Close Button */}
        <div className="lg:hidden absolute top-4 right-4">
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg hover:bg-accent text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 h-16 border-b shrink-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-base tracking-tight truncate text-foreground">Bintang TQA</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                {role}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              Menu
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
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  isCollapsed && "justify-center px-2"
                )
              }
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                "group-hover:text-primary"
              )} />
              {!isCollapsed && <span className="text-sm">{item.title}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer - Logout */}
        <div className="p-3 border-t">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 group",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
