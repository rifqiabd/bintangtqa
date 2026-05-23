import { supabase } from "@/integrations/supabase/client";
import type { TutorProfileData, TutorDetailsData } from "../types/tutorProfile";
import { getSubjects } from "./subjectQueries";

export const loadTutorProfile = async (): Promise<{
  profile: TutorProfileData;
  details: TutorDetailsData;
}> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, address, latitude, longitude")
    .eq("id", session.user.id)
    .single();

  const { data: details } = await supabase
    .from("tutor_details")
    .select("*")
    .eq("tutor_id", session.user.id)
    .single();

  let subjects: string[] = [];
  if (details?.subjects) {
    try {
      subjects = JSON.parse(details.subjects);
    } catch {}
  }

  return {
    profile: profile || { full_name: "", email: "", phone: "", address: "", latitude: null, longitude: null },
    details: {
      subjects,
      experience: details?.experience || "",
      hourly_rate: details?.hourly_rate?.toString() || "",
      is_available: details?.is_available ?? true,
      university: details?.university || "",
      major: details?.major || "",
      graduation_year: details?.graduation_year?.toString() || "",
      ipk: details?.ipk?.toString() || "",
    },
  };
};

export const updateTutorProfile = async (data: TutorProfileData): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      phone: data.phone,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
    })
    .eq("id", session.user.id);

  if (error) throw error;
};

export const updateTutorDetails = async (data: TutorDetailsData): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("tutor_details")
    .upsert({
      tutor_id: session.user.id,
      subjects: data.subjects as any,
      experience: data.experience,
      hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
      is_available: data.is_available,
      university: data.university || null,
      major: data.major || null,
      graduation_year: data.graduation_year ? parseInt(data.graduation_year) : null,
      ipk: data.ipk ? parseFloat(data.ipk) : null,
    } as any, {
      onConflict: "tutor_id",
    });

  if (error) throw error;
};