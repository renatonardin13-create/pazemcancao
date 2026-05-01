-- Allow authenticated users to insert into audit_logs (to log their own actions/attempts)
CREATE POLICY "Users can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
