import { supabase } from "@/integrations/supabase/client";
import type { TutorData, Subject } from "../types/tutorFind";

const calculateDistance = (
  lat1: number, lon1: number, lat2: number, lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getSubjects = async (): Promise<Subject[]> => {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data || [];
};

export const findTutors = async (
  searchQuery: string,
  subjectFilter: string,
  sortBy: string,
  userLat?: number,
  userLon?: number
): Promise<TutorData[]> => {
  let query = supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      phone,
      email,
      address,
      latitude,
      longitude
    `)
    .ilike("full_name", `%${searchQuery}%`);

  const { data, error } = await query;
  if (error) throw error;

  if (!data || data.length === 0) return [];

  const tutorIds = data.map((p) => p.id);

  const { data: tutorDetails } = await supabase
    .from("tutor_details")
    .select("*")
    .in("tutor_id", tutorIds)
    .eq("is_available", true);

  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "tutor")
    .in("user_id", tutorIds);

  const approvedTutorIds = new Set((userRoles || []).map((r) => r.user_id));
  const availableDetails = (tutorDetails || []).filter(
    (d) => approvedTutorIds.has(d.tutor_id)
  );

  let tutors: TutorData[] = (data || [])
    .filter((p) => availableDetails.some((d) => d.tutor_id === p.id))
    .map((p) => {
      const td = availableDetails.find((d) => d.tutor_id === p.id);
      let subjects: string[] = [];
      if (td?.subjects) {
        try {
          subjects = JSON.parse(td.subjects);
        } catch {}
      }
      return {
        id: p.id,
        full_name: p.full_name,
        phone: p.phone,
        email: p.email,
        address: p.address,
        latitude: p.latitude,
        longitude: p.longitude,
        subjects,
        experience: td?.experience || "",
        hourly_rate: td?.hourly_rate,
      };
    });

  if (subjectFilter && subjectFilter !== "all") {
    tutors = tutors.filter((t) =>
      t.subjects.includes(subjectFilter)
    );
  }

  if (userLat && userLon) {
    tutors = tutors.filter((t) => {
      if (!t.latitude || !t.longitude) return false;
      t.distance = calculateDistance(
        userLat, userLon, t.latitude, t.longitude
      );
      return t.distance <= 10;
    });
  }

  if (sortBy === "distance" && userLat && userLon) {
    tutors.sort((a, b) => (a.distance || 999) - (b.distance || 999));
  } else if (sortBy === "rate-low") {
    tutors.sort((a, b) => (a.hourly_rate || 999) - (b.hourly_rate || 999));
  } else if (sortBy === "rate-high") {
    tutors.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0));
  }

  return tutors;
};

export const requestTutor = async (tutorId: string, subject: string): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { error } = await supabase.from("enrollments").insert({
    student_id: session.user.id,
    tutor_id: tutorId,
    status: "pending",
  });

  if (error) throw error;
};