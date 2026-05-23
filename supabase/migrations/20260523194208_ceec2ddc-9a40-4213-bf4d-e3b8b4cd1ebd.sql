
-- Add missing columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS province_code TEXT,
  ADD COLUMN IF NOT EXISTS regency_code TEXT,
  ADD COLUMN IF NOT EXISTS district_code TEXT,
  ADD COLUMN IF NOT EXISTS village_code TEXT,
  ADD COLUMN IF NOT EXISTS school_name TEXT,
  ADD COLUMN IF NOT EXISTS grade TEXT;

-- Add missing columns to tutor_details
ALTER TABLE public.tutor_details
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS ktp_link TEXT,
  ADD COLUMN IF NOT EXISTS cv_link TEXT,
  ADD COLUMN IF NOT EXISTS certificate_links TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS university TEXT,
  ADD COLUMN IF NOT EXISTS major TEXT,
  ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
  ADD COLUMN IF NOT EXISTS ipk NUMERIC;

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed subjects with the subject_area enum values
INSERT INTO public.subjects (id, name, is_active)
VALUES 
  (gen_random_uuid(), 'Matematika', true),
  (gen_random_uuid(), 'Fisika', true),
  (gen_random_uuid(), 'Kimia', true),
  (gen_random_uuid(), 'Biologi', true),
  (gen_random_uuid(), 'Bahasa Indonesia', true),
  (gen_random_uuid(), 'Bahasa Inggris', true),
  (gen_random_uuid(), 'Ekonomi', true),
  (gen_random_uuid(), 'Akuntansi', true),
  (gen_random_uuid(), 'Sejarah', true),
  (gen_random_uuid(), 'Geografi', true),
  (gen_random_uuid(), 'Sosiologi', true),
  (gen_random_uuid(), 'PKN', true)
ON CONFLICT DO NOTHING;

-- Create tutor_approval_history table
CREATE TABLE IF NOT EXISTS public.tutor_approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tutor_rejection_history table
CREATE TABLE IF NOT EXISTS public.tutor_rejection_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rejection_reason TEXT NOT NULL,
  rejected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resubmitted_at TIMESTAMP WITH TIME ZONE,
  updated_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_rejection_history ENABLE ROW LEVEL SECURITY;

-- Subjects policies
CREATE POLICY "Anyone can view active subjects"
  ON public.subjects FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage subjects"
  ON public.subjects FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Approval history policies
CREATE POLICY "Tutors can view own approval history"
  ON public.tutor_approval_history FOR SELECT
  USING (auth.uid() = tutor_id);

CREATE POLICY "Admins can view all approval history"
  ON public.tutor_approval_history FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert approval history"
  ON public.tutor_approval_history FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Rejection history policies
CREATE POLICY "Tutors can view own rejection history"
  ON public.tutor_rejection_history FOR SELECT
  USING (auth.uid() = tutor_id);

CREATE POLICY "Admins can view all rejection history"
  ON public.tutor_rejection_history FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert rejection history"
  ON public.tutor_rejection_history FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create admin_get_all_enrollments RPC
CREATE OR REPLACE FUNCTION public.admin_get_all_enrollments()
RETURNS TABLE (
  id uuid,
  student_id uuid,
  tutor_id uuid,
  subject text,
  status text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.id, e.student_id, e.tutor_id, e.subject::text, e.status, e.created_at
  FROM public.enrollments e;
$$;

REVOKE ALL ON FUNCTION public.admin_get_all_enrollments() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_get_all_enrollments() TO authenticated;

-- Create admin_get_all_tutor_details RPC
CREATE OR REPLACE FUNCTION public.admin_get_all_tutor_details()
RETURNS TABLE (
  id uuid,
  tutor_id uuid,
  subjects subject_area[],
  experience text,
  is_available boolean,
  hourly_rate numeric,
  is_approved boolean,
  approved_at timestamp with time zone,
  rejection_reason text,
  ktp_link text,
  cv_link text,
  certificate_links text[],
  university text,
  major text,
  graduation_year integer,
  ipk numeric,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT td.id, td.tutor_id, td.subjects, td.experience, td.is_available, td.hourly_rate,
         td.is_approved, td.approved_at, td.rejection_reason, td.ktp_link, td.cv_link,
         td.certificate_links, td.university, td.major, td.graduation_year, td.ipk,
         td.created_at, td.updated_at
  FROM public.tutor_details td;
$$;

REVOKE ALL ON FUNCTION public.admin_get_all_tutor_details() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_get_all_tutor_details() TO authenticated;
