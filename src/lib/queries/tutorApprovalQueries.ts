import { supabase } from "@/integrations/supabase/client";
import type { PendingTutor, ApprovalHistory } from "../types/tutorApproval";

export const loadPendingTutors = async (): Promise<PendingTutor[]> => {
  const { data: pendingTutors, error: pendingError } = await supabase
    .from("tutor_details")
    .select("tutor_id, is_approved")
    .eq("is_approved", false);

  if (pendingError) throw pendingError;
  if (!pendingTutors || pendingTutors.length === 0) return [];

  const tutorIds = pendingTutors.map((t) => t.tutor_id);

  const { data: profilesData, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, address, created_at")
    .in("id", tutorIds);

  if (profileError) throw profileError;

  const { data: detailsData } = await supabase
    .from("tutor_details")
    .select("*")
    .in("tutor_id", tutorIds);

  // Get subjects to map IDs to names
  const { data: subjectsData } = await supabase
    .from("subjects")
    .select("id, name");
  
  const subjectMap = new Map((subjectsData || []).map((s) => [s.id, s.name]));

  const mergedData = (profilesData || []).map((profile) => {
    const td = detailsData?.find((d) => d.tutor_id === profile.id);
    let subjects: string[] = [];
    
    if (td?.subjects) {
      try {
        const parsedSubjects = JSON.parse(td.subjects);
        // Map IDs to names if they are UUIDs
        subjects = parsedSubjects.map((id: string) => subjectMap.get(id) || id);
      } catch {
        subjects = [];
      }
    }
    
    return {
      id: td?.id,
      user_id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      created_at: profile.created_at,
      subjects,
      experience: td?.experience,
      ktp_link: td?.ktp_link,
      cv_link: td?.cv_link,
      certificate_links: td?.certificate_links,
      university: td?.university,
      major: td?.major,
      graduation_year: td?.graduation_year,
      ipk: td?.ipk,
    };
  });

  return mergedData;
};

export const approveTutor = async (tutorId: string): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  const adminId = session?.user.id;

  const { error } = await supabase
    .from("tutor_details")
    .update({
      is_approved: true,
      approved_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("id", tutorId);

  if (error) throw error;

  await supabase.from("tutor_approval_history").insert({
    tutor_id: (await getTutorUserId(tutorId)),
    approved_by: adminId,
    approved_at: new Date().toISOString(),
    notes: "DISETUJUI",
  });
};

export const rejectTutor = async (
  tutorId: string,
  reason: string,
  tutorData: {
    subjects: string[];
    experience: string;
    ktp_link?: string | null;
    cv_link?: string | null;
    certificate_links?: string[] | null;
    university?: string | null;
    major?: string | null;
    graduation_year?: number | null;
    ipk?: number | null;
  }
): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  const adminId = session?.user.id;
  const userId = await getTutorUserId(tutorId);

  const { error: updateError } = await supabase
    .from("tutor_details")
    .update({
      is_approved: false,
      rejection_reason: reason,
    })
    .eq("id", tutorId);

  if (updateError) throw updateError;

  await supabase.from("tutor_rejection_history").insert({
    tutor_id: userId,
    rejection_reason: reason,
    rejected_at: new Date().toISOString(),
    updated_data: tutorData,
  });

  await supabase.from("tutor_approval_history").insert({
    tutor_id: userId,
    approved_by: adminId,
    approved_at: new Date().toISOString(),
    notes: `DITOLAK: ${reason}`,
  });
};

const getTutorUserId = async (tutorDetailsId: string): Promise<string> => {
  const { data } = await supabase
    .from("tutor_details")
    .select("tutor_id")
    .eq("id", tutorDetailsId)
    .single();
  
  return data?.tutor_id || "";
};

export const getApprovalHistory = async (tutorUserId: string): Promise<ApprovalHistory[]> => {
  const { data, error } = await supabase
    .from("tutor_approval_history")
    .select("*")
    .eq("tutor_id", tutorUserId)
    .order("approved_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
};