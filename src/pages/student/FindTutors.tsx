import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const parseSubjects = (subjects: any): string[] => {
  if (Array.isArray(subjects)) return subjects;
  if (typeof subjects === 'string') {
    try {
      return JSON.parse(subjects);
    } catch {
      return subjects.split(',').map((s: string) => s.trim());
    }
  }
  return [];
};

const FindTutors = () => {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<TutorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Enroll modal
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorData | null>(null);
  const [enrolling, setEnrolling] = useState(false);

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

      // Get available tutors from tutor_details
      const { data: tutorDetails, error: tutorError } = await supabase
        .from("tutor_details")
        .select("tutor_id, subjects, experience, hourly_rate")
        .eq("is_available", true);

      if (tutorError) {
        console.error("Error fetching tutor details:", tutorError);
        throw tutorError;
      }

      if (!tutorDetails || tutorDetails.length === 0) {
        setTutors([]);
        setLoading(false);
        return;
      }

      // Get tutor profiles
      const tutorIds = tutorDetails.map(t => t.tutor_id);
      const { data: tutorProfiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, phone, email, address, latitude, longitude")
        .in("id", tutorIds);

      if (profileError) {
        console.error("Error fetching tutor profiles:", profileError);
        throw profileError;
      }

      // Find which tutors the student is already enrolled with
      const { data: myEnrollments } = await supabase
        .from("enrollments")
        .select("tutor_id")
        .eq("student_id", user.id)
        .eq("status", "active");

      const enrolledTutorIds = new Set((myEnrollments ?? []).map(e => e.tutor_id));

      // Map tutor data with profile info
      const allTutors = tutorDetails.map((td) => {
        const profile = tutorProfiles?.find(p => p.id === td.tutor_id);
        
        let distance: number | undefined;
        if (myLocation && profile?.latitude && profile?.longitude) {
          distance = calculateDistance(myLocation.lat, myLocation.lng, profile.latitude, profile.longitude);
        }

        return {
          id: td.tutor_id,
          full_name: profile?.full_name || "Nama tidak tersedia",
          phone: enrolledTutorIds.has(td.tutor_id) ? (profile?.phone ?? "Daftar untuk melihat") : "Daftar untuk melihat",
          email: enrolledTutorIds.has(td.tutor_id) ? (profile?.email ?? "Daftar untuk melihat") : "Daftar untuk melihat",
          address: profile?.address || "Alamat tidak tersedia",
          latitude: profile?.latitude ?? null,
          longitude: profile?.longitude ?? null,
          subjects: parseSubjects(td.subjects),
          experience: td.experience || "",
          hourly_rate: td.hourly_rate ?? null,
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
    const matchesSearch = 
      tutor.full_name.toLowerCase().includes(query) ||
      tutor.address.toLowerCase().includes(query);
    
    return matchesSearch;
  });

  const handleEnrollClick = (tutor: TutorData) => {
    setSelectedTutor(tutor);
    setShowEnrollDialog(true);
  };

  const handleEnroll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }

    if (!selectedTutor) {
      toast.error("Tutor tidak dipilih.");
      return;
    }

    setEnrolling(true);
    try {
      // Check if already enrolled
      const { data: existing } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", user.id)
        .eq("tutor_id", selectedTutor.id)
        .single();

      if (existing) {
        toast.error("Anda sudah terdaftar dengan tutor ini");
        return;
      }

      const { error } = await supabase.from("enrollments").insert({
        student_id: user.id,
        tutor_id: selectedTutor.id,
        status: "pending",
      });

      if (error) throw error;
      toast.success(`Berhasil mengajukan pendaftaran ke ${selectedTutor?.full_name}! Menunggu persetujuan tutor.`);
      
      setShowEnrollDialog(false);
      setSelectedTutor(null);
    } catch (error) {
      console.error("Error enrolling:", error);
      toast.error("Gagal mendaftar");
    } finally {
      setEnrolling(false);
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

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan nama atau lokasi..."
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
                  onClick={() => handleEnrollClick(tutor)} 
                  className="w-full"
                >
                  Daftar Sekarang
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Enroll Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Daftar ke Tutor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tutor</Label>
              <Input value={selectedTutor?.full_name || ""} disabled />
            </div>
            <p className="text-sm text-muted-foreground">
              Klik "Daftar" untuk mengajukan pendaftaran. Tutor akan meninjau dan menyetujui permintaan Anda.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? "Mendaftarkan..." : "Daftar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FindTutors;