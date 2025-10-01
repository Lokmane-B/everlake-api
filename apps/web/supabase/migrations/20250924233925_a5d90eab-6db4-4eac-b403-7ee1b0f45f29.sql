-- Ajouter une colonne pour l'attributaire dans la table marches
ALTER TABLE public.marches ADD COLUMN IF NOT EXISTS attributaire_company_name TEXT;
ALTER TABLE public.marches ADD COLUMN IF NOT EXISTS attributaire_devis_id UUID;

-- Supprimer l'ancienne contrainte si elle existe
ALTER TABLE public.devis DROP CONSTRAINT IF EXISTS devis_status_check;

-- Ajouter la nouvelle contrainte avec tous les statuts
ALTER TABLE public.devis 
ADD CONSTRAINT devis_status_check 
CHECK (status IN ('Brouillon', 'Envoyé', 'Accepté', 'Refusé', 'Sélectionné'));

-- Modifier le statut par défaut
ALTER TABLE public.devis ALTER COLUMN status SET DEFAULT 'Envoyé';

-- Mettre à jour les devis existants pour avoir le bon statut par défaut
UPDATE public.devis SET status = 'Envoyé' WHERE status = 'Brouillon' OR status IS NULL;