import { useEffect, useState } from "react";
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
import { Mail, Phone, MapPin, GraduationCap, FileText, ExternalLink, User, History, Check, X } from "lucide-react";
import type { PendingTutor, ApprovalHistory } from "@/lib/types/tutorApproval";
import { getApprovalHistory } from "@/lib/queries/tutorApprovalQueries";
import { formatSubjectLabel } from "@/lib/constants/subjects";

interface TutorApprovalDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutor: PendingTutor | null;
  onApprove: (tutor: PendingTutor) => void;
  onReject: (tutor: PendingTutor) => void;
  loading?: boolean;
}

export function TutorApprovalDetailModal({
  open,
  onOpenChange,
  tutor,
  onApprove,
  onReject,
  loading,
}: TutorApprovalDetailModalProps) {
  const [history, setHistory] = useState<ApprovalHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (open && tutor?.user_id) {
      loadHistory();
    }
  }, [open, tutor?.user_id]);

  const loadHistory = async () => {
    if (!tutor?.user_id) return;
    setLoadingHistory(true);
    try {
      const data = await getApprovalHistory(tutor.user_id);
      setHistory(data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!tutor) return null;

  const openLink = (url: string) => window.open(url, "_blank");
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Tutor</DialogTitle>
          <DialogDescription>Informasi lengkap pengajuan tutor</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{tutor.full_name}</h2>
              <Badge className="bg-yellow-100 text-yellow-800">Menunggu Persetujuan</Badge>
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
              <h3 className="font-semibold">Mata Pelajaran</h3>
              <div className="flex flex-wrap gap-1">
                {(tutor.subjects || []).map((subject) => (
                  <Badge key={subject} variant="secondary">{formatSubjectLabel(subject)}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Riwayat Pendidikan
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Universitas:</span>
                <span className="ml-2">{tutor.university || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Jurusan:</span>
                <span className="ml-2">{tutor.major || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tahun Lulus:</span>
                <span className="ml-2">{tutor.graduation_year || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">IPK:</span>
                <span className="ml-2">{tutor.ipk?.toFixed(2) || "-"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Pengalaman Mengajar</h3>
            <p className="text-sm whitespace-pre-wrap">{tutor.experience || "Belum ada"}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" /> Dokumen Persyaratan
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">KTP</p>
                  <p className="text-sm text-muted-foreground">{tutor.ktp_link || "-"}</p>
                </div>
                {tutor.ktp_link && (
                  <Button size="sm" variant="outline" onClick={() => openLink(tutor.ktp_link!)}>
                    <ExternalLink className="h-4 w-4 mr-1" /> Buka
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">CV/Resume</p>
                  <p className="text-sm text-muted-foreground">{tutor.cv_link || "-"}</p>
                </div>
                {tutor.cv_link && (
                  <Button size="sm" variant="outline" onClick={() => openLink(tutor.cv_link!)}>
                    <ExternalLink className="h-4 w-4 mr-1" /> Buka
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Tutor sejak: {formatDate(tutor.created_at)}
          </div>

          {/* History Section */}
          {history.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <History className="h-4 w-4" /> Riwayat Persetujuan
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {history.map((item, i) => (
                  <div 
                    key={i} 
                    className={`p-2 rounded text-sm ${
                      item.notes?.includes("DISETUJUI") 
                        ? "bg-green-50 border border-green-200" 
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={item.notes?.includes("DISETUJUI") ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                        {item.notes}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.approved_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
          <Button variant="destructive" onClick={() => onReject(tutor)} disabled={loading}>
            <X className="h-4 w-4 mr-2" /> Tolak
          </Button>
          <Button onClick={() => onApprove(tutor)} disabled={loading}>
            <Check className="h-4 w-4 mr-2" /> Setuju
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
