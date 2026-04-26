import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Search, Users, Mail, Phone, MapPin, BookOpen, Eye, Power, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

const subjectOptions = [
  { value: "matematika", label: "Matematika" },
  { value: "fisika", label: "Fisika" },
  { value: "kimia", label: "Kimia" },
  { value: "biologi", label: "Biologi" },
  { value: "bahasa_indonesia", label: "Bahasa Indonesia" },
  { value: "bahasa_inggris", label: "Bahasa Inggris" },
  { value: "ekonomi", label: "Ekonomi" },
  { value: "akuntansi", label: "Akuntansi" },
  { value: "sejarah", label: "Sejarah" },
  { value: "geografi", label: "Geografi" },
  { value: "sosiologi", label: "Sosiologi" },
  { value: "pkn", label: "PKN" },
];

interface Tutor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
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
  const [editOpen, setEditOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState({
    full_name: "",
    phone: "",
    address: "",
    latitude: null as number | null,
    longitude: null as number | null,
    subjects: [] as string[],
    experience: "",
    hourly_rate: "",
    is_available: true,
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addingTutor, setAddingTutor] = useState({
    email: "",
    full_name: "",
    phone: "",
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadTutors();
  }, []);

  const loadTutors = async () => {
    try {
      setLoading(true);
      
      // Get all tutors from user_roles
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

      // Get profiles
      const { data: profilesData, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          phone,
          address,
          latitude,
          longitude,
          created_at
        `)
        .in("id", tutorIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get tutor_details using bypass function
      const { data: tutorDetailsData, error: tdError } = await supabase.rpc('admin_get_all_tutor_details');

      // Merge data - parse subjects from TEXT (string) to array
      const mergedData = (profilesData || []).map((profile) => {
        const td = tutorDetailsData?.find((td: any) => td.tutor_id === profile.id);
        let subjects: string[] = [];
        
        if (td?.subjects) {
          try {
            // subjects is now TEXT, parse JSON string to array
            subjects = JSON.parse(td.subjects);
          } catch {
            subjects = [];
          }
        }
        
        return {
          ...profile,
          tutor_details: td ? {
            subjects,
            experience: td.experience,
            is_available: td.is_available,
            hourly_rate: td.hourly_rate
          } : null
        };
      });

      setTutors(mergedData);
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

  const openEditDialog = (tutor: Tutor) => {
    setEditingTutor({
      full_name: tutor.full_name,
      phone: tutor.phone,
      address: tutor.address || "",
      latitude: tutor.latitude,
      longitude: tutor.longitude,
      subjects: tutor.tutor_details?.subjects || [],
      experience: tutor.tutor_details?.experience || "",
      hourly_rate: tutor.tutor_details?.hourly_rate?.toString() || "",
      is_available: tutor.tutor_details?.is_available ?? true,
    });
    setSelectedTutor(tutor);
    setEditOpen(true);
  };

  const handleAddTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      const tempPassword = Math.random().toString(36).slice(-8);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: addingTutor.email,
        password: tempPassword,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed");

      await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: addingTutor.full_name,
        email: addingTutor.email,
        phone: addingTutor.phone,
      });

      await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role: "tutor",
      });

      await supabase.from("tutor_details").insert({
        tutor_id: authData.user.id,
        subjects: [],
        is_available: true,
      });

      toast.success("Tutor berhasil ditambahkan! Password: " + tempPassword);
      setAddOpen(false);
      setAddingTutor({ email: "", full_name: "", phone: "" });
      loadTutors();
    } catch (error: any) {
      console.error("Error adding tutor:", error);
      toast.error(error.message || "Gagal menambahkan tutor");
    } finally {
      setAdding(false);
    }
  };

  const handleEditTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);

    try {
      if (!selectedTutor) return;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: editingTutor.full_name,
          phone: editingTutor.phone,
          address: editingTutor.address,
          latitude: editingTutor.latitude,
          longitude: editingTutor.longitude,
        })
        .eq("id", selectedTutor.id);

      if (profileError) throw profileError;

      const { error: detailsError } = await supabase
        .from("tutor_details")
        .upsert({
          tutor_id: selectedTutor.id,
          subjects: editingTutor.subjects as any,
          experience: editingTutor.experience,
          hourly_rate: editingTutor.hourly_rate ? parseFloat(editingTutor.hourly_rate) : null,
          is_available: editingTutor.is_available,
        }, {
          onConflict: "tutor_id",
        });

      if (detailsError) throw detailsError;

      toast.success("Tutor berhasil diperbarui");
      setEditOpen(false);
      loadTutors();
    } catch (error) {
      console.error("Error updating tutor:", error);
      toast.error("Gagal memperbarui tutor");
    } finally {
      setSavingEdit(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setEditingTutor({
            ...editingTutor,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          toast.success("Lokasi berhasil didapatkan");
        },
        () => {
          toast.error("Gagal mendapatkan lokasi");
        }
      );
    } else {
      toast.error("Browser tidak mendukung geolokasi");
    }
  };

  const toggleSubject = (subjectValue: string) => {
    setEditingTutor((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subjectValue)
        ? prev.subjects.filter((s) => s !== subjectValue)
        : [...prev.subjects, subjectValue],
    }));
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Semua Tutor</h1>
            <p className="text-muted-foreground">Kelola data tutor</p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Tutor
          </Button>
        </div>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(tutor)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
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

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tutor</DialogTitle>
            <DialogDescription>
              Edit informasi tutor
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTutor} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFullName">Nama Lengkap</Label>
              <Input
                id="editFullName"
                value={editingTutor.full_name}
                onChange={(e) => setEditingTutor({ ...editingTutor, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhone">Nomor HP</Label>
              <Input
                id="editPhone"
                value={editingTutor.phone}
                onChange={(e) => setEditingTutor({ ...editingTutor, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAddress">Alamat</Label>
              <Textarea
                id="editAddress"
                value={editingTutor.address}
                onChange={(e) => setEditingTutor({ ...editingTutor, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Lokasi</Label>
              <div className="flex gap-2">
                <Input
                  value={
                    editingTutor.latitude && editingTutor.longitude
                      ? `${editingTutor.latitude.toFixed(6)}, ${editingTutor.longitude?.toFixed(6)}`
                      : "Belum diset"
                  }
                  disabled
                  className="bg-muted"
                />
                <Button type="button" variant="outline" onClick={getCurrentLocation}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Dapatkan Lokasi
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mata Pelajaran</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {subjectOptions.map((subject) => (
                  <div key={subject.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${subject.value}`}
                      checked={editingTutor.subjects.includes(subject.value)}
                      onCheckedChange={() => toggleSubject(subject.value)}
                    />
                    <label htmlFor={`edit-${subject.value}`} className="text-sm">
                      {subject.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editExperience">Pengalaman</Label>
              <Textarea
                id="editExperience"
                value={editingTutor.experience}
                onChange={(e) => setEditingTutor({ ...editingTutor, experience: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRate">Tarif per Jam (Rp)</Label>
              <Input
                id="editRate"
                type="number"
                value={editingTutor.hourly_rate}
                onChange={(e) => setEditingTutor({ ...editingTutor, hourly_rate: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="editAvailable"
                checked={editingTutor.is_available}
                onCheckedChange={(checked) => setEditingTutor({ ...editingTutor, is_available: !!checked })}
              />
              <label htmlFor="editAvailable">Tersedia untuk mengajar</label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Tutor Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Tutor Baru</DialogTitle>
            <DialogDescription>
              Daftar tutor baru secara offline. Akun akan dibuatkan otomatis.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTutor} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addEmail">Email</Label>
              <Input
                id="addEmail"
                type="email"
                value={addingTutor.email}
                onChange={(e) => setAddingTutor({ ...addingTutor, email: e.target.value })}
                placeholder="tutor@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addName">Nama Lengkap</Label>
              <Input
                id="addName"
                value={addingTutor.full_name}
                onChange={(e) => setAddingTutor({ ...addingTutor, full_name: e.target.value })}
                placeholder="Nama lengkap tutor"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addPhone">Nomor HP</Label>
              <Input
                id="addPhone"
                value={addingTutor.phone}
                onChange={(e) => setAddingTutor({ ...addingTutor, phone: e.target.value })}
                placeholder="0812..."
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={adding}>
                {adding ? "Menambahkan..." : "Tambah Tutor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTutors;