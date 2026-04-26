
-- ============================================================
-- 1) Lock down profiles: remove public read, scope per role
-- ============================================================
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admins can view everything
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Tutors can view their enrolled students' profiles
CREATE POLICY "Tutors can view enrolled students"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.student_id = profiles.id
      AND e.tutor_id = auth.uid()
      AND e.status = 'active'
  )
);

-- Students can view profiles of tutors they are enrolled with
CREATE POLICY "Students can view enrolled tutors"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.tutor_id = profiles.id
      AND e.student_id = auth.uid()
      AND e.status = 'active'
  )
);

-- Public-safe tutor discovery via SECURITY DEFINER function
-- (only exposes non-sensitive fields: id, name, general location)
CREATE OR REPLACE FUNCTION public.get_public_tutor_profiles()
RETURNS TABLE (
  id uuid,
  full_name text,
  address text,
  latitude double precision,
  longitude double precision,
  subjects subject_area[],
  experience text,
  hourly_rate numeric,
  is_available boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.full_name,
    p.address,
    p.latitude,
    p.longitude,
    COALESCE(td.subjects, '{}'::subject_area[]),
    td.experience,
    td.hourly_rate,
    COALESCE(td.is_available, true)
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON ur.user_id = p.id AND ur.role = 'tutor'::app_role
  LEFT JOIN public.tutor_details td ON td.tutor_id = p.id
  WHERE auth.uid() IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.get_public_tutor_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_tutor_profiles() TO authenticated;

-- ============================================================
-- 2) Prevent privilege escalation on user_roles
-- ============================================================
-- The "Admins can manage all roles" ALL policy still applies to admins.
-- Add a restricted self-insert policy so users can only assign
-- themselves 'student' or 'tutor', and only if they have no role yet.
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own student or tutor role" ON public.user_roles;

CREATE POLICY "Users can insert own student or tutor role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role IN ('student'::app_role, 'tutor'::app_role)
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
  )
);

-- ============================================================
-- 3) Restrict enrollment creation: tutor must exist & be available
-- ============================================================
DROP POLICY IF EXISTS "Students create own enrollments" ON public.enrollments;

CREATE POLICY "Students create own enrollments"
ON public.enrollments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND public.has_role(tutor_id, 'tutor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.tutor_details td
    WHERE td.tutor_id = enrollments.tutor_id
      AND td.is_available = true
  )
);
