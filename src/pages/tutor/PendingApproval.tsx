import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertCircle, LogOut, Loader2, FileText, History, ExternalLink, Plus, Trash2, GraduationCap } from "lucide-react";
import { getSubjects, type Subject } from "@/lib/queries/subjectQueries";

interface RejectionHistory {
  id: string;
  rejection_reason: string;
  rejected_at: string;
  resubmitted_at: string | null;
  updated_data: {
    subjects?: string[];
    experience?: string;
    university?: string;
    major?: string;
    graduation_year?: number;
    ipk?: number;
    ktp_link?: string;
    cv_link?: string;
    certificate_links?: string[];
  } | null;
}

interface TutorData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  subjects: string[];
  experience: string;
  university: string;
  major: string;
  graduation_year: string;
  ipk: string;
  ktp_link: string;
  cv_link: string;
  certificate_links: string[];
}

const TutorPendingApproval = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rejectionHistory, setRejectionHistory] = useState<RejectionHistory[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<Subject[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState<TutorData>({
    full_name: "", email: "", phone: "", address: "",
    subjects: [], experience: "",
    university: "", major: "", graduation_year: "", ipk: "",
    ktp_link: "", cv_link: "", certificate_links: [],
  });
  const [newCertLink, setNewCertLink] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: tutorDetails } = await supabase
        .from("tutor_details")
        .select("*")
        .eq("tutor_id", session.user.id)
        .single();

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, phone, address")
        .eq("id", session.user.id)
        .single();

      if (tutorDetails?.is_approved) {
        navigate("/tutor");
        return;
      }

      // Parse subjects
      let subjects: string[] = [];
      if (tutorDetails?.subjects) {
        try {
          subjects = JSON.parse(tutorDetails.subjects);
        } catch { subjects = []; }
      }

      // Load subjects from DB
      const subjectsData = await getSubjects();
      setSubjectOptions(subjectsData);

      setFormData({
        full_name: profile?.full_name || "",
        email: profile?.email || "",
        phone: profile?.phone || "",
        address: profile?.address || "",
        subjects,
        experience: tutorDetails?.experience || "",
        university: tutorDetails?.university || "",
        major: tutorDetails?.major || "",
        graduation_year: tutorDetails?.graduation_year?.toString() || "",
        ipk: tutorDetails?.ipk?.toString() || "",
        ktp_link: tutorDetails?.ktp_link || "",
        cv_link: tutorDetails?.cv_link || "",
        certificate_links: tutorDetails?.certificate_links || [],
      });

      // Load history
      const { data: history } = await supabase
        .from("tutor_rejection_history")
        .select("*")
        .eq("tutor_id", session.user.id)
        .order("rejected_at", { ascending: false });

      setRejectionHistory(history || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Update tutor_details
      const { error: updateError } = await supabase
        .from("tutor_details")
        .update({
          subjects: formData.subjects as any,
          experience: formData.experience,
          university: formData.university,
          major: formData.major,
          graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
          ipk: formData.ipk ? parseFloat(formData.ipk) : null,
          ktp_link: formData.ktp_link || null,
          cv_link: formData.cv_link || null,
          certificate_links: formData.certificate_links,
          is_approved: false,
          rejection_reason: null,
        })
        .eq("tutor_id", session.user.id);

      if (updateError) throw updateError;

      // Create new history record for resubmit
      await supabase.from("tutor_rejection_history").insert({
        tutor_id: session.user.id,
        rejection_reason: "RESUBMIT",
        rejected_at: new Date().toISOString(),
        resubmitted_at: new Date().toISOString(),
        updated_data: {
          subjects: formData.subjects,
          experience: formData.experience,
          university: formData.university,
          major: formData.major,
          graduation_year: formData.graduation_year,
          ipk: formData.ipk,
          ktp_link: formData.ktp_link,
          cv_link: formData.cv_link,
          certificate_links: formData.certificate_links,
        },
      });

      toast.success("Data berhasil diperbarui! Menunggu persetujuan ulang.");
      setEditOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const toggleSubject = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(id)
        ? prev.subjects.filter(s => s !== id)
        : [...prev.subjects, id],
    }));
  };

  const addCertLink = () => {
    if (newCertLink.trim() && newCertLink.includes("drive.google.com")) {
      setFormData(prev => ({
        ...prev,
        certificate_links: [...prev.certificate_links, newCertLink.trim()],
      }));
      setNewCertLink("");
    }
  };

  const removeCertLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certificate_links: prev.certificate_links.filter((_, i) => i !== index),
    }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Berhasil logout");
    navigate("/auth");
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const latestRejection = rejectionHistory.find(r => r.rejection_reason !== "RESUBMIT");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl">Menunggu Persetujuan</CardTitle>
            <p className="text-muted-foreground">
              Pendaftaran Anda sebagai tutor masih dalam peninjauan.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestRejection && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Alasan Penolakan Terakhir:</h3>
                <p className="text-sm text-red-700 whitespace-pre-wrap">{latestRejection.rejection_reason}</p>
                <p className="text-xs text-red-500 mt-2">
                  Ditolak: {new Date(latestRejection.rejected_at).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </p>
              </div>
            )}

            <Button className="w-full" onClick={() => setEditOpen(true)}>
              Edit Data & Resubmit
            </Button>

            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </CardContent>
        </Card>

        {/* History Card */}
        {rejectionHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" /> Riwayat Penolakan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rejectionHistory.map((item, i) => (
                <div key={item.id} className={`p-3 border rounded-lg ${item.resubmitted_at ? "bg-green-50" : "bg-red-50"}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      {item.rejection_reason === "RESUBMIT" ? (
                        <Badge className="bg-green-100 text-green-800">Resubmit</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Ditolak</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.rejected_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  {item.rejection_reason !== "RESUBMIT" && (
                    <p className="text-sm mt-2">{item.rejection_reason}</p>
                  )}
                  {item.resubmitted_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Di-resubmit: {new Date(item.resubmitted_at).toLocaleDateString("id-ID")}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data & Resubmit</DialogTitle>
            <DialogDescription>
              Perbaiki data Anda dan submit ulang untuk ditinjau oleh admin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Nama Lengkap</Label>
                <Input value={formData.full_name} disabled />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={formData.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>No HP</Label>
                <Input value={formData.phone} disabled />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Alamat</Label>
                <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mata Pelajaran</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {subjectOptions.map(sub => (
                  <div key={sub.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.subjects.includes(sub.id)}
                      onCheckedChange={() => toggleSubject(sub.id)}
                    />
                    <label className="text-sm">{sub.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pengalaman Mengajar</Label>
              <Textarea
                value={formData.experience}
                onChange={e => setFormData({...formData, experience: e.target.value})}
                placeholder="Ceritakan pengalaman mengajar..."
              />
            </div>

            <div className="border-t pt-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Riwayat Pendidikan
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="space-y-2 col-span-2">
                  <Label>Universitas</Label>
                  <Input value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Jurusan</Label>
                  <Input value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Tahun Lulus</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.graduation_year}
                    onChange={e => setFormData({...formData, graduation_year: e.target.value})}
                  >
                    <option value="">Pilih tahun</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>IPK</Label>
                  <Input type="number" step="0.01" value={formData.ipk} onChange={e => setFormData({...formData, ipk: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-base font-semibold">Dokumen (Google Drive Links)</Label>
              <div className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Label>KTP</Label>
                  <Input value={formData.ktp_link} onChange={e => setFormData({...formData, ktp_link: e.target.value})} placeholder="https://drive.google.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>CV/Resume</Label>
                  <Input value={formData.cv_link} onChange={e => setFormData({...formData, cv_link: e.target.value})} placeholder="https://drive.google.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>Sertifikat (Opsional)</Label>
                  <div className="flex gap-2">
                    <Input value={newCertLink} onChange={e => setNewCertLink(e.target.value)} placeholder="https://drive.google.com/..." />
                    <Button type="button" variant="outline" onClick={addCertLink}>Tambah</Button>
                  </div>
                  {formData.certificate_links.length > 0 && (
                    <div className="space-y-1">
                      {formData.certificate_links.map((link, i) => (
                        <div key={i} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                          <span className="truncate">{link}</span>
                          <button type="button" className="text-destructive" onClick={() => removeCertLink(i)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button onClick={handleResubmit} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan & Resubmit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TutorPendingApproval;