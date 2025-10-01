-- Allow users to delete their own devis
CREATE POLICY "Users can delete their own devis" ON public.devis
FOR DELETE USING (created_by = auth.uid());

-- Delete the existing test devis
DELETE FROM public.devis WHERE id = '45be0935-8233-4248-b0aa-994a59b42a36';