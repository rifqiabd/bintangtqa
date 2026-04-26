import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Search, User, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

interface Tutor {
  id: string;
  full_name: string;
  email: string;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
}

interface Enrollment {
  id: string;
  student_id: string;
  tutor_id: string;
  status: string;
  student?: Student;
}

const Enrol = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [tutorSearch, setTutorSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all tutors
      const { data: tutorRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "tutor");

      if (tutorRoles && tutorRoles.length > 0) {
        const tutorIds = tutorRoles.map(r => r.user_id);
        const { data: tutorData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", tutorIds);
        setTutors(tutorData || []);
      }

      // Load all students
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      if (studentRoles && studentRoles.length > 0) {
        const studentIds = studentRoles.map(r => r.user_id);
        const { data: studentData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", studentIds);
        setStudents(studentData || []);
      }

      // Load all enrollments with student info
      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select("*")
        .eq("status", "active");

      const enrichedEnrollments = (enrollmentData || []).map(e => ({
        ...e,
        student: students.find(s => s.id === e.student_id)
      }));

      setEnrollments(enrollmentData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTutor = (tutor: Tutor) => {
    setSelectedTutor(tutor);
  };

  const getEnrolledStudents = (tutorId: string) => {
    return enrollments
      .filter(e => e.tutor_id === tutorId && e.status === "active")
      .map(e => ({
        ...e,
        student: students.find(s => s.id === e.student_id)
      }))
      .filter(e => e.student);
  };

  const handleUnenroll = async (enrollmentId: string) => {
    if (!confirm("Yakin ingin unenroll siswa ini?")) return;

    try {
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("id", enrollmentId);

      if (error) throw error;
      toast.success("Berhasil mengunenroll siswa");
      loadData();
    } catch (error) {
      console.error("Error unenrolling:", error);
      toast.error("Gagal mengunenroll");
    }
  };

  const handleEnroll = async (studentId: string) => {
    if (!selectedTutor) {
      toast.error("Pilih tutor terlebih dahulu");
      return;
    }

    // Check if already enrolled
    const existing = enrollments.find(
      e => e.tutor_id === selectedTutor.id && e.student_id === studentId && e.status === "active"
    );

    if (existing) {
      toast.error("Siswa ini sudah terdaftar dengan tutor ini");
      return;
    }

    try {
      const { error } = await supabase.from("enrollments").insert({
        student_id: studentId,
        tutor_id: selectedTutor.id,
        status: "active",
      });

      if (error) throw error;
      toast.success("Berhasil mendaftarkan siswa ke tutor");
      loadData();
      setSelectedTutor(null);
    } catch (error) {
      console.error("Error enrolling:", error);
      toast.error("Gagal mendaftarkan siswa");
    }
  };

  const filteredTutors = tutors.filter(t =>
    t.full_name.toLowerCase().includes(tutorSearch.toLowerCase()) ||
    t.email.toLowerCase().includes(tutorSearch.toLowerCase())
  );

  const availableStudents = selectedTutor
    ? students.filter(s => 
        !enrollments.some(e => 
          e.tutor_id === selectedTutor.id && 
          e.student_id === s.id && 
          e.status === "active"
        ) &&
        (s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
         s.email.toLowerCase().includes(studentSearch.toLowerCase()))
      )
    : [];

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
        <h1 className="text-2xl lg:text-3xl font-bold">Enrol Siswa</h1>
        <p className="text-muted-foreground">Kelola enrolment tutor dan siswa</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tutor Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Tutor
              </CardTitle>
              <Input
                placeholder="Cari tutor..."
                value={tutorSearch}
                onChange={(e) => setTutorSearch(e.target.value)}
                className="w-48"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Siswa Terdaftar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTutors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      Tidak ada tutor
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTutors.map((tutor) => (
                    <TableRow 
                      key={tutor.id}
                      className={selectedTutor?.id === tutor.id ? "bg-primary/10" : ""}
                      onClick={() => handleSelectTutor(tutor)}
                    >
                      <TableCell className="font-medium">{tutor.full_name}</TableCell>
                      <TableCell>{tutor.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getEnrolledStudents(tutor.id).length} siswa
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Student Table - based on selected tutor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {selectedTutor ? (
                  <>Siswa dari {selectedTutor.full_name}</>
                ) : (
                  <>Pilih tutor untuk melihat siswa</>
                )}
              </CardTitle>
              {selectedTutor && (
                <Input
                  placeholder="Cari siswa..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-48"
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedTutor ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Registered students */}
                  {getEnrolledStudents(selectedTutor.id).map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.student?.full_name}</TableCell>
                      <TableCell>{e.student?.email}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUnenroll(e.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Unenroll
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Available students to enroll */}
                  {availableStudents.length === 0 && getEnrolledStudents(selectedTutor.id).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        Semua siswa sudah terdaftar
                      </TableCell>
                    </TableRow>
                  ) : (
                    availableStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleEnroll(student.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Enroll
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Klik tutor di tabel sebelah untuk melihat siswa
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Enrol;