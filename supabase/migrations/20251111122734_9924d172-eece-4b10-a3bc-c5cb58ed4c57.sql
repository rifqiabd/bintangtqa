-- Create app_role enum (separate from user_role to avoid conflicts)
CREATE TYPE public.app_role AS ENUM ('admin', 'tutor', 'student');

-- Create user_roles table with proper security
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Only admins can insert/update/delete roles (using existing profiles check temporarily for bootstrapping)
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  )
);

-- Create security definer function to check roles safely
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 
  CASE 
    WHEN role = 'admin'::user_role THEN 'admin'::app_role
    WHEN role = 'tutor'::user_role THEN 'tutor'::app_role
    WHEN role = 'student'::user_role THEN 'student'::app_role
  END as role
FROM public.profiles;

-- Drop the old RLS policies that reference profiles.role
DROP POLICY IF EXISTS "Admins can view all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create new RLS policies using has_role function
CREATE POLICY "Admins can view all attendance"
ON public.attendance
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all enrollments"
ON public.enrollments
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix enrollment creation - require authentication and validate student
DROP POLICY IF EXISTS "Anyone can create enrollments" ON public.enrollments;

CREATE POLICY "Students create own enrollments"
ON public.enrollments
FOR INSERT
WITH CHECK (
  auth.uid() = student_id 
  AND auth.uid() IS NOT NULL
);

-- Recreate admin policy for user_roles using has_role
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Remove role column from profiles (no longer needed)
ALTER TABLE public.profiles DROP COLUMN role;

-- Update profiles RLS to prevent role manipulation
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Add unique constraint to prevent duplicate enrollments
ALTER TABLE public.enrollments
ADD CONSTRAINT unique_student_tutor_subject UNIQUE (student_id, tutor_id, subject);