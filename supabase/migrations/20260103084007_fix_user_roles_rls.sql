-- Allow users to insert their own role on first registration
CREATE POLICY "Users can insert own role"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Drop the old restrictive policy that blocks normal users
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Recreate admin policy only for UPDATE and DELETE
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));
