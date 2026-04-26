import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, User, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

import { TutorApprovalDetailModal, TutorRejectModal } from "@/components/admin/modals";
import { loadPendingTutors, approveTutor, rejectTutor } from "@/lib/queries/tutorApprovalQueries";
import type { PendingTutor } from "@/lib/types/tutorApproval";
import { formatSubjectLabel } from "@/lib/constants/subjects";

const AdminTutorApproval = () => {
  const [tutors, setTutors] = useState<PendingTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTutor, setSelectedTutor] = useState<PendingTutor | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await loadPendingTutors();
      setTutors(data);
    } catch (error) {
      console.error("Error loading tutors:", error);
      toast.error("Gagal memuat data tutor");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tutor: PendingTutor) => {
    setProcessing(true);
    try {
      await approveTutor(tutor.id);
      toast.success("Tutor berhasil diapprove");
      setDetailOpen(false);
      loadData();
    } catch (error) {
      console.error("Error approving tutor:", error);
      toast.error("Gagal mengapprove tutor");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedTutor) return;
    setProcessing(true);
    try {
      await rejectTutor(selectedTutor.id, reason, {
        subjects: selectedTutor.subjects,
        experience: selectedTutor.experience,
        ktp_link: selectedTutor.ktp_link,
        cv_link: selectedTutor.cv_link,
        certificate_links: selectedTutor.certificate_links,
        university: selectedTutor.university,
        major: selectedTutor.major,
        graduation_year: selectedTutor.graduation_year,
        ipk: selectedTutor.ipk,
      });
      toast.success("Tutor ditolak");
      setRejectOpen(false);
      setDetailOpen(false);
      loadData();
    } catch (error) {
      console.error("Error rejecting tutor:", error);
      toast.error("Gagal menolak tutor");
    } finally {
      setProcessing(false);
    }
  };

  const filteredTutors = tutors.filter(
    (tutor) =>
      tutor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.phone.includes(searchQuery)
  );

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
            <h1 className="text-2xl lg:text-3xl font-bold">Persetujuan Tutor</h1>
            <p className="text-muted-foreground">Kelola pengajuan tutor baru</p>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {filteredTutors.length} pending
          </Badge>
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
              <User className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak Ada Tutor Pending</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? "Tidak ada tutor yang sesuai" : "Tidak ada pengajuan tutor baru"}
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
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTutors.map((tutor) => (
                    <TableRow key={tutor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{tutor.full_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {tutor.university || "Universitas belum diisi"}
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
                          {(tutor.subjects || []).slice(0, 3).map((subject) => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                              {formatSubjectLabel(subject)}
                            </Badge>
                          ))}
                          {(tutor.subjects?.length || 0) > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(tutor.subjects?.length || 0) - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTutor(tutor);
                            setDetailOpen(true);
                          }}
                        >
                          Lihat Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TutorApprovalDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        tutor={selectedTutor}
        onApprove={handleApprove}
        onReject={(tutor) => {
          setSelectedTutor(tutor);
          setRejectOpen(true);
        }}
        loading={processing}
      />

      <TutorRejectModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={handleReject}
        loading={processing}
      />
    </div>
  );
};

export default AdminTutorApproval;
