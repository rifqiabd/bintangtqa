import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import type { Student, EditingStudent } from "@/lib/types/student";

interface StudentEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  editingData: EditingStudent;
  setEditingData: React.Dispatch<React.SetStateAction<EditingStudent>>;
  saving: boolean;
  onSave: (e: React.FormEvent) => void;
  onGetLocation: () => void;
}

export function StudentEditModal({
  open,
  onOpenChange,
  student,
  editingData,
  setEditingData,
  saving,
  onSave,
  onGetLocation,
}: StudentEditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Siswa</DialogTitle>
          <DialogDescription>
            Edit informasi siswa
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