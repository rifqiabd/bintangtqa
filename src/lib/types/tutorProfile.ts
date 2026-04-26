export interface TutorProfileData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export interface TutorDetailsData {
  subjects: string[];
  experience: string;
  hourly_rate: string;
  is_available: boolean;
  university: string;
  major: string;
  graduation_year: string;
  ipk: string;
}