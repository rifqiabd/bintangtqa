import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TutorDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendance: 0,
    monthAttendance: 0,
  });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
    }
  };

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get total students
    const { count: totalStudents } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("tutor_id", user.id)
      .eq("status", "active");

    // Get today's attendance
    const today = new Date().toISOString().split("T")[0];
    const { count: todayAttendance } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("tutor_id", user.id)
      .gte("check_in_time", `${today}T00:00:00`)
      .lte("check_in_time", `${today}T23:59:59`);

    // Get month's attendance
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const { count: monthAttendance } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("tutor_id", user.id)
      .gte("check_in_time", firstDayOfMonth.toISOString());

    setStats({
      totalStudents: totalStudents || 0,
      todayAttendance: todayAttendance || 0,
      monthAttendance: monthAttendance || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Tutor</h1>
        <p className="text-muted-foreground">Selamat datang, {profile?.full_name}!</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Siswa aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absensi Hari Ini</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAttendance}</div>
            <p className="text-xs text-muted-foreground">Sesi hari ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthAttendance}</div>
            <p className="text-xs text-muted-foreground">Total sesi</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Absensi Cepat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Catat kehadiran Anda dengan mudah dan cepat.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/tutor/attendance")} className="gap-2">
              <Clock className="h-4 w-4" />
              Check-In Sekarang
            </Button>
            <Button variant="outline" onClick={() => navigate("/tutor/students")}>
              Lihat Siswa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorDashboard;