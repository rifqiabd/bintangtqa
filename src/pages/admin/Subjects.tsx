import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, Plus, Pencil, Power, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

const Subjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name");

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error("Error loading subjects:", error);
      toast.error("Gagal memuat mata pelajaran");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setSubjectName(subject.name);
    } else {
      setEditingSubject(null);
      setSubjectName("");
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!subjectName.trim()) {
      toast.error("Nama mata pelajaran harus diisi");
      return;
    }

    setSaving(true);
    try {
      if (editingSubject) {
        const { error } = await supabase
          .from("subjects")
          .update({ name: subjectName.trim(), updated_at: new Date().toISOString() })
          .eq("id", editingSubject.id);

        if (error) throw error;
        toast.success("Mata pelajaran diperbarui");
      } else {
        const { error } = await supabase
          .from("subjects")
          .insert({ name: subjectName.trim() });

        if (error) throw error;
        toast.success("Mata pelajaran ditambahkan");
      }

      setShowDialog(false);
      loadSubjects();
    } catch (error: any) {
      console.error("Error saving subject:", error);
      if (error.message?.includes("duplicate")) {
        toast.error("Nama mata pelajaran sudah ada");
      } else {
        toast.error("Gagal menyimpan mata pelajaran");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (subject: Subject) => {
    try {
      const { error } = await supabase
        .from("subjects")
        .update({ is_active: !subject.is_active, updated_at: new Date().toISOString() })
        .eq("id", subject.id);

      if (error) throw error;
      loadSubjects();
    } catch (error) {
      console.error("Error toggling subject:", error);
      toast.error("Gagal mengubah status");
    }
  };

  const handleDelete = async (subject: Subject) => {
    if (!confirm(`Hapus mata pelajaran "${subject.name}"?`)) return;

    try {
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", subject.id);

      if (error) throw error;
      toast.success("Mata pelajaran dihapus");
      loadSubjects();
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Gagal menghapus mata pelajaran");
    }
  };

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mata Pelajaran</h1>
          <p className="text-muted-foreground">Kelola mata pelajaran yang tersedia</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Mata Pelajaran
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari mata pelajaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Memuat...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Nama Mata Pelajaran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Tidak ada mata pelajaran
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubjects.map((subject, index) => (
                    <TableRow key={subject.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            subject.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {subject.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(subject)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(subject)}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(subject)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subjectName">Nama Mata Pelajaran</Label>
              <Input
                id="subjectName"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Contoh: Matematika"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subjects;