export interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  enrollments?: {
    id: string;
    tutor_id: string;
    subject: string;
    status: string;
  }[];
}

export interface EditingStudent {
  full_name: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export interface AddingStudent {
  email: string;
  full_name: string;
  phone: string;
}

export const createEmptyEditingStudent = (): EditingStudent => ({
  full_name: "",
  phone: "",
  address: "",
  latitude: null,
  longitude: null,
});

export const createEmptyAddingStudent = (): AddingStudent => ({
  email: "",
  full_name: "",
  phone: "",
});