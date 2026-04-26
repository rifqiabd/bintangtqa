import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Search, User, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface TutorData {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  subjects: string[];
  experience: string;
  hourly_rate: number | null;
  distance?: number;
}

const FindTutors = () => {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<TutorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadTutors();
  }, []);

  const loadTutors = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User tidak ditemukan");
        return;
      }

      // Get my location
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("latitude, longitude")
        .eq("id", user.id)
        .single();

      if (myProfile?.latitude && myProfile?.longitude) {
        setMyLocation({ lat: myProfile.latitude, lng: myProfile.longitude });
      }

      // Use safe RPC that exposes only non-sensitive tutor info
      // (no phone/email leakage to non-enrolled students)
      const { data: publicTutors, error: rpcError } = await supabase
        .rpc("get_public_tutor_profiles");

      if (rpcError) throw rpcError;

      if (!publicTutors || publicTutors.length === 0) {
        setTutors([]);
        setLoading(false);
        return;
      }

      // Find which tutors the student is already enrolled with
      // (contact details will be visible only after enrollment)
      const { data: myEnrollments } = await supabase
        .from("enrollments")
        .select("tutor_id")
        .eq("student_id", user.id)
        .eq("status", "active");

      const enrolledTutorIds = new Set((myEnrollments ?? []).map(e => e.tutor_id));

      // For enrolled tutors, fetch contact details from profiles (RLS will allow it)
      let enrolledProfiles: Array<{ id: string; phone: string; email: string }> = [];
      if (enrolledTutorIds.size > 0) {
        const { data: enrolledData } = await supabase
          .from("profiles")
          .select("id, phone, email")
          .in("id", Array.from(enrolledTutorIds));
        enrolledProfiles = enrolledData ?? [];
      }

      const allTutors = publicTutors.map((t: any) => {
        let distance: number | undefined;
        if (myLocation && t.latitude && t.longitude) {
          distance = calculateDistance(myLocation.lat, myLocation.lng, t.latitude, t.longitude);
        }

        const contact = enrolledProfiles.find(p => p.id === t.id);
        return {
          id: t.id,
          full_name: t.full_name || "Nama tidak tersedia",
          phone: contact?.phone ?? "Daftar untuk melihat",
          email: contact?.email ?? "Daftar untuk melihat",
          address: t.address || "Alamat tidak tersedia",
          latitude: t.latitude,
          longitude: t.longitude,
          subjects: t.subjects || [],
          experience: t.experience || "",
          hourly_rate: t.hourly_rate ?? null,
          distance,
        };
      });

      // Sort by distance if available
      const sortedTutors = allTutors.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
      });

      setTutors(sortedTutors);
    } catch (error) {
      console.error("Error loading tutors:", error);
      toast.error("Gagal memuat data tutor");
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return (value * Math.PI) / 180;
  };

  const filteredTutors = tutors.filter((tutor) => {
    const query = searchQuery.toLowerCase();
    return (
      tutor.full_name.toLowerCase().includes(query) ||
      tutor.subjects.some((subject) => subject.toLowerCase().includes(query)) ||
      tutor.address.toLowerCase().includes(query)
    );
  });

  const handleEnroll = async (tutorId: string, tutorName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }

    try {
      // Check if already enrolled
      const { data: existing } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", user.id)
        .eq("tutor_id", tutorId)
        .single();

      if (existing) {
        toast.error("Anda sudah terdaftar dengan tutor ini");
        return;
      }

      const { error } = await supabase.from("enrollments").insert({
        student_id: user.id,
        tutor_id: tutorId,
        subject: "matematika",
        status: "active",
      });

      if (error) throw error;
      toast.success(`Berhasil mendaftar dengan ${tutorName}!`);
      
      // Refresh tutors
      setTimeout(() => loadTutors(), 1000);
    } catch (error) {
      console.error("Error enrolling:", error);
      toast.error("Gagal mendaftar");
    }
  };

  const formatSubject = (subject: string) => {
    return subject.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat data tutor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Cari Tutor</h1>
          <p className="text-muted-foreground">
            {myLocation 
              ? "Temukan tutor profesional terdekat dengan Anda" 
              : "Temukan tutor profesional"}
          </p>
        </div>
        {!myLocation && (
          <Button variant="outline" onClick={() => navigate("/student/profile")}>
            Set Lokasi
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan nama, mata pelajaran, atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredTutors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum Ada Tutor</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? "Tidak ada tutor yang cocok dengan pencarian Anda" 
                : "Belum ada tutor yang terdaftar di sistem"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTutors.map((tutor) => (
            <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-lg truncate">{tutor.full_name}</CardTitle>
                      {tutor.distance !== undefined && (
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{tutor.distance.toFixed(1)} km</span>
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {tutor.subjects.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Mata Pelajaran:</p>
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects.slice(0, 3).map((subject, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {formatSubject(subject)}
                        </Badge>
                      ))}
                      {tutor.subjects.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{tutor.subjects.length - 3} lagi
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span className="truncate">{tutor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{tutor.email}</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{tutor.address}</span>
                  </div>
                </div>

                {tutor.experience && (
                  <div>
                    <p className="text-sm font-medium mb-1">Pengalaman:</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tutor.experience}
                    </p>
                  </div>
                )}

                {tutor.hourly_rate && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Tarif per jam:</p>
                    <p className="text-lg font-bold text-primary">
                      Rp {tutor.hourly_rate.toLocaleString("id-ID")}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={() => handleEnroll(tutor.id, tutor.full_name)} 
                  className="w-full"
                >
                  Daftar Sekarang
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindTutors;
