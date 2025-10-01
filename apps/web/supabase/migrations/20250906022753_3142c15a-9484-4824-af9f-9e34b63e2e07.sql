
-- 1) Devis: pièces jointes
ALTER TABLE public.devis
ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2) Appels d'offres: critères d'évaluation
ALTER TABLE public.marches
ADD COLUMN IF NOT EXISTS evaluation_criteria jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 3) Canal interne (indépendant de la boîte de réception)
-- Tables
CREATE TABLE IF NOT EXISTS public.internal_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  name text NOT NULL,
  is_group boolean NOT NULL DEFAULT false,
  is_all_employees boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.internal_channel_members (
  channel_id uuid NOT NULL REFERENCES public.internal_channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.internal_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.internal_channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_internal_channels_updated_at ON public.internal_channels;
CREATE TRIGGER trg_internal_channels_updated_at
  BEFORE UPDATE ON public.internal_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.internal_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;

-- Policies: internal_channels
DROP POLICY IF EXISTS "Company users can view company-wide channels" ON public.internal_channels;
CREATE POLICY "Company users can view company-wide channels"
  ON public.internal_channels
  FOR SELECT
  USING (
    is_all_employees = true
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.company_name IS NOT NULL
        AND p.company_name = internal_channels.company_name
    )
  );

DROP POLICY IF EXISTS "Members can view group channels" ON public.internal_channels;
CREATE POLICY "Members can view group channels"
  ON public.internal_channels
  FOR SELECT
  USING (
    is_group = true
    AND EXISTS (
      SELECT 1
      FROM public.internal_channel_members m
      WHERE m.channel_id = internal_channels.id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create channels in their company" ON public.internal_channels;
CREATE POLICY "Users can create channels in their company"
  ON public.internal_channels
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.company_name IS NOT NULL
        AND p.company_name = internal_channels.company_name
    )
  );

DROP POLICY IF EXISTS "Channel owners can update channels" ON public.internal_channels;
CREATE POLICY "Channel owners can update channels"
  ON public.internal_channels
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Channel owners can delete channels" ON public.internal_channels;
CREATE POLICY "Channel owners can delete channels"
  ON public.internal_channels
  FOR DELETE
  USING (created_by = auth.uid());

-- Policies: internal_channel_members
DROP POLICY IF EXISTS "Members or owners can view channel members" ON public.internal_channel_members;
CREATE POLICY "Members or owners can view channel members"
  ON public.internal_channel_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.internal_channel_members m2
      WHERE m2.channel_id = internal_channel_members.channel_id
        AND m2.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.internal_channels c
      WHERE c.id = internal_channel_members.channel_id
        AND c.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Only owners can add members" ON public.internal_channel_members;
CREATE POLICY "Only owners can add members"
  ON public.internal_channel_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.internal_channels c
      WHERE c.id = internal_channel_members.channel_id
        AND c.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Only owners can update members" ON public.internal_channel_members;
CREATE POLICY "Only owners can update members"
  ON public.internal_channel_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.internal_channels c
      WHERE c.id = internal_channel_members.channel_id
        AND c.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.internal_channels c
      WHERE c.id = internal_channel_members.channel_id
        AND c.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Only owners can remove members" ON public.internal_channel_members;
CREATE POLICY "Only owners can remove members"
  ON public.internal_channel_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.internal_channels c
      WHERE c.id = internal_channel_members.channel_id
        AND c.created_by = auth.uid()
    )
  );

-- Policies: internal_messages
DROP POLICY IF EXISTS "Members of a channel can read messages" ON public.internal_messages;
CREATE POLICY "Members of a channel can read messages"
  ON public.internal_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.internal_channels c
      WHERE c.id = internal_messages.channel_id
        AND (
          (c.is_all_employees = true AND EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.company_name = c.company_name
          ))
          OR
          EXISTS (
            SELECT 1 FROM public.internal_channel_members m
            WHERE m.channel_id = c.id
              AND m.user_id = auth.uid()
          )
        )
    )
  );

DROP POLICY IF EXISTS "Members of a channel can post messages" ON public.internal_messages;
CREATE POLICY "Members of a channel can post messages"
  ON public.internal_messages
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.internal_channels c
      WHERE c.id = internal_messages.channel_id
        AND (
          (c.is_all_employees = true AND EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.company_name = c.company_name
          ))
          OR
          EXISTS (
            SELECT 1 FROM public.internal_channel_members m
            WHERE m.channel_id = c.id
              AND m.user_id = auth.uid()
          )
        )
    )
  );

-- 4) Storage policies for documents bucket
-- Public read access for files in 'documents'
DROP POLICY IF EXISTS "Public can read documents" ON storage.objects;
CREATE POLICY "Public can read documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

-- Authenticated users can upload to their own folder: users/{uid}/**
DROP POLICY IF EXISTS "Users can upload to their folder in documents" ON storage.objects;
CREATE POLICY "Users can upload to their folder in documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (name LIKE (auth.uid()::text || '/%') OR name LIKE ('users/' || auth.uid()::text || '/%'))
  );

-- Authenticated users can update their own files
DROP POLICY IF EXISTS "Users can update their files in documents" ON storage.objects;
CREATE POLICY "Users can update their files in documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND (name LIKE (auth.uid()::text || '/%') OR name LIKE ('users/' || auth.uid()::text || '/%'))
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND (name LIKE (auth.uid()::text || '/%') OR name LIKE ('users/' || auth.uid()::text || '/%'))
  );

-- Authenticated users can delete their own files
DROP POLICY IF EXISTS "Users can delete their files in documents" ON storage.objects;
CREATE POLICY "Users can delete their files in documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND (name LIKE (auth.uid()::text || '/%') OR name LIKE ('users/' || auth.uid()::text || '/%'))
  );
