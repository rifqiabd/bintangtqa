-- Allow everyone to read tutor roles for the FindTutors feature
CREATE POLICY "Everyone can view tutor roles"
ON public.user_roles
FOR SELECT
USING (role = 'tutor'::app_role);
