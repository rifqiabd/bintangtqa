export interface Tutor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  tutor_details: {
    subjects: string[];
    experience: string;
    is_available: boolean;
    hourly_rate: number;
  } | null;
  enrollments?: {
    id: string;
    student_id: string;
    student_name?: string;
    subject: string;
    status: string;
  }[];
}

export interface EditingTutor {
  full_name: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  subjects: string[];
  experience: string;
  hourly_rate: string;
  is_available: boolean;
}

export interface AddingTutor {
  email: string;
  full_name: string;
  phone: string;
}

export const createEmptyEditingTutor = (): EditingTutor => ({
  full_name: "",
  phone: "",
  address: "",
  latitude: null,
  longitude: null,
  subjects: [],
  experience: "",
  hourly_rate: "",
  is_available: true,
});

export const createEmptyAddingTutor = (): AddingTutor => ({
  email: "",
  full_name: "",
  phone: "",
});
