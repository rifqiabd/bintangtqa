import { supabase } from "@/integrations/supabase/client";
import type { AttendanceRecord, AttendanceStats } from "../types/attendance";

export const loadAttendance = async (options?: {
  tutorId?: string;
  month?: string;
}): Promise<AttendanceRecord[]> => {
  let query = supabase
    .from("attendance")
    .select(`
      id,
      tutor_id,
      student_id,
      check_in_time,
      check_out_time,
      notes,
      tutor:profiles!attendance_tutor_id_fkey(full_name),
      student:profiles!attendance_student_id_fkey(full_name)
    `)
    .order("check_in_time", { ascending: false });

  if (options?.tutorId && options.tutorId !== "all") {
    query = query.eq("tutor_id", options.tutorId);
  }

  if (options?.month) {
    const [year, month] = options.month.split("-");
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString();
    const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString();
    query = query.gte("check_in_time", startDate).lte("check_in_time", endDate);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data || [];
};

export const getAttendanceStats = async (): Promise<AttendanceStats> => {
  const { data: attendance, error } = await supabase
    .from("attendance")
    .select(`
      id,
      tutor_id,
      check_in_time,
      check_out_time,
      tutor:profiles!attendance_tutor_id_fkey(full_name)
    `);

  if (error) throw error;

  const tutorMap = new Map<string, { name: string; sessions: number; hours: number }>();
  
  (attendance || []).forEach((record: any) => {
    const tutorName = record.tutor?.full_name || "Unknown";
    const checkIn = new Date(record.check_in_time);
    const checkOut = record.check_out_time ? new Date(record.check_out_time) : new Date();
    const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

    const existing = tutorMap.get(record.tutor_id) || { name: tutorName, sessions: 0, hours: 0 };
    existing.sessions += 1;
    existing.hours += hours;
    tutorMap.set(record.tutor_id, existing);
  });

  const tutorStats = Array.from(tutorMap.values())
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10);

  const totalSessions = attendance?.length || 0;
  const totalHours = tutorStats.reduce((sum, t) => sum + t.hours, 0);

  return {
    totalSessions,
    totalHours,
    averageSessionLength: totalSessions > 0 ? totalHours / totalSessions : 0,
    tutorStats,
  };
};
};

export const getTutorsForFilter = async (): Promise<{ id: string; name: string }[]> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "tutor");

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const tutorIds = data.map((t) => t.user_id);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", tutorIds);

  return (profiles || []).map((p) => ({ id: p.id, name: p.full_name }));
};

export const exportAttendanceCSV = async () => {
  const { data: attendance, error } = await supabase
    .from("attendance")
    .select(`
      id,
      check_in_time,
      check_out_time,
      notes,
      tutor:profiles!attendance_tutor_id_fkey(full_name),
      student:profiles!attendance_student_id_fkey(full_name)
    `)
    .order("check_in_time", { ascending: false });

  if (error) throw error;

  const csv = [
    ["Tanggal", "Tutor", "Siswa", "Masuk", "Pulang", "Durasi", "Catatan"].join(","),
    ...(attendance || []).map((record: any) => {
      const checkIn = new Date(record.check_in_time);
      const checkOut = record.check_out_time ? new Date(record.check_out_time) : null;
      const duration = checkOut
        ? ((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(1)
        : "-";

      return [
        checkIn.toLocaleDateString("id-ID"),
        record.tutor?.full_name || "",
        record.student?.full_name || "",
        checkIn.toLocaleTimeString("id-ID"),
        checkOut ? checkOut.toLocaleTimeString("id-ID") : "Belum keluar",
        duration,
        (record.notes || "").replace(/,/g, ";"),
      ].join(",");
    }),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};