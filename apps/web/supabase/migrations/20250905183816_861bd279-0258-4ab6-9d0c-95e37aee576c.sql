-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  description TEXT,
  sector TEXT,
  location TEXT,
  year_founded TEXT,
  logo_url TEXT,
  siret TEXT,
  address TEXT,
  city TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  validated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create team members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on team members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create team members policies
CREATE POLICY "Users can manage their team members"
ON public.team_members
FOR ALL
USING (profile_id = auth.uid());

-- Create marchés (contracts/tenders) table
CREATE TABLE public.marches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  sector TEXT,
  budget TEXT,
  start_date DATE,
  end_date DATE,
  location TEXT,
  company_name TEXT,
  company_logo TEXT,
  visibility TEXT DEFAULT 'publique' CHECK (visibility IN ('publique', 'prive')),
  contract_type TEXT,
  quantity TEXT,
  cahier_des_charges TEXT,
  documents JSONB DEFAULT '[]',
  status TEXT DEFAULT 'Actif' CHECK (status IN ('Actif', 'Terminé', 'En attente')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on marchés
ALTER TABLE public.marches ENABLE ROW LEVEL SECURITY;

-- Create marchés policies (public read, authenticated users can create)
CREATE POLICY "Anyone can view public marchés"
ON public.marches
FOR SELECT
USING (visibility = 'publique' OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create marchés"
ON public.marches
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own marchés"
ON public.marches
FOR UPDATE
USING (created_by = auth.uid());

-- Create devis (quotes) table
CREATE TABLE public.devis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marche_id UUID REFERENCES public.marches(id) ON DELETE CASCADE,
  marche_title TEXT,
  items JSONB DEFAULT '[]',
  commentaire TEXT,
  total_ht DECIMAL(10,2) DEFAULT 0,
  tva DECIMAL(10,2) DEFAULT 0,
  total_ttc DECIMAL(10,2) DEFAULT 0,
  company_name TEXT,
  location TEXT,
  status TEXT DEFAULT 'Brouillon' CHECK (status IN ('Brouillon', 'Envoyé', 'Accepté', 'Refusé')),
  created_by UUID REFERENCES auth.users(id),
  sent_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on devis
ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;

-- Create devis policies
CREATE POLICY "Users can view their own devis"
ON public.devis
FOR SELECT
USING (created_by = auth.uid() OR sent_to = auth.uid());

CREATE POLICY "Users can create devis"
ON public.devis
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own devis"
ON public.devis
FOR UPDATE
USING (created_by = auth.uid());

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'En cours' CHECK (status IN ('En cours', 'Terminé', 'En attente', 'Annulé')),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  client_name TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create projects policies
CREATE POLICY "Users can manage their own projects"
ON public.projects
FOR ALL
USING (created_by = auth.uid());

-- Create contacts table
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  sector TEXT,
  location TEXT,
  notes TEXT,
  tags JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create contacts policies
CREATE POLICY "Users can manage their own contacts"
ON public.contacts
FOR ALL
USING (created_by = auth.uid());

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create notifications policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (user_id = auth.uid());

-- Create messages/inbox table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  content TEXT,
  from_user UUID REFERENCES auth.users(id),
  to_user UUID REFERENCES auth.users(id),
  read BOOLEAN DEFAULT false,
  marche_id UUID REFERENCES public.marches(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create messages policies
CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
USING (from_user = auth.uid() OR to_user = auth.uid());

CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (from_user = auth.uid());

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, company_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'company_name', ''));
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marches_updated_at
  BEFORE UPDATE ON public.marches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_devis_updated_at
  BEFORE UPDATE ON public.devis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();