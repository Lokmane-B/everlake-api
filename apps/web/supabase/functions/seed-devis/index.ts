import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COMPANY_NAMES = [
  "Orion Ingénierie", "Infratech Solutions", "Nexa Informatique", "Global IT Partners",
  "HexaTech", "Alpha Services", "Meridien Solutions", "Dynamis Group", "Voltaire Industries",
  "Praxis Conseil", "Arkane Services", "Phenix Logistique", "Sigma Solutions", "Atlantis Consulting",
  "Boreas Industries", "Zénith Technologies", "Nova Partners", "Axium Services", "Quantum Solutions",
  "Vertex Consulting", "Horizon Industries", "Pinnacle Services", "Apex Group", "Summit Solutions",
  "Zenith Partners", "Catalyst Industries", "Nexus Services", "Precision Group", "Elite Solutions",
  "Prime Industries", "Stellar Services", "Vanguard Group"
];

const LOCATIONS = [
  "Paris 8ème", "Paris 12ème", "Paris 15ème", "Paris 9ème", "Paris 16ème",
  "Lyon 6ème", "Marseille 2ème", "Toulouse Centre", "Nice Port",
  "Nantes Centre", "Strasbourg", "Bordeaux", "Lille Centre", "Montpellier"
];

function generateRandomDevis(marcheTitle: string, companyIndex: number) {
  const companyName = COMPANY_NAMES[companyIndex % COMPANY_NAMES.length];
  const location = LOCATIONS[companyIndex % LOCATIONS.length];
  
  // Générer des items variés selon le type de marché
  const items = [];
  const itemCount = 2 + Math.floor(Math.random() * 4); // 2 à 5 items
  
  for (let i = 0; i < itemCount; i++) {
    const quantity = 1 + Math.floor(Math.random() * 100);
    const unitPrice = 50 + Math.floor(Math.random() * 5000);
    const totalPrice = quantity * unitPrice;
    
    items.push({
      description: `Article ${i + 1} - ${marcheTitle.substring(0, 30)}`,
      quantity,
      unit: i === itemCount - 1 ? "lot" : "unité",
      unitPrice,
      totalPrice
    });
  }
  
  const total_ht = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tva = Math.round(total_ht * 0.2);
  const total_ttc = total_ht + tva;
  
  const commentaires = [
    "Livraison et installation incluses. Garantie 3 ans.",
    "Délai de livraison : 15 jours ouvrés. Support technique inclus.",
    "Prix ferme et définitif. Installation et formation comprises.",
    "Offre valable 30 jours. Maintenance préventive incluse.",
    "Garantie constructeur étendue. Support hotline 24/7.",
    "Livraison express disponible. Certification qualité ISO 9001.",
    "Prix dégressif pour commandes ultérieures. Paiement échelonné possible.",
    "Solution complète clé en main. Formation utilisateurs incluse."
  ];
  
  return {
    company_name: companyName,
    location,
    commentaire: commentaires[companyIndex % commentaires.length],
    items,
    total_ht,
    tva,
    total_ttc
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { marcheId, userId, count = 5 } = await req.json();

    if (!marcheId || !userId) {
      return new Response(
        JSON.stringify({ error: 'marcheId and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get marche details
    const { data: marche, error: marcheError } = await supabase
      .from('marches')
      .select('title')
      .eq('id', marcheId)
      .single();

    if (marcheError || !marche) {
      return new Response(
        JSON.stringify({ error: 'Marché not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Remove existing devis for this marche
    const { error: deleteError } = await supabase
      .from('devis')
      .delete()
      .eq('marche_id', marcheId)
      .eq('sent_to', userId);

    if (deleteError) {
      console.error('Error deleting existing devis:', deleteError);
    }

    // Generate devis dynamically
    const devisToInsert = [];

    for (let i = 0; i < count; i++) {
      const devisInfo = generateRandomDevis(marche.title, i);
      
      const devis = {
        marche_id: marcheId,
        sent_to: userId,
        created_by: crypto.randomUUID(),
        marche_title: marche.title,
        company_name: devisInfo.company_name,
        location: devisInfo.location,
        status: "Envoyé",
        commentaire: devisInfo.commentaire,
        items: devisInfo.items,
        total_ht: devisInfo.total_ht,
        tva: devisInfo.tva,
        total_ttc: devisInfo.total_ttc,
        attachments: []
      };

      devisToInsert.push(devis);
    }

    // Insert all devis
    const { data, error } = await supabase
      .from('devis')
      .insert(devisToInsert)
      .select();

    if (error) {
      console.error('Error inserting devis:', error);
      return new Response(
        JSON.stringify({ error: 'Error creating devis', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${devisToInsert.length} devis créés avec succès`,
        devis: data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur inattendue';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
