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
import { Search, Users, Mail, Phone, Eye, Power, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { TutorDetailModal, TutorEditModal, TutorAddModal } from "@/components/admin/modals";
import { loadTutors, toggleTutorStatus as toggleStatus, addTutor, editTutor } from "@/lib/queries/tutorQueries";
import type { Tutor, EditingTutor, AddingTutor } from "@/lib/types/tutor";
import { createEmptyEditingTutor, createEmptyAddingTutor } from "@/lib/types/tutor";
import { formatSubjectLabel } from "@/lib/constants/subjects";

const AdminTutors = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<EditingTutor>(createEmptyEditingTutor());
  const [savingEdit, setSavingEdit] = useState(false);
  
  const [addOpen, setAddOpen] = useState(false);
  const [addingTutor, setAddingTutor] = useState<AddingTutor>(createEmptyAddingTutor());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await loadTutors();
      setTutors(data);
    } catch (error) {
      console.error("Error loading tutors:", error);
      toast.error("Gagal memuat data tutor");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (tutor: Tutor) => {
    try {
      const newStatus = await toggleStatus(tutor);
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
      const tempPassword = await addTutor(addingTutor);
      toast.success("Tutor berhasil ditambahkan! Password: " + tempPassword);
      setAddOpen(false);
      setAddingTutor(createEmptyAddingTutor());
      loadData();
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
      await editTutor(selectedTutor.id, editingTutor);
      toast.success("Tutor berhasil diperbarui");
      setEditOpen(false);
      loadData();
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
                    <TableHead>Siswa</TableHead>
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
                            <span key={subject} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded">
                              {formatSubjectLabel(subject)}
                            </span>
                          ))}
                          {(tutor.tutor_details?.subjects?.length || 0) > 3 && (
                            <span className="px-2 py-0.5 border text-xs rounded">
                              +{(tutor.tutor_details?.subjects?.length || 0) - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(tutor.enrollments || []).length === 0 ? (
                          <span className="text-sm text-muted-foreground">-</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {(tutor.enrollments || []).slice(0, 2).map((e: any) => (
                              <div key={e.id} className="text-xs whitespace-nowrap">
                                <span className="font-medium">{e.student_name}</span>
                                <span className="text-muted-foreground ml-1">({formatSubjectLabel(e.subject_name)})</span>
                              </div>
                            ))}
                            {(tutor.enrollments?.length || 0) > 2 && (
                              <span className="text-[10px] text-muted-foreground italic">
                                +{(tutor.enrollments?.length || 0) - 2} siswa lainnya
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            tutor.tutor_details?.is_available
                              ? "px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              : "px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                          }
                        >
                          {tutor.tutor_details?.is_available ? "Aktif" : "Nonaktif"}
                        </span>
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
                            variant={tutor.tutor_details?.is_available ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleToggleStatus(tutor)}
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

      <TutorDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        tutor={selectedTutor}
        onToggleStatus={handleToggleStatus}
      />

      <TutorEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        tutor={selectedTutor}
        editingData={editingTutor}
        setEditingData={setEditingTutor}
        saving={savingEdit}
        onSave={handleEditTutor}
        onGetLocation={getCurrentLocation}
      />

      <TutorAddModal
        open={addOpen}
        onOpenChange={setAddOpen}
        formData={addingTutor}
        setFormData={setAddingTutor}
        loading={adding}
        onSubmit={handleAddTutor}
      />
    </div>
  );
};

export default AdminTutors;
