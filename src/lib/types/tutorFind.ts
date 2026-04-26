export interface TutorData {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  subjects: string[];
  experience: string;
  hourly_rate: number | null;
  distance?: number;
}

export interface Subject {
  id: string;
  name: string;
}

export interface TutorFilters {
  search: string;
  subject: string;
  sortBy: string;
}