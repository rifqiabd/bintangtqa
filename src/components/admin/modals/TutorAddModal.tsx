import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AddingTutor } from "@/lib/types/tutor";

interface TutorAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: AddingTutor;
  setFormData: React.Dispatch<React.SetStateAction<AddingTutor>>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function TutorAddModal({
  open,
  onOpenChange,
  formData,
  setFormData,
  loading,
  onSubmit,
}: TutorAddModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Tutor Baru</DialogTitle>
          <DialogDescription>
            Daftar tutor baru secara offline. Akun akan dibuatkan otomatis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="addEmail">Email</Label>
            <Input
              id="addEmail"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tutor@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addName">Nama Lengkap</Label>
            <Input
              id="addName"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Nama lengkap tutor"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addPhone">Nomor HP</Label>
            <Input
              id="addPhone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0812..."
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menambahkan..." : "Tambah Tutor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}