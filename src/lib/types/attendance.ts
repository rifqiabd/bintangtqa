export interface AttendanceRecord {
  id: string;
  tutor_id: string;
  student_id: string | null;
  check_in_time: string;
  check_out_time: string | null;
  notes: string | null;
  tutor: {
    full_name: string;
  } | null;
  student: {
    full_name: string;
  } | null;
}

export interface AttendanceStats {
  totalSessions: number;
  totalHours: number;
  averageSessionLength: number;
  tutorStats: {
    name: string;
    sessions: number;
    hours: number;
  }[];
}