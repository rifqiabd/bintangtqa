-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'tutor', 'student');

-- Create enum for subject areas
CREATE TYPE subject_area AS ENUM (
  'matematika',
  'fisika',
  'kimia',
  'biologi',
  'bahasa_indonesia',
  'bahasa_inggris',
  'ekonomi',
  'akuntansi',
  'sejarah',
  'geografi',
  'sosiologi',
  'pkn'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tutor_details table for additional tutor information
CREATE TABLE public.tutor_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  subjects subject_area[] NOT NULL DEFAULT '{}',
  experience TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  hourly_rate DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  check_out_time TIMESTAMP WITH TIME ZONE,
  check_in_latitude DOUBLE PRECISION,
  check_in_longitude DOUBLE PRECISION,
  check_out_latitude DOUBLE PRECISION,
  check_out_longitude DOUBLE PRECISION,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enrollments table to track tutor-student relationships
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject subject_area NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, tutor_id, subject)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Tutor details policies
CREATE POLICY "Anyone can view tutor details"
  ON public.tutor_details FOR SELECT
  USING (true);

CREATE POLICY "Tutors can update own details"
  ON public.tutor_details FOR UPDATE
  USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can insert own details"
  ON public.tutor_details FOR INSERT
  WITH CHECK (auth.uid() = tutor_id);

-- Attendance policies
CREATE POLICY "Tutors can view own attendance"
  ON public.attendance FOR SELECT
  USING (auth.uid() = tutor_id);

CREATE POLICY "Admins can view all attendance"
  ON public.attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Students can view their attendance"
  ON public.attendance FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Tutors can insert own attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Tutors can update own attendance"
  ON public.attendance FOR UPDATE
  USING (auth.uid() = tutor_id);

-- Enrollments policies
CREATE POLICY "Students can view own enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Tutors can view own enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = tutor_id);

CREATE POLICY "Admins can view all enrollments"
  ON public.enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can create enrollments"
  ON public.enrollments FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutor_details_updated_at
  BEFORE UPDATE ON public.tutor_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate distance between two points using Haversine formula
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  earth_radius DOUBLE PRECISION := 6371; -- km
  dlat DOUBLE PRECISION;
  dlon DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;