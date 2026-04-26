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
import type { AddingStudent } from "@/lib/types/student";

interface StudentAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: AddingStudent;
  setFormData: React.Dispatch<React.SetStateAction<AddingStudent>>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function StudentAddModal({
  open,
  onOpenChange,
  formData,
  setFormData,
  loading,
  onSubmit,
}: StudentAddModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Siswa Baru</DialogTitle>
          <DialogDescription>
            Daftar siswa baru secara offline. Akun akan dibuatkan otomatis.
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
              placeholder="siswa@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addName">Nama Lengkap</Label>
            <Input
              id="addName"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Nama lengkap siswa"
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
              {loading ? "Menambahkan..." : "Tambah Siswa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}