import { supabase } from "@/integrations/supabase/client";
import type { Tutor } from "@/lib/types/tutor";
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

  const mergedData = (profilesData || []).map((profile) => {
    const td = tutorDetailsData?.find((td: any) => td.tutor_id === profile.id);
    let subjects: string[] = [];
    
    if (td?.subjects) {
      try {
        subjects = JSON.parse(td.subjects);
      } catch {
        subjects = [];
      }
    }
    
    return {
      ...profile,
      tutor_details: td ? {
        subjects,
        experience: td.experience,
        is_available: td.is_available,
        hourly_rate: td.hourly_rate
      } : null
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
    subjects: [],
    is_available: true,
  });

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
    }, {
      onConflict: "tutor_id",
    });

  if (detailsError) throw detailsError;
};