import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, BookOpen, User, Search } from "lucide-react";
import { toast } from "sonner";

const parseSubjects = (subjects: any): string[] => {
  if (Array.isArray(subjects)) return subjects;
  if (typeof subjects === 'string') {
    try {
      return JSON.parse(subjects);
    } catch {
      return subjects.split(',').map((s: string) => s.trim());
    }
  }
  return [];
};

interface Student {
  id: string;
  full_name: string;
  email: string;
}

interface Tutor {
  id: string;
  full_name: string;
  subjects: string[];
}

interface Subject {
  id: string;
  name: string;
}

const Enrol = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTutor, setSelectedTutor] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  
  const [studentSearch, setStudentSearch] = useState("");
  const [tutorSearch, setTutorSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load students
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

      // Load tutors
      const { data: tutorRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "tutor");

      if (tutorRoles && tutorRoles.length > 0) {
        const tutorIds = tutorRoles.map(r => r.user_id);
        
        const { data: tutorDetails } = await supabase
          .from("tutor_details")
          .select("tutor_id, subjects")
          .in("tutor_id", tutorIds);

        const { data: tutorProfiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", tutorIds);

        const merged = tutorDetails?.map(td => {
          const profile = tutorProfiles?.find(p => p.id === td.tutor_id);
          return {
            id: td.tutor_id,
            full_name: profile?.full_name || "Unknown",
            subjects: parseSubjects(td.subjects),
          };
        }) || [];
        setTutors(merged);
      }

      // Load subjects
      const { data: subjectData } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      setSubjects(subjectData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrol = async () => {
    if (!selectedStudent || !selectedTutor || !selectedSubject) {
      toast.error("Mohon lengkapi semua data");
      return;
    }

    setEnrolling(true);
    try {
      // Check if already enrolled
      const { data: existing } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", selectedStudent)
        .eq("tutor_id", selectedTutor)
        .single();

      if (existing) {
        toast.error("Siswa ini sudah terdaftar dengan tutor ini");
        return;
      }

      const { error } = await supabase.from("enrollments").insert({
        student_id: selectedStudent,
        tutor_id: selectedTutor,
        subject: selectedSubject,
        status: "active",
      });

      if (error) throw error;
      toast.success("Berhasil mendaftarkan siswa ke tutor");
      
      // Reset form
      setSelectedStudent("");
      setSelectedTutor("");
      setSelectedSubject("");
    } catch (error) {
      console.error("Error enrolling:", error);
      toast.error("Gagal mendaftarkan siswa");
    } finally {
      setEnrolling(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredTutors = tutors.filter(t =>
    t.full_name.toLowerCase().includes(tutorSearch.toLowerCase())
  );

  const getTutorSubjects = (tutorId: string) => {
    const tutor = tutors.find(t => t.id === tutorId);
    if (!tutor) return [];
    return subjects.filter(s => 
      tutor.subjects.some(ts => 
        ts.toLowerCase().includes(s.name.toLowerCase()) ||
        s.name.toLowerCase().includes(ts.toLowerCase())
      )
    );
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
        <h1 className="text-2xl lg:text-3xl font-bold">Enrol Siswa</h1>
        <p className="text-muted-foreground">Daftarkan siswa ke tutor secara manual</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Form Pendaftaran
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Selection */}
          <div className="space-y-2">
            <Label>Pilih Siswa</Label>
            <Select value={selectedStudent} onValueChange={(val) => {
              setSelectedStudent(val);
              setSelectedSubject("");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih siswa..." />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Cari siswa..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="mb-2"
                  />
                </div>
                {filteredStudents.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Tidak ada siswa
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div>{student.full_name}</div>
                          <div className="text-xs text-muted-foreground">{student.email}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Tutor Selection */}
          <div className="space-y-2">
            <Label>Pilih Tutor</Label>
            <Select value={selectedTutor} onValueChange={(val) => {
              setSelectedTutor(val);
              setSelectedSubject("");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tutor..." />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Cari tutor..."
                    value={tutorSearch}
                    onChange={(e) => setTutorSearch(e.target.value)}
                    className="mb-2"
                  />
                </div>
                {filteredTutors.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Tidak ada tutor
                  </div>
                ) : (
                  filteredTutors.map((tutor) => (
                    <SelectItem key={tutor.id} value={tutor.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div>{tutor.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {tutor.subjects?.slice(0, 3).join(", ")}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label>Pilih Mata Pelajaran</Label>
            <Select 
              value={selectedSubject} 
              onValueChange={setSelectedSubject}
              disabled={!selectedTutor}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedTutor ? "Pilih mata pelajaran..." : "Pilih tutor dulu..."} />
              </SelectTrigger>
              <SelectContent>
                {getTutorSubjects(selectedTutor).length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Tutor tidak memiliki mata pelajaran
                  </div>
                ) : (
                  getTutorSubjects(selectedTutor).map((subject) => (
                    <SelectItem key={subject.id} value={subject.name}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {subject.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleEnrol} 
            disabled={enrolling || !selectedStudent || !selectedTutor || !selectedSubject}
            className="w-full"
          >
            {enrolling ? "Mendaftarkan..." : "Daftarkan Siswa"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Enrol;