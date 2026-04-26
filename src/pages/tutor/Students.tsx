import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, MapPin, BookOpen, User, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Enrollment {
  id: string;
  student_id: string;
  subject: string;
  status: string;
  created_at: string;
  student: {
    full_name: string;
    email: string;
    phone: string;
    address: string;
  };
}

const TutorStudents = () => {
  const [students, setStudents] = useState<Enrollment[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          student_id,
          subject,
          status,
          created_at,
          student:profiles!enrollments_student_id_fkey(
            full_name,
            email,
            phone,
            address
          )
        `)
        .eq("tutor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const enrollments = data || [];
      setStudents(enrollments.filter(e => e.status === "active"));
      setPendingRequests(enrollments.filter(e => e.status === "pending"));
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Gagal memuat data siswa");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId: string) => {
    setActionLoading(enrollmentId);
    try {
      const { error } = await supabase
        .from("enrollments")
        .update({ status: "active" })
        .eq("id", enrollmentId);

      if (error) throw error;
      toast.success("Pendaftaran disetujui!");
      loadStudents();
    } catch (error) {
      console.error("Error approving:", error);
      toast.error("Gagal menyetujui pendaftaran");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (enrollmentId: string) => {
    setActionLoading(enrollmentId);
    try {
      const { error } = await supabase
        .from("enrollments")
        .update({ status: "rejected" })
        .eq("id", enrollmentId);

      if (error) throw error;
      toast.success("Pendaftaran ditolak");
      loadStudents();
    } catch (error) {
      console.error("Error rejecting:", error);
      toast.error("Gagal menolak pendaftaran");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Aktif";
      case "pending": return "Menunggu";
      case "completed": return "Selesai";
      case "cancelled": return "Dibatalkan";
      case "rejected": return "Ditolak";
      default: return status;
    }
  };

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
        <h1 className="text-2xl lg:text-3xl font-bold">Siswa Saya</h1>
        <p className="text-muted-foreground">Kelola siswa yang mendaftar ke Anda</p>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Siswa Aktif ({students.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Permintaan Baru
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {students.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Belum Ada Siswa</h3>
                <p className="text-muted-foreground text-center">
                  Belum ada siswa yang aktif
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {students.map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{enrollment.student.full_name}</CardTitle>
                          <Badge className={getStatusColor(enrollment.status)} variant="secondary">
                            {getStatusText(enrollment.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{enrollment.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{enrollment.student.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{enrollment.student.email}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{enrollment.student.address || "Alamat tidak tersedia"}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tidak Ada Permintaan</h3>
                <p className="text-muted-foreground text-center">
                  Tidak ada siswa yang menunggu persetujuan
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingRequests.map((enrollment) => (
                <Card key={enrollment.id} className="border-yellow-200 bg-yellow-50/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{enrollment.student.full_name}</CardTitle>
                          <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
                            Menunggu Persetujuan
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{enrollment.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{enrollment.student.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{enrollment.student.email}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{enrollment.student.address || "Alamat tidak tersedia"}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(enrollment.id)}
                        disabled={actionLoading === enrollment.id}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Setuju
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(enrollment.id)}
                        disabled={actionLoading === enrollment.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Tolak
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TutorStudents;