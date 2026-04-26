import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, GraduationCap, Layers } from "lucide-react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  role: "tutor" | "student";
  subjects?: string[];
}

const AdminMap = () => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTutors, setShowTutors] = useState(true);
  const [showStudents, setShowStudents] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    -6.2, 106.816666,
  ]);
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const [tutorResult, studentResult] = await Promise.all([
        supabase.from("user_roles").select("user_id").eq("role", "tutor"),
        supabase.from("user_roles").select("user_id").eq("role", "student"),
      ]);

      const tutorIds = tutorResult.data?.map((t) => t.user_id) || [];
      const studentIds = studentResult.data?.map((s) => s.user_id) || [];

      const allIds = [...tutorIds, ...studentIds];

      if (allIds.length === 0) {
        setLocations([]);
        return;
      }

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(
          `id, full_name, email, phone, address, latitude, longitude, tutor_details (subjects)`
        )
        .in("id", allIds)
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (error) throw error;

      const tutorSet = new Set(tutorIds);
      const enrichedData: LocationData[] = (profiles || [])
        .filter((p) => p.latitude && p.longitude)
        .map((p) => ({
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          phone: p.phone,
          address: p.address,
          latitude: p.latitude,
          longitude: p.longitude,
          role: tutorSet.has(p.id) ? "tutor" : "student",
          subjects: (p as any).tutor_details?.[0]?.subjects,
        }));

      setLocations(enrichedData);

      if (enrichedData.length > 0) {
        const avgLat =
          enrichedData.reduce((sum, p) => sum + (p.latitude || 0), 0) /
          enrichedData.length;
        const avgLng =
          enrichedData.reduce((sum, p) => sum + (p.longitude || 0), 0) /
          enrichedData.length;
        setMapCenter([avgLat, avgLng]);
      }

      toast.success(`Loaded ${enrichedData.length} locations`);
    } catch (error) {
      console.error("Error loading locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter((loc) => {
    if (!showTutors && loc.role === "tutor") return false;
    if (!showStudents && loc.role === "student") return false;
    return true;
  });

  const tutorCount = locations.filter((l) => l.role === "tutor").length;
  const studentCount = locations.filter((l) => l.role === "student").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat peta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Peta Lokasi</h1>
        <p className="text-muted-foreground">
          Lihat peta lokasi tutor dan siswa
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Lokasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Tutor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tutorCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Siswa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Peta Lokasi
            </CardTitle>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <Button
                variant={showTutors ? "default" : "outline"}
                size="sm"
                onClick={() => setShowTutors(!showTutors)}
              >
                <Users className="h-4 w-4 mr-1" />
                Tutor ({tutorCount})
              </Button>
              <Button
                variant={showStudents ? "default" : "outline"}
                size="sm"
                onClick={() => setShowStudents(!showStudents)}
              >
                <GraduationCap className="h-4 w-4 mr-1" />
                Siswa ({studentCount})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLocations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 h-[400px]">
              <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Tidak Ada Lokasi
              </h3>
              <p className="text-muted-foreground text-center">
                Tutor atau siswa belum mengisi lokasi
              </p>
            </div>
          ) : (
            <div className="h-[500px] rounded-lg overflow-hidden border">
              <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredLocations.map((loc) => (
                  <Marker
                    key={loc.id}
                    position={[loc.latitude!, loc.longitude!]}
                  >
                    <Popup>
                      <div className="p-1">
                        <div className="font-semibold">{loc.full_name}</div>
                        <Badge
                          className={
                            loc.role === "tutor"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {loc.role === "tutor" ? "Tutor" : "Siswa"}
                        </Badge>
                        <div className="text-sm mt-1">{loc.email}</div>
                        <div className="text-sm">{loc.phone}</div>
                        {loc.address && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {loc.address}
                          </div>
                        )}
                        {Array.isArray(loc.subjects) && loc.subjects.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {loc.subjects.slice(0, 3).map((s) => (
                              <Badge key={s} variant="outline">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMap;