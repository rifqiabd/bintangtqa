import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .limit(1);

  if (!userRoles || userRoles.length === 0) {
    const { error: insertError } = await supabase.from("user_roles").insert({
      user_id: data.user.id,
      role: "student",
    });
    
    if (insertError) throw new Error("Gagal membuat role user");
  }

  return userRoles?.[0]?.role || "student";
};

export const registerUser = async (
  email: string,
  password: string,
  fullName: string,
  phone: string,
  role: "student" | "tutor",
  options?: {
    address?: string;
    latitude?: number;
    longitude?: number;
    subjects?: string[];
    experience?: string;
    ktpLink?: string;
    cvLink?: string;
    certificateLinks?: string[];
    university?: string;
    major?: string;
    graduationYear?: number;
    ipk?: number;
  }
) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("User creation failed");

  await supabase.from("profiles").insert({
    id: authData.user.id,
    full_name: fullName,
    email,
    phone,
    address: options?.address,
    latitude: options?.latitude,
    longitude: options?.longitude,
  });

  const { error: roleError } = await supabase.from("user_roles").insert({
    user_id: authData.user.id,
    role,
  });

  if (roleError) throw roleError;

  if (role === "tutor" && options?.subjects) {
    const { error: tutorError } = await supabase.from("tutor_details").insert({
      tutor_id: authData.user.id,
      subjects: options.subjects as Database["public"]["Enums"]["subject_area"][],
      experience: options.experience,
      is_approved: false,
      ktp_link: options.ktpLink || null,
      cv_link: options.cvLink || null,
      certificate_links: options.certificateLinks || [],
      university: options.university || null,
      major: options.major || null,
      graduation_year: options.graduationYear || null,
      ipk: options.ipk || null,
    });

    if (tutorError) throw tutorError;
  }

  return authData.user.id;
};

export const forgotPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth?reset=true`,
  });

  if (error) throw error;
};

export const resetPassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  
  if (error) throw error;
};

export const getGoogleAuthUrl = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth`,
    },
  });

  if (error) throw error;
  return data;
};