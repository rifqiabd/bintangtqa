export interface PendingTutor {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  subjects: string[];
  experience: string;
  ktp_link: string | null;
  cv_link: string | null;
  certificate_links: string[] | null;
  university: string | null;
  major: string | null;
  graduation_year: number | null;
  ipk: number | null;
}

export interface ApprovalHistory {
  id: string;
  tutor_id: string;
  approved_by: string | null;
  approved_at: string;
  notes: string | null;
  created_data: Record<string, unknown> | null;
}

export interface RejectionHistory {
  id: string;
  tutor_id: string;
  rejection_reason: string;
  rejected_at: string;
  resubmitted_at: string | null;
  updated_data: Record<string, unknown> | null;
}