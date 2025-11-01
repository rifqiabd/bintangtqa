import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Search } from "lucide-react";
import { toast } from "sonner";

interface TutorWithDistance {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  subjects: string[];
  experience: string;
  distance: number;
}

const FindTutors = () => {
  const [tutors, setTutors] = useState<TutorWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadMyLocation();
  }, []);

  const loadMyLocation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("latitude, longitude")
        .eq("id", user.id)
        .single();
      
      if (data?.latitude && data?.longitude) {
        setMyLocation({ lat: data.latitude, lng: data.longitude });
        loadNearbyTutors(data.latitude, data.longitude);
      } else {
        toast.error("Lokasi Anda belum tersedia. Silakan update profil.");
        setLoading(false);
      }
    }
  };

  const loadNearbyTutors = async (myLat: number, myLng: number) => {
    setLoading(true);
    try {
      // Get all tutors with their details
      const { data: tutorProfiles } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          phone,
          address,
          latitude,
          longitude
        `)
        .eq("role", "tutor")
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (!tutorProfiles) return;

      // Get tutor details
      const { data: tutorDetails } = await supabase
        .from("tutor_details")
        .select("tutor_id, subjects, experience")
        .in("tutor_id", tutorProfiles.map(t => t.id));

      // Calculate distances and merge data
      const tutorsWithDistance = tutorProfiles.map(tutor => {
        const details = tutorDetails?.find(d => d.tutor_id === tutor.id);
        const distance = calculateDistance(
          myLat,
          myLng,
          tutor.latitude!,
          tutor.longitude!
        );

        return {
          ...tutor,
          subjects: details?.subjects || [],
          experience: details?.experience || "",
          distance,
        } as TutorWithDistance;
      });

      // Sort by distance and filter within 10km
      const nearbyTutors = tutorsWithDistance
        .filter(t => t.distance <= 10)
        .sort((a, b) => a.distance - b.distance);

      setTutors(nearbyTutors);
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

  const filteredTutors = tutors.filter(tutor =>
    tutor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutor.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEnroll = async (tutorId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase.from("enrollments").insert({
        student_id: user.id,
        tutor_id: tutorId,
        subject: "matematika", // You can add subject selection
        status: "active",
      });

      if (error) throw error;
      toast.success("Berhasil mendaftar dengan tutor!");
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Anda sudah terdaftar dengan tutor ini");
      } else {
        toast.error("Gagal mendaftar");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cari Tutor Terdekat</h1>
        <p className="text-muted-foreground">Temukan tutor profesional di sekitar Anda</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan nama atau mata pelajaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <p>Memuat data tutor...</p>
      ) : filteredTutors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Tidak ada tutor dalam radius 10km</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTutors.map((tutor) => (
            <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{tutor.full_name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {tutor.distance.toFixed(1)} km dari Anda
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{tutor.subjects.length} Mata Pelajaran</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Mata Pelajaran:</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects.slice(0, 4).map((subject, idx) => (
                      <Badge key={idx} variant="outline">
                        {subject}
                      </Badge>
                    ))}
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
                <div className="flex gap-2">
                  <Button onClick={() => handleEnroll(tutor.id)} className="flex-1">
                    Daftar Sekarang
                  </Button>
                  <Button variant="outline" size="icon">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindTutors;