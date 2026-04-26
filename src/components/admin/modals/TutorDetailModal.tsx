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
import { Mail, Phone, MapPin, BookOpen, Users, Power } from "lucide-react";
import type { Tutor } from "@/lib/types/tutor";
import { formatSubjectLabel } from "@/lib/constants/subjects";

interface TutorDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutor: Tutor | null;
  onToggleStatus: (tutor: Tutor) => void;
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function TutorDetailModal({ open, onOpenChange, tutor, onToggleStatus }: TutorDetailModalProps) {
  if (!tutor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Tutor</DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang tutor
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{tutor.full_name}</h2>
              <Badge
                className={
                  tutor.tutor_details?.is_available
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                }
              >
                {tutor.tutor_details?.is_available ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold">Informasi Kontak</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{tutor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{tutor.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{tutor.address || "Alamat belum diisi"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Informasi Tutor</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {tutor.tutor_details?.subjects?.map((subject) => (
                      <Badge key={subject} variant="secondary">
                        {formatSubjectLabel(subject)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Experience:</span>
                  <span>
                    {tutor.tutor_details?.experience || "Belum ada"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Tarif:</span>
                  <span>
                    {tutor.tutor_details?.hourly_rate
                      ? `Rp ${tutor.tutor_details.hourly_rate.toLocaleString("id-ID")}/jam`
                      : "Belum ditentukan"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Tutor sejak: {formatDate(tutor.created_at)}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button
            variant={tutor.tutor_details?.is_available ? "destructive" : "default"}
            onClick={() => {
              onToggleStatus(tutor);
              onOpenChange(false);
            }}
          >
            <Power className="h-4 w-4 mr-2" />
            {tutor.tutor_details?.is_available ? "Nonaktifkan" : "Aktifkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}