import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Phone, MapPin, GraduationCap, User } from "lucide-react";
import type { Student } from "@/lib/types/student";
import { formatSubjectLabel } from "@/lib/constants/subjects";

interface StudentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function StudentDetailModal({ open, onOpenChange, student }: StudentDetailModalProps) {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Siswa</DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang siswa
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{student.full_name}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold">Informasi Kontak</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{student.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{student.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{student.address || "Alamat belum diisi"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Tutor</h3>
              <div className="space-y-2">
                {(student.enrollments || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada tutor</p>
                ) : (
                  student.enrollments?.map((enrollment: any) => (
                    <div key={enrollment.id} className="flex flex-col p-2 border rounded gap-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{enrollment.tutor_name}</span>
                        <span className="text-xs capitalize px-2 py-0.5 bg-secondary rounded">{enrollment.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {formatSubjectLabel(enrollment.subject_name)}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Siswa sejak: {formatDate(student.created_at)}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}