import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapPin, Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";

const calculateDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return null;
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}j ${minutes}m`;
    return `${minutes}m`;
  };

// Validation schema for notes
const notesSchema = z.object({
  notes: z.string().max(1000, "Catatan maksimal 1000 karakter").optional(),
});

type AttendanceRecord = {
  id: string;
  check_in_time: string | null;
  check_out_time: string | null;
  notes: string | null;
  student_id: string | null;
};

const TutorAttendance = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<AttendanceRecord | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [filterMonth, setFilterMonth] = useState("");
  const [elapsedTime, setElapsedTime] = useState<string>("");

  useEffect(() => {
    loadActiveSession();
    loadRecentAttendance();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (!activeSession?.check_in_time || activeSession?.check_out_time) {
      setElapsedTime("");
      return;
    }

    const updateElapsed = () => {
      const start = new Date(activeSession.check_in_time!).getTime();
      const now = Date.now();
      const diffMs = now - start;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setElapsedTime(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          toast.error("Tidak dapat mengakses lokasi");
          console.error(error);
        }
      );
    }
  };

  const loadActiveSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("tutor_id", user.id)
      .is("check_out_time", null)
      .order("check_in_time", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error loading active session:", error);
    }
    
    if (data && data.length > 0) {
      setActiveSession(data[0]);
    } else {
      setActiveSession(null);
    }
  };

  const loadRecentAttendance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("attendance")
      .select("*")
      .eq("tutor_id", user.id)
      .order("check_in_time", { ascending: false });

    if (filterMonth) {
      const [year, month] = filterMonth.split("-");
      query = query.gte("check_in_time", `${year}-${month}-01`)
                   .lt("check_in_time", `${year}-${month}-31`);
    }

    const { data } = await query.limit(5000);

    setRecentAttendance(data || []);
  };

  useEffect(() => {
    loadRecentAttendance();
  }, [filterMonth]);

  const handleCheckIn = async () => {
    if (!location) {
      toast.error("Lokasi belum terdeteksi");
      return;
    }

    setLoading(true);
    try {
      // Validate notes input
      const validatedData = notesSchema.parse({ notes });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("attendance").insert({
        tutor_id: user.id,
        check_in_time: new Date().toISOString(),
        check_in_latitude: location.lat,
        check_in_longitude: location.lng,
        notes: validatedData.notes || null,
      });

      if (error) throw error;

      toast.success("Check-in berhasil!");
      setNotes("");
      loadActiveSession();
      loadRecentAttendance();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error instanceof Error ? error.message : "Check-in gagal");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!location || !activeSession) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("attendance")
        .update({
          check_out_time: new Date().toISOString(),
          check_out_latitude: location.lat,
          check_out_longitude: location.lng,
        })
        .eq("id", activeSession.id);

      if (error) throw error;

      toast.success("Check-out berhasil!");
      setActiveSession(null);
      loadActiveSession();
      loadRecentAttendance();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Check-out gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Absensi</h1>
        <p className="text-muted-foreground">Catat kehadiran mengajar Anda</p>
      </div>

      {activeSession ? (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Sesi Aktif
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4" />
                  {elapsedTime ? (
                    <span className="font-mono text-lg font-bold text-green-600">{elapsedTime}</span>
                  ) : (
                    new Date(activeSession.check_in_time).toLocaleString("id-ID")
                  )}
                </CardDescription>
              </div>
              <Badge variant="default">Aktif</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {location ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Lokasi saat ini: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </div>
            ) : (
              <p className="text-sm text-destructive">Mendeteksi lokasi...</p>
            )}
            <Button
              onClick={handleCheckOut}
              disabled={loading || !location}
              variant="destructive"
              className="w-full gap-2"
            >
              <XCircle className="h-4 w-4" />
              Check-Out Sekarang
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Check-In</CardTitle>
            <CardDescription>Mulai sesi mengajar baru</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {location ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-green-500" />
                Lokasi terdeteksi: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </div>
            ) : (
              <p className="text-sm text-destructive">Mendeteksi lokasi...</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (opsional)</Label>
              <Textarea
                id="notes"
                placeholder="Tambahkan catatan untuk sesi ini..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <Button
              onClick={handleCheckIn}
              disabled={loading || !location}
              className="w-full gap-2"
            >
              <Clock className="h-4 w-4" />
              Check-In Sekarang
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Riwayat Absensi</CardTitle>
              <CardDescription>Semua riwayat</CardDescription>
            </div>
            <Input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-40"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAttendance.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada riwayat absensi
              </p>
            ) : (
              recentAttendance.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {new Date(att.check_in_time).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(att.check_in_time).toLocaleTimeString("id-ID")} -{" "}
                      {att.check_out_time
                        ? new Date(att.check_out_time).toLocaleTimeString("id-ID")
                        : "Belum check-out"}
                      {att.check_out_time && (
                        <span className="ml-2 text-green-600">
                          ({calculateDuration(att.check_in_time!, att.check_out_time)})
                        </span>
                      )}
                    </p>
                  </div>
                  <Badge variant={att.check_out_time ? "default" : "secondary"}>
                    {att.check_out_time ? "Selesai" : "Aktif"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorAttendance;