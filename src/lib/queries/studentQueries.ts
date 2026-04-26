import { supabase } from "@/integrations/supabase/client";
import type { Student, EditingStudent, AddingStudent } from "../types/student";

export const loadStudents = async (): Promise<Student[]> => {
  const { data: studentUsers, error: studentError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "student");

  if (studentError) throw studentError;
  if (!studentUsers || studentUsers.length === 0) return [];

  const studentIds = studentUsers.map((s) => s.user_id);

  const { data: profilesData, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, address, latitude, longitude, created_at")
    .in("id", studentIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  const { data: enrollmentsData } = await supabase.rpc('admin_get_all_enrollments');

  // Get tutor profiles to map tutor names
  const tutorIds = Array.from(new Set((enrollmentsData || []).map((e: any) => e.tutor_id)));
  const { data: tutorProfiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", tutorIds);

  // Get subjects to map IDs to names
  const { data: subjectsData } = await supabase
    .from("subjects")
    .select("id, name");
  
  const subjectMap = new Map((subjectsData || []).map((s) => [s.id, s.name]));

  const studentsWithEnrollments: Student[] = (profilesData || []).map((profile) => ({
    ...profile,
    enrollments: (enrollmentsData || [])
      .filter((e: any) => e.student_id === profile.id)
      .map((e: any) => ({
        ...e,
        tutor_name: tutorProfiles?.find((p) => p.id === e.tutor_id)?.full_name || "Unknown Tutor",
        subject_name: subjectMap.get(e.subject) || e.subject
      }))
  }));

  return studentsWithEnrollments;
};

export const toggleStudentStatus = async (studentId: string, currentStatus: string): Promise<string> => {
  const newStatus = currentStatus === "active" ? "inactive" : "active";
  
  const { error } = await supabase
    .from("enrollments")
    .update({ status: newStatus })
    .eq("id", studentId);

  if (error) throw error;
  return newStatus;
};

export const addStudent = async (data: AddingStudent): Promise<string> => {
  const tempPassword = Math.random().toString(36).slice(-8);
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: tempPassword,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("User creation failed");

  await supabase.from("profiles").insert({
    id: authData.user.id,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
  });

  await supabase.from("user_roles").insert({
    user_id: authData.user.id,
    role: "student",
  });

  return tempPassword;
};

export const editStudent = async (studentId: string, data: EditingStudent): Promise<void> => {
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      phone: data.phone,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
    })
    .eq("id", studentId);

  if (profileError) throw profileError;
};