
-- 1) Link Appels d’offres (marches) to Projects
ALTER TABLE public.marches
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_marches_project_id ON public.marches(project_id);

-- 2) Ensure updated_at stays correct on updates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_projects') THEN
    CREATE TRIGGER set_timestamp_projects
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_marches') THEN
    CREATE TRIGGER set_timestamp_marches
    BEFORE UPDATE ON public.marches
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_devis') THEN
    CREATE TRIGGER set_timestamp_devis
    BEFORE UPDATE ON public.devis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

-- 3) Enable reliable realtime payloads and add tables to publication
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.marches REPLICA IDENTITY FULL;
ALTER TABLE public.devis REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.marches;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.devis;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END
$$;

-- 4) Create a Storage bucket for generated documents (PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 5) Storage policies for 'documents' bucket
-- Allow authenticated users to upload into the 'documents' bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Authenticated users can upload to documents'
  ) THEN
    CREATE POLICY "Authenticated users can upload to documents"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Users can update own documents'
  ) THEN
    CREATE POLICY "Users can update own documents"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'documents' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'documents' AND owner = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Users can delete own documents'
  ) THEN
    CREATE POLICY "Users can delete own documents"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'documents' AND owner = auth.uid());
  END IF;
END
$$;

-- 6) Let recipients mark messages as read in Inbox
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'messages'
      AND policyname = 'Recipients can mark messages as read'
  ) THEN
    CREATE POLICY "Recipients can mark messages as read"
    ON public.messages
    FOR UPDATE
    USING (to_user = auth.uid())
    WITH CHECK (to_user = auth.uid());
  END IF;
END
$$;
