import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Users, Mail, Phone, MapPin, BookOpen, Eye, Power } from "lucide-react";
import { toast } from "sonner";

interface Tutor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  tutor_details: {
    subjects: string[];
    experience: string;
    is_available: boolean;
    hourly_rate: number;
  } | null;
}

const AdminTutors = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    loadTutors();
  }, []);

  const loadTutors = async () => {
    try {
      setLoading(true);
      const { data: tutorUsers, error: tutorError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "tutor");

      if (tutorError) throw tutorError;

      if (!tutorUsers || tutorUsers.length === 0) {
        setTutors([]);
        return;
      }

      const tutorIds = tutorUsers.map((t) => t.user_id);

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          phone,
          address,
          created_at,
          tutor_details (
            subjects,
            experience,
            is_available,
            hourly_rate
          )
        `)
        .in("id", tutorIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTutors(data || []);
    } catch (error) {
      console.error("Error loading tutors:", error);
      toast.error("Gagal memuat data tutor");
    } finally {
      setLoading(false);
    }
  };

  const toggleTutorStatus = async (tutor: Tutor) => {
    try {
      const newStatus = !tutor.tutor_details?.is_available;
      const { error } = await supabase
        .from("tutor_details")
        .update({ is_available: newStatus })
        .eq("tutor_id", tutor.id);

      if (error) throw error;

      setTutors(
        tutors.map((t) =>
          t.id === tutor.id
            ? {
                ...t,
                tutor_details: t.tutor_details
                  ? { ...t.tutor_details, is_available: newStatus }
                  : null,
              }
            : t
        )
      );
      toast.success(newStatus ? "Tutor diaktifkan" : "Tutor dinonaktifkan");
    } catch (error) {
      console.error("Error updating tutor status:", error);
      toast.error("Gagal mengupdate status tutor");
    }
  };

  const filteredTutors = tutors.filter(
    (tutor) =>
      tutor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.phone.includes(searchQuery)
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Semua Tutor</h1>
        <p className="text-muted-foreground">Kelola data tutor</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Daftar Tutor ({filteredTutors.length})</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, atau phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTutors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak Ada Tutor</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery
                  ? "Tidak ada tutor yang sesuai dengan pencarian"
                  : "Belum ada tutor yang terdaftar"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tgl Daftar</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTutors.map((tutor) => (
                    <TableRow key={tutor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{tutor.full_name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {tutor.address || "Alamat belum diisi"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="line-clamp-1">{tutor.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{tutor.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {tutor.tutor_details?.subjects?.slice(0, 3).map((subject) => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                              {subject.replace(/_/g, " ")}
                            </Badge>
                          ))}
                          {(tutor.tutor_details?.subjects?.length || 0) > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(tutor.tutor_details?.subjects?.length || 0) - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            tutor.tutor_details?.is_available
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                          }
                        >
                          {tutor.tutor_details?.is_available ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(tutor.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTutor(tutor);
                              setDetailOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Lihat
                          </Button>
                          <Button
                            variant={
                              tutor.tutor_details?.is_available
                                ? "destructive"
                                : "default"
                            }
                            size="sm"
                            onClick={() => toggleTutorStatus(tutor)}
                          >
                            <Power className="h-4 w-4 mr-1" />
                            {tutor.tutor_details?.is_available ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Tutor</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang tutor
            </DialogDescription>
          </DialogHeader>
          {selectedTutor && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{selectedTutor.full_name}</h2>
                  <Badge
                    className={
                      selectedTutor.tutor_details?.is_available
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    }
                  >
                    {selectedTutor.tutor_details?.is_available ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold">Informasi Kontak</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedTutor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedTutor.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{selectedTutor.address || "Alamat belum diisi"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Informasi Tutor</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {selectedTutor.tutor_details?.subjects?.map((subject) => (
                          <Badge key={subject} variant="secondary">
                            {subject.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Experience:</span>
                      <span>
                        {selectedTutor.tutor_details?.experience ||
                          "Belum ada"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Tarif:</span>
                      <span>
                        {selectedTutor.tutor_details?.hourly_rate
                          ? `Rp ${selectedTutor.tutor_details.hourly_rate.toLocaleString("id-ID")}/jam`
                          : "Belum ditentukan"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Tutor sejak: {formatDate(selectedTutor.created_at)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Tutup
            </Button>
            {selectedTutor && (
              <Button
                variant={selectedTutor.tutor_details?.is_available ? "destructive" : "default"}
                onClick={() => {
                  toggleTutorStatus(selectedTutor);
                  setDetailOpen(false);
                }}
              >
                <Power className="h-4 w-4 mr-2" />
                {selectedTutor.tutor_details?.is_available
                  ? "Nonaktifkan"
                  : "Aktifkan"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTutors;