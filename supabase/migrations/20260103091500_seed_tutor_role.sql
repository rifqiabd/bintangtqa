-- Insert tutor role for existing user
INSERT INTO public.user_roles (user_id, role)
SELECT '70104584-f1b6-40a9-a06e-3ef62545b520', 'tutor'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '70104584-f1b6-40a9-a06e-3ef62545b520'
);

-- Insert tutor details for the tutor
INSERT INTO public.tutor_details (tutor_id, subjects, experience, hourly_rate)
SELECT '70104584-f1b6-40a9-a06e-3ef62545b520', 
       ARRAY['matematika', 'fisika']::subject_area[], 
       'Berpengalaman mengajar 5 tahun',
       150000
WHERE NOT EXISTS (
  SELECT 1 FROM public.tutor_details 
  WHERE tutor_id = '70104584-f1b6-40a9-a06e-3ef62545b520'
);

-- Insert student role for second user
INSERT INTO public.user_roles (user_id, role)
SELECT '55b9504a-25f0-46af-85b7-fe035df59877', 'student'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '55b9504a-25f0-46af-85b7-fe035df59877'
);
