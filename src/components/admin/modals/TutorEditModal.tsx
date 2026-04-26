import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import type { Tutor, EditingTutor } from "@/lib/types/tutor";
import { getSubjects, type Subject } from "@/lib/queries/subjectQueries";

interface TutorEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutor: Tutor | null;
  editingData: EditingTutor;
  setEditingData: React.Dispatch<React.SetStateAction<EditingTutor>>;
  saving: boolean;
  onSave: (e: React.FormEvent) => void;
  onGetLocation: () => void;
}

export function TutorEditModal({
  open,
  onOpenChange,
  tutor,
  editingData,
  setEditingData,
  saving,
  onSave,
  onGetLocation,
}: TutorEditModalProps) {
  const [subjectOptions, setSubjectOptions] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && subjectOptions.length === 0) {
      getSubjects()
        .then(setSubjectOptions)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open]);

  const toggleSubject = (subjectId: string) => {
    setEditingData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter((s) => s !== subjectId)
        : [...prev.subjects, subjectId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Tutor</DialogTitle>
          <DialogDescription>
            Edit informasi tutor
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editFullName">Nama Lengkap</Label>
            <Input
              id="editFullName"
              value={editingData.full_name}
              onChange={(e) => setEditingData({ ...editingData, full_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editPhone">Nomor HP</Label>
            <Input
              id="editPhone"
              value={editingData.phone}
              onChange={(e) => setEditingData({ ...editingData, phone: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editAddress">Alamat</Label>
            <Textarea
              id="editAddress"
              value={editingData.address}
              onChange={(e) => setEditingData({ ...editingData, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Lokasi</Label>
            <div className="flex gap-2">
              <Input
                value={
                  editingData.latitude && editingData.longitude
                    ? `${editingData.latitude.toFixed(6)}, ${editingData.longitude?.toFixed(6)}`
                    : "Belum diset"
                }
                disabled
                className="bg-muted"
              />
              <Button type="button" variant="outline" onClick={onGetLocation}>
                <MapPin className="h-4 w-4 mr-2" />
                Dapatkan Lokasi
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mata Pelajaran</Label>
            {loading ? (
              <p className="text-sm text-muted-foreground">Memuat...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {subjectOptions.map((subject) => (
                  <div key={subject.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${subject.id}`}
                      checked={editingData.subjects.includes(subject.id)}
                      onCheckedChange={() => toggleSubject(subject.id)}
                    />
                    <label htmlFor={`edit-${subject.id}`} className="text-sm">
                      {subject.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="editExperience">Pengalaman</Label>
            <Textarea
              id="editExperience"
              value={editingData.experience}
              onChange={(e) => setEditingData({ ...editingData, experience: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editRate">Tarif per Jam (Rp)</Label>
            <Input
              id="editRate"
              type="number"
              value={editingData.hourly_rate}
              onChange={(e) => setEditingData({ ...editingData, hourly_rate: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="editAvailable"
              checked={editingData.is_available}
              onCheckedChange={(checked) => setEditingData({ ...editingData, is_available: !!checked })}
            />
            <label htmlFor="editAvailable">Tersedia untuk mengajar</label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}