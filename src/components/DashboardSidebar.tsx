import { NavLink } from "react-router-dom";
import { Home, Users, Calendar, MapPin, LogOut, BarChart, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DashboardSidebarProps {
  role: "admin" | "tutor" | "student";
}

const DashboardSidebar = ({ role }: DashboardSidebarProps) => {
  const { state } = useSidebar();
  const navigate = useNavigate();

  const adminItems = [
    { title: "Dashboard", url: "/admin", icon: Home },
    { title: "Semua Tutor", url: "/admin/tutors", icon: Users },
    { title: "Semua Siswa", url: "/admin/students", icon: User },
    { title: "Laporan Absensi", url: "/admin/attendance", icon: Calendar },
    { title: "Peta Lokasi", url: "/admin/map", icon: MapPin },
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

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu {role === "admin" ? "Admin" : role === "tutor" ? "Tutor" : "Siswa"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;