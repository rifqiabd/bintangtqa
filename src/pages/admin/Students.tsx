import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Search, User, Mail, Phone, MapPin, BookOpen, Eye, GraduationCap, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  enrollments?: {
    id: string;
    tutor_id: string;
    subject: string;
    status: string;
  }[];
}

const AdminStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState({
    full_name: "",
    phone: "",
    address: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addingStudent, setAddingStudent] = useState({
    email: "",
    full_name: "",
    phone: "",
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const { data: studentUsers, error: studentError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      if (studentError) throw studentError;

      if (!studentUsers || studentUsers.length === 0) {
        setStudents([]);
        return;
      }

      const studentIds = studentUsers.map((s) => s.user_id);

      const { data: profilesData, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, address, latitude, longitude, created_at")
        .in("id", studentIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Get enrollments using bypass function
      const { data: enrollmentsData } = await supabase.rpc('admin_get_all_enrollments');

      const studentsWithEnrollments: Student[] = (profilesData || []).map((profile) => ({
        ...profile,
        enrollments: (enrollmentsData || []).filter((e: any) => e.student_id === profile.id)
      }));

      setStudents(studentsWithEnrollments);
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Gagal memuat data siswa");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent({
      full_name: student.full_name,
      phone: student.phone,
      address: student.address || "",
      latitude: student.latitude,
      longitude: student.longitude,
    });
    setSelectedStudent(student);
    setEditOpen(true);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      const tempPassword = Math.random().toString(36).slice(-8);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: addingStudent.email,
        password: tempPassword,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed");

      await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: addingStudent.full_name,
        email: addingStudent.email,
        phone: addingStudent.phone,
      });

      await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role: "student",
      });

      toast.success("Siswa berhasil ditambahkan! Password: " + tempPassword);
      setAddOpen(false);
      setAddingStudent({ email: "", full_name: "", phone: "" });
      loadStudents();
    } catch (error: any) {
      console.error("Error adding student:", error);
      toast.error(error.message || "Gagal menambahkan siswa");
    } finally {
      setAdding(false);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);

    try {
      if (!selectedStudent) return;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: editingStudent.full_name,
          phone: editingStudent.phone,
          address: editingStudent.address,
          latitude: editingStudent.latitude,
          longitude: editingStudent.longitude,
        })
        .eq("id", selectedStudent.id);

      if (profileError) throw profileError;

      toast.success("Siswa berhasil diperbarui");
      setEditOpen(false);
      loadStudents();
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Gagal memperbarui siswa");
    } finally {
      setSavingEdit(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setEditingStudent({
            ...editingStudent,
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

  const filteredStudents = students.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery)
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getEnrollmentStatus = (enrollments: Student["enrollments"]) => {
    if (!enrollments || enrollments.length === 0) return "Belum Daftar";
    const active = enrollments.filter((e) => e.status === "active").length;
    if (active > 0) return `${active} Tutor`;
    return "Tidak Aktif";
  };

  const getEnrollmentStatusColor = (enrollments: Student["enrollments"]) => {
    if (!enrollments || enrollments.length === 0) return "bg-gray-100 text-gray-800";
    const active = enrollments.filter((e) => e.status === "active").length;
    if (active > 0) return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-yellow-800";
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
            <h1 className="text-2xl lg:text-3xl font-bold">Semua Siswa</h1>
            <p className="text-muted-foreground">Kelola data siswa</p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Siswa
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">
              Daftar Siswa ({filteredStudents.length})
            </CardTitle>
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
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <User className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak Ada Siswa</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery
                  ? "Tidak ada siswa yang sesuai dengan pencarian"
                  : "Belum ada siswa yang terdaftar"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tgl Daftar</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{student.full_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {student.enrollments?.length || 0} enrollment
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="line-clamp-1">{student.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{student.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="line-clamp-2 text-sm">
                          {student.address || "Alamat belum diisi"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getEnrollmentStatusColor(student.enrollments)}
                        >
                          {getEnrollmentStatus(student.enrollments)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(student.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedStudent(student);
                              setDetailOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Lihat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(student)}
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
            <DialogTitle>Detail Siswa</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang siswa
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{selectedStudent.full_name}</h2>
                  <Badge
                    className={getEnrollmentStatusColor(selectedStudent.enrollments)}
                  >
                    {getEnrollmentStatus(selectedStudent.enrollments)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold">Informasi Kontak</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedStudent.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedStudent.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>
                        {selectedStudent.address || "Alamat belum diisi"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Informasi Enrollment</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {selectedStudent.enrollments?.length || 0} total enrollment
                      </span>
                    </div>
                    {selectedStudent.enrollments &&
                      selectedStudent.enrollments.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedStudent.enrollments.map((e) => (
                            <Badge key={e.id} variant="secondary">
                              {e.status}
                            </Badge>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Siswa sejak: {formatDate(selectedStudent.created_at)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Siswa</DialogTitle>
            <DialogDescription>
              Edit informasi siswa
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditStudent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFullName">Nama Lengkap</Label>
              <Input
                id="editFullName"
                value={editingStudent.full_name}
                onChange={(e) => setEditingStudent({ ...editingStudent, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhone">Nomor HP</Label>
              <Input
                id="editPhone"
                value={editingStudent.phone}
                onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAddress">Alamat</Label>
              <Textarea
                id="editAddress"
                value={editingStudent.address}
                onChange={(e) => setEditingStudent({ ...editingStudent, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Lokasi</Label>
              <div className="flex gap-2">
                <Input
                  value={
                    editingStudent.latitude && editingStudent.longitude
                      ? `${editingStudent.latitude.toFixed(6)}, ${editingStudent.longitude?.toFixed(6)}`
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

      {/* Add Student Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Siswa Baru</DialogTitle>
            <DialogDescription>
              Daftar siswa baru secara offline. Akun akan dibuatkan otomatis.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addEmail">Email</Label>
              <Input
                id="addEmail"
                type="email"
                value={addingStudent.email}
                onChange={(e) => setAddingStudent({ ...addingStudent, email: e.target.value })}
                placeholder="siswa@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addName">Nama Lengkap</Label>
              <Input
                id="addName"
                value={addingStudent.full_name}
                onChange={(e) => setAddingStudent({ ...addingStudent, full_name: e.target.value })}
                placeholder="Nama lengkap siswa"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addPhone">Nomor HP</Label>
              <Input
                id="addPhone"
                value={addingStudent.phone}
                onChange={(e) => setAddingStudent({ ...addingStudent, phone: e.target.value })}
                placeholder="0812..."
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={adding}>
                {adding ? "Menambahkan..." : "Tambah Siswa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStudents;