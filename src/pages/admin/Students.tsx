import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, User, Mail, Phone, Eye, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { StudentDetailModal, StudentEditModal, StudentAddModal } from "@/components/admin/modals";
import { loadStudents, addStudent, editStudent } from "@/lib/queries/studentQueries";
import type { Student, EditingStudent, AddingStudent } from "@/lib/types/student";
import { createEmptyEditingStudent, createEmptyAddingStudent } from "@/lib/types/student";
import { formatSubjectLabel } from "@/lib/constants/subjects";

const AdminStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<EditingStudent>(createEmptyEditingStudent());
  const [savingEdit, setSavingEdit] = useState(false);
  
  const [addOpen, setAddOpen] = useState(false);
  const [addingStudent, setAddingStudent] = useState<AddingStudent>(createEmptyAddingStudent());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await loadStudents();
      setStudents(data);
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
      const tempPassword = await addStudent(addingStudent);
      toast.success("Siswa berhasil ditambahkan! Password: " + tempPassword);
      setAddOpen(false);
      setAddingStudent(createEmptyAddingStudent());
      loadData();
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
      await editStudent(selectedStudent.id, editingStudent);
      toast.success("Siswa berhasil diperbarui");
      setEditOpen(false);
      loadData();
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
            <CardTitle className="text-lg">Daftar Siswa ({filteredStudents.length})</CardTitle>
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
                    <TableHead>Tutor</TableHead>
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
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {student.address || "Alamat belum diisi"}
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
                        {(student.enrollments || []).length === 0 ? (
                          <span className="text-sm text-muted-foreground">-</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {student.enrollments?.slice(0, 2).map((e: any) => (
                              <div key={e.id} className="text-xs whitespace-nowrap">
                                <span className="font-medium">{e.tutor_name}</span>
                                <span className="text-muted-foreground ml-1">({formatSubjectLabel(e.subject_name)})</span>
                              </div>
                            ))}
                            {(student.enrollments?.length || 0) > 2 && (
                              <span className="text-[10px] text-muted-foreground italic">
                                +{(student.enrollments?.length || 0) - 2} tutor lainnya
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(student.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
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

      <StudentDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        student={selectedStudent}
      />

      <StudentEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        student={selectedStudent}
        editingData={editingStudent}
        setEditingData={setEditingStudent}
        saving={savingEdit}
        onSave={handleEditStudent}
        onGetLocation={getCurrentLocation}
      />

      <StudentAddModal
        open={addOpen}
        onOpenChange={setAddOpen}
        formData={addingStudent}
        setFormData={setAddingStudent}
        loading={adding}
        onSubmit={handleAddStudent}
      />
    </div>
  );
};

export default AdminStudents;