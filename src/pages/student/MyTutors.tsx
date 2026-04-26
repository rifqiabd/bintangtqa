import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, MapPin, User, Navigation, MapIcon } from "lucide-react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const tutorIcon = new L.Icon({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  className: "bg-blue-500 rounded-full",
});

interface Enrollment {
  id: string;
  tutor_id: string;
  status: string;
  created_at: string;
  tutor: {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
  };
}

const MyTutors = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadMyTutors();
  }, []);

  const loadMyTutors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          tutor_id,
          status,
          created_at,
          tutor:profiles!enrollments_tutor_id_fkey(
            full_name,
            email,
            phone,
            address,
            latitude,
            longitude
          )
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error("Error loading tutors:", error);
      toast.error("Gagal memuat data tutor");
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Aktif";
      case "pending": return "Menunggu";
      case "completed": return "Selesai";
      case "cancelled": return "Dibatalkan";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  const activeTutors = enrollments.filter(e => e.status === "active");
  const pendingTutors = enrollments.filter(e => e.status === "pending");
  const filteredActiveTutors = activeTutors.filter(e =>
    e.tutor.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Tutor Saya</h1>
        <p className="text-muted-foreground">Daftar tutor yang mengajar Anda</p>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum Ada Tutor</h3>
            <p className="text-muted-foreground text-center mb-4">
              Anda belum mendaftar dengan tutor manapun
            </p>
            <Button onClick={() => window.location.href = "/student/find-tutors"}>
              Cari Tutor Sekarang
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Tutor Aktif ({activeTutors.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Menunggu ({pendingTutors.length})
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapIcon className="h-4 w-4 mr-1" />
              Peta Tutor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeTutors.map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{enrollment.tutor.full_name}</CardTitle>
                          <Badge className={getStatusColor(enrollment.status)} variant="secondary">
                            {getStatusText(enrollment.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{enrollment.tutor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{enrollment.tutor.email}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{enrollment.tutor.address || "Alamat tidak tersedia"}</span>
                    </div>
                    {enrollment.tutor.latitude && enrollment.tutor.longitude && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => openGoogleMaps(enrollment.tutor.latitude!, enrollment.tutor.longitude!, enrollment.tutor.full_name)}
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Rute ke Google Maps
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingTutors.map((enrollment) => (
                <Card key={enrollment.id} className="border-yellow-200 bg-yellow-50/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{enrollment.tutor.full_name}</CardTitle>
                          <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
                            Menunggu Persetujuan
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{enrollment.tutor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{enrollment.tutor.email}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{enrollment.tutor.address || "Alamat tidak tersedia"}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <MapIcon className="h-5 w-5" />
                    Peta Lokasi Tutor
                  </CardTitle>
                  <Input
                    placeholder="Cari nama tutor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const tutorsWithLocation = enrollments.filter(
                    e => e.status === "active" && e.tutor.latitude && e.tutor.longitude
                  );
                  const filteredTutors = tutorsWithLocation.filter(e =>
                    e.tutor.full_name.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (tutorsWithLocation.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 h-[400px]">
                        <MapIcon className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Tidak Ada Lokasi Tutor
                        </h3>
                        <p className="text-muted-foreground text-center">
                          Tutor belum mengisi lokasi di profil mereka
                        </p>
                      </div>
                    );
                  }

                  const mapCenter: [number, number] = filteredTutors.length > 0
                    ? [filteredTutors[0].tutor.latitude!, filteredTutors[0].tutor.longitude!]
                    : [-6.2, 106.816666];

                  return (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {filteredTutors.length} tutor dengan lokasi
                        </Badge>
                      </div>
                      <div className="h-[500px] rounded-lg overflow-hidden border relative z-0">
                        <MapContainer
                          center={mapCenter}
                          zoom={12}
                          style={{ height: "100%", width: "100%", zIndex: 0 }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          {filteredTutors.map((enrollment) => (
                            <Marker
                              key={enrollment.id}
                              position={[
                                enrollment.tutor.latitude!,
                                enrollment.tutor.longitude!,
                              ]}
                              icon={tutorIcon}
                            >
                              <Popup>
                                <div className="p-2 min-w-[200px]">
                                  <div className="font-semibold">{enrollment.tutor.full_name}</div>
                                  <div className="flex items-start gap-1 text-sm mt-1">
                                    <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                    <span className="line-clamp-2">
                                      {enrollment.tutor.address || "Alamat tidak tersedia"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm mt-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{enrollment.tutor.phone}</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={() =>
                                      openGoogleMaps(
                                        enrollment.tutor.latitude!,
                                        enrollment.tutor.longitude!,
                                        enrollment.tutor.full_name
                                      )
                                    }
                                  >
                                    <Navigation className="h-3 w-3 mr-1" />
                                    Rute ke Google Maps
                                  </Button>
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                        </MapContainer>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default MyTutors;