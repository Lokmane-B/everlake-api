-- Allow users to delete their own marchés
DROP POLICY IF EXISTS "Users can delete their own marchés" ON public.marches;

CREATE POLICY "Users can delete their own marchés" 
ON public.marches 
FOR DELETE 
USING (created_by = auth.uid());