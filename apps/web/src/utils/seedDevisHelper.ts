import { supabase } from '@/integrations/supabase/client';

interface SeedDevisRequest {
  marcheId: string;
  userId: string;
  count: number;
}

export async function seedDevis(marcheId: string, count: number): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(
      'https://zrvlhpkfhxhmvmuxjgdm.supabase.co/functions/v1/seed-devis',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          marcheId,
          userId: user.id,
          count
        } as SeedDevisRequest)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to seed devis');
    }

    const result = await response.json();
    console.log(`✅ ${result.message}`);
  } catch (error) {
    console.error('Error seeding devis:', error);
    throw error;
  }
}

export async function seedAllRequestedDevis(): Promise<void> {
  const devisRequests = [
    { marcheId: '3601c597-284f-4f19-86aa-63435372d3a2', count: 7, title: 'transport de matière première' },
    { marcheId: '2716447e-ca18-429d-b2a0-0e910b889a77', count: 2, title: 'Fourniture d\'équipements miniers' },
    { marcheId: 'f1f71dea-4ae4-431b-91fb-e7e36900a752', count: 8, title: 'Approvisionnement en produits chimiques de traitement' },
    { marcheId: '3d0fda28-bb9c-4d86-9f48-be56694e9666', count: 14, title: 'Services de conseil juridique spécialisé' }
  ];

  console.log('🚀 Début de la génération des devis...');

  for (const request of devisRequests) {
    try {
      console.log(`📝 Génération de ${request.count} devis pour "${request.title}"...`);
      await seedDevis(request.marcheId, request.count);
    } catch (error) {
      console.error(`❌ Erreur pour "${request.title}":`, error);
    }
  }

  console.log('✨ Génération terminée !');
}

// Fonction disponible globalement dans la console
if (typeof window !== 'undefined') {
  (window as any).seedAllDevis = seedAllRequestedDevis;
}
