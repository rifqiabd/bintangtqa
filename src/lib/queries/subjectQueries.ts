import { supabase } from "@/integrations/supabase/client";

export interface Subject {
  id: string;
  name: string;
  is_active: boolean;
}

export const getSubjects = async (): Promise<Subject[]> => {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, is_active")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data || [];
};