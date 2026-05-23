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
import { toast } from "sonner";
import { AlertCircle, LogOut, Loader2, History, Trash2, GraduationCap, ArrowLeft, Save } from "lucide-react";
import { getSubjects, type Subject } from "@/lib/queries/subjectQueries";
import { AddressPicker } from "@/components/AddressPicker";

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
  province_code?: string;
  regency_code?: string;
  district_code?: string;
  village_code?: string;
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

interface Props {
  isEdit?: boolean;
}

const TutorPendingApproval = ({ isEdit = false }: Props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rejectionHistory, setRejectionHistory] = useState<RejectionHistory[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<Subject[]>([]);

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
        .maybeSingle();

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, phone, address, province_code, regency_code, district_code, village_code")
        .eq("id", session.user.id)
        .single();

      if (tutorDetails?.is_approved && !isEdit) {
        navigate("/tutor");
        return;
      }

      // Parse subjects
      let subjects: string[] = [];
      if (tutorDetails?.subjects) {
        subjects = Array.isArray(tutorDetails.subjects) ? (tutorDetails.subjects as unknown as string[]).map((s) => s) : [];
      }

      // Load subjects from DB
      const subjectsData = await getSubjects();
      setSubjectOptions(subjectsData);

      setFormData({
        full_name: profile?.full_name || "",
        email: profile?.email || "",
        phone: profile?.phone || "",
        address: profile?.address || "",
        province_code: profile?.province_code || undefined,
        regency_code: profile?.regency_code || undefined,
        district_code: profile?.district_code || undefined,
        village_code: profile?.village_code || undefined,
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

      setRejectionHistory((history || []) as RejectionHistory[]);
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

      // Update profiles (address fields)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          address: formData.address,
          province_code: formData.province_code,
          regency_code: formData.regency_code,
          district_code: formData.district_code,
          village_code: formData.village_code,
        })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

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
        } as any)
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
      navigate("/tutor/pending");
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

  if (isEdit) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/tutor/pending")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Data & Resubmit</h1>
        </div>

        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input value={formData.full_name} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={formData.email} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>No HP</Label>
                <Input value={formData.phone} disabled className="bg-muted" />
              </div>
            </div>

            <div className="border-t pt-6">
              <Label className="text-base font-semibold mb-4 block">Alamat Domisili</Label>
              <AddressPicker
                value={{
                  province_code: formData.province_code,
                  regency_code: formData.regency_code,
                  district_code: formData.district_code,
                  village_code: formData.village_code,
                  address: formData.address,
                }}
                onChange={(val) => setFormData(prev => ({
                  ...prev,
                  province_code: val?.province_code,
                  regency_code: val?.regency_code,
                  district_code: val?.district_code,
                  village_code: val?.village_code,
                  address: val?.address || "",
                }))}
              />
            </div>

            <div className="border-t pt-6 space-y-4">
              <Label className="text-base font-semibold block">Keahlian & Pengalaman</Label>
              <div className="space-y-2">
                <Label>Mata Pelajaran yang Diampu</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg">
                  {subjectOptions.map(sub => (
                    <div key={sub.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sub-${sub.id}`}
                        checked={formData.subjects.includes(sub.id)}
                        onCheckedChange={() => toggleSubject(sub.id)}
                      />
                      <label htmlFor={`sub-${sub.id}`} className="text-sm cursor-pointer">{sub.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pengalaman Mengajar</Label>
                <Textarea
                  value={formData.experience}
                  onChange={e => setFormData({...formData, experience: e.target.value})}
                  placeholder="Ceritakan pengalaman mengajar Anda secara singkat..."
                  className="min-h-[120px]"
                />
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <GraduationCap className="h-5 w-5" /> Riwayat Pendidikan
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Universitas</Label>
                  <Input value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} placeholder="Nama Universitas" />
                </div>
                <div className="space-y-2">
                  <Label>Jurusan</Label>
                  <Input value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} placeholder="Contoh: Pendidikan Matematika" />
                </div>
                <div className="space-y-2">
                  <Label>Tahun Lulus</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.graduation_year}
                    onChange={e => setFormData({...formData, graduation_year: e.target.value})}
                    aria-label="Tahun Lulus"
                  >
                    <option value="">Pilih tahun</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>IPK Terakhir</Label>
                  <Input type="number" step="0.01" value={formData.ipk} onChange={e => setFormData({...formData, ipk: e.target.value})} placeholder="Contoh: 3.85" />
                </div>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <Label className="text-base font-semibold">Dokumen Pendukung (Google Drive)</Label>
              <p className="text-xs text-muted-foreground italic">Pastikan link Google Drive sudah diatur ke "Anyone with the link / Siapa saja yang memiliki link".</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Link KTP</Label>
                  <Input value={formData.ktp_link} onChange={e => setFormData({...formData, ktp_link: e.target.value})} placeholder="https://drive.google.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>Link CV / Resume</Label>
                  <Input value={formData.cv_link} onChange={e => setFormData({...formData, cv_link: e.target.value})} placeholder="https://drive.google.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>Sertifikat Tambahan (Opsional)</Label>
                  <div className="flex gap-2">
                    <Input value={newCertLink} onChange={e => setNewCertLink(e.target.value)} placeholder="https://drive.google.com/..." />
                    <Button type="button" variant="outline" onClick={addCertLink}>Tambah</Button>
                  </div>
                  {formData.certificate_links.length > 0 && (
                    <div className="grid gap-2 mt-2">
                      {formData.certificate_links.map((link, i) => (
                        <div key={i} className="flex items-center justify-between text-sm bg-muted p-2 px-3 rounded-md border">
                          <span className="truncate flex-1 mr-2">{link}</span>
                          <button type="button" className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors" onClick={() => removeCertLink(i)} title="Hapus link sertifikat" aria-label="Hapus link sertifikat">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate("/tutor/pending")}>
                Batal
              </Button>
              <Button onClick={handleResubmit} disabled={saving} className="gap-2">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Simpan & Resubmit
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestRejection = rejectionHistory.find(r => r.rejection_reason !== "RESUBMIT");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden border-yellow-200 bg-yellow-50/30">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
              <AlertCircle className="h-10 w-10" />
            </div>
          </div>
          <CardTitle className="text-2xl">Menunggu Persetujuan</CardTitle>
          <p className="text-muted-foreground mt-2">
            Pendaftaran Anda sebagai tutor masih dalam proses peninjauan oleh tim kami.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 text-center pb-8">
          {latestRejection && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-left max-w-2xl mx-auto">
              <div className="flex items-center gap-2 text-red-800 font-bold mb-3">
                <AlertCircle className="h-5 w-5" />
                Alasan Penolakan Terakhir:
              </div>
              <p className="text-sm text-red-700 leading-relaxed whitespace-pre-wrap">
                {latestRejection.rejection_reason}
              </p>
              <div className="mt-4 pt-4 border-t border-red-100 flex justify-between items-center">
                <span className="text-xs text-red-500 font-medium">
                  Ditolak pada: {new Date(latestRejection.rejected_at).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </span>
                <Badge variant="destructive" className="font-semibold">Perlu Perbaikan</Badge>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button className="px-8 h-11 text-base font-semibold" onClick={() => navigate("/tutor/resubmit")}>
              Edit Data & Resubmit
            </Button>
            <Button variant="outline" className="px-8 h-11 text-base" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Card */}
      {rejectionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-primary" /> Riwayat Status Pendaftaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rejectionHistory.map((item) => (
              <div key={item.id} className={`p-4 border rounded-xl transition-colors ${item.resubmitted_at ? "bg-green-50/50 border-green-100" : "bg-red-50/50 border-red-100"}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    {item.rejection_reason === "RESUBMIT" ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none px-3">Resubmit Data</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none px-3">Pendaftaran Ditolak</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {new Date(item.rejected_at).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                </div>
                {item.rejection_reason !== "RESUBMIT" && (
                  <p className="text-sm text-foreground/80 mt-2 line-clamp-2 italic">"{item.rejection_reason}"</p>
                )}
                {item.resubmitted_at && (
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    Telah diajukan kembali pada: {new Date(item.resubmitted_at).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TutorPendingApproval;
