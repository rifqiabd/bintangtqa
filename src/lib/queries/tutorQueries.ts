import { supabase } from "@/integrations/supabase/client";
import type { EditingTutor, AddingTutor, Tutor } from "../types/tutor";

export const loadTutors = async (): Promise<Tutor[]> => {
  const { data: tutorUsers, error: tutorError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "tutor");

  if (tutorError) throw tutorError;
  if (!tutorUsers || tutorUsers.length === 0) return [];

  const tutorIds = tutorUsers.map((t) => t.user_id);

  const { data: profilesData, error } = await supabase
    .from("profiles")
    .select(`id, full_name, email, phone, address, latitude, longitude, created_at`)
    .in("id", tutorIds)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const { data: tutorDetailsData } = await supabase.rpc('admin_get_all_tutor_details');
  const { data: enrollmentsData } = await supabase.rpc('admin_get_all_enrollments');

  // Get subjects to map IDs to names
  const { data: subjectsData } = await supabase
    .from("subjects")
    .select("id, name");
  
  const subjectMap = new Map((subjectsData || []).map((s) => [s.id, s.name]));

  // Get student profiles to map student names in enrollments
  const studentIds = Array.from(new Set((enrollmentsData || []).map((e: any) => e.student_id)));
  const { data: studentProfiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", studentIds);

  const mergedData = (profilesData || []).map((profile) => {
    const td = tutorDetailsData?.find((td: any) => td.tutor_id === profile.id);
    let subjects: string[] = [];
    
    if (td?.subjects) {
      try {
        const parsedSubjects = JSON.parse(td.subjects as unknown as string);
        // Map subject IDs to names if they are UUIDs
        subjects = parsedSubjects.map((id: string) => subjectMap.get(id) || id);
      } catch {
        subjects = (td.subjects as unknown as string[]).map((id: string) => subjectMap.get(id) || id);
      }
    }

    const tutorEnrollments = (enrollmentsData || [])
      .filter((e: any) => e.tutor_id === profile.id)
      .map((e: any) => ({
        ...e,
        student_name: studentProfiles?.find((p) => p.id === e.student_id)?.full_name || "Unknown Student",
        subject_name: subjectMap.get(e.subject) || e.subject
      }));
    
    return {
      ...profile,
      tutor_details: td ? {
        subjects,
        experience: td.experience,
        is_available: td.is_available,
        hourly_rate: td.hourly_rate
      } : null,
      enrollments: tutorEnrollments
    };
  });

  return mergedData;
};

export const toggleTutorStatus = async (tutor: Tutor): Promise<boolean> => {
  const newStatus = !tutor.tutor_details?.is_available;
  
  const { error } = await supabase
    .from("tutor_details")
    .update({ is_available: newStatus })
    .eq("tutor_id", tutor.id);

  if (error) throw error;
  return newStatus;
};

export const addTutor = async (data: AddingTutor): Promise<string> => {
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
    role: "tutor",
  });

  await supabase.from("tutor_details").insert({
    tutor_id: authData.user.id,
    subjects: [] as any,
    is_available: true,
  } as any);

  return tempPassword;
};

export const editTutor = async (tutorId: string, data: EditingTutor): Promise<void> => {
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      phone: data.phone,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
    })
    .eq("id", tutorId);

  if (profileError) throw profileError;

  const { error: detailsError } = await supabase
    .from("tutor_details")
    .upsert({
      tutor_id: tutorId,
      subjects: data.subjects as any,
      experience: data.experience,
      hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
      is_available: data.is_available,
    } as any, {
      onConflict: "tutor_id",
    });

  if (detailsError) throw detailsError;
};