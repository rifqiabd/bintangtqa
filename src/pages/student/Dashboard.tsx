import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalTutors: 0,
    myTutors: 0,
    nearbyTutors: 0,
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

    // Get total tutors
    const { count: totalTutors } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "tutor");

    // Get my tutors
    const { count: myTutors } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("student_id", user.id);

    setStats({
      totalTutors: totalTutors || 0,
      myTutors: myTutors || 0,
      nearbyTutors: 0, // Will be calculated with location
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Siswa</h1>
        <p className="text-muted-foreground">Selamat datang, {profile?.full_name}!</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tutor</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTutors}</div>
            <p className="text-xs text-muted-foreground">Tutor tersedia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tutor Saya</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myTutors}</div>
            <p className="text-xs text-muted-foreground">Tutor aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tutor Terdekat</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.nearbyTutors}</div>
            <p className="text-xs text-muted-foreground">Dalam radius 10km</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mulai Belajar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Temukan tutor terbaik di sekitar Anda dan mulai perjalanan belajar Anda.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/student/find-tutors")} className="gap-2">
              <MapPin className="h-4 w-4" />
              Cari Tutor Terdekat
            </Button>
            <Button variant="outline" onClick={() => navigate("/student/my-tutors")}>
              Lihat Tutor Saya
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;