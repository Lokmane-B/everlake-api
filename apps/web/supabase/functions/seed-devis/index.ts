import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { marcheId, userId } = await req.json();

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

    // Remove existing devis for this marche and recipient to ensure exact seed state
    const { error: deleteError } = await supabase
      .from('devis')
      .delete()
      .eq('marche_id', marcheId)
      .eq('sent_to', userId);

    if (deleteError) {
      console.error('Error deleting existing devis:', deleteError);
      // Continue anyway to try inserting fresh ones
    }

    // Specific devis data
    const devisData = [
      {
        company: { name: "Orion Ingénierie", location: "Paris 8ème" },
        commentaire: "Installation comprise dans le prix. Garantie constructeur 3 ans. Formation utilisateurs incluse (2 sessions de 4h). Maintenance préventive recommandée après 18 mois d'utilisation.",
        items: [
          {
            description: "Ordinateur portable Dell Latitude i5, 16 Go RAM, 512 Go SSD",
            quantity: 50,
            unit: "unité",
            unitPrice: 1050,
            totalPrice: 52500
          },
          {
            description: "Écran Dell 24\" Full HD",
            quantity: 50,
            unit: "unité",
            unitPrice: 170,
            totalPrice: 8500
          },
          {
            description: "Docking station Dell USB-C",
            quantity: 50,
            unit: "unité",
            unitPrice: 150,
            totalPrice: 7500
          },
          {
            description: "Casque Logitech H390",
            quantity: 50,
            unit: "unité",
            unitPrice: 60,
            totalPrice: 3000
          },
          {
            description: "Livraison + installation",
            quantity: 1,
            unit: "lot",
            unitPrice: 140,
            totalPrice: 140
          },
          {
            description: "Configuration initiale (OS + logiciels)",
            quantity: 1,
            unit: "lot",
            unitPrice: 120,
            totalPrice: 120
          }
        ],
        total_ht: 71760,
        tva: 14352,
        total_ttc: 86112
      },
      {
        company: { name: "Infratech Solutions", location: "Paris 12ème" },
        commentaire: "Livraison et installation sous 10 jours ouvrés. Matériel HP ProBook & écrans HP certifiés CE. Support hotline inclus 36 mois.",
        items: [
          {
            description: "HP ProBook 450 G10 i5, 16 Go RAM, 512 Go SSD",
            quantity: 50,
            unit: "unité",
            unitPrice: 1000,
            totalPrice: 50000
          },
          {
            description: "HP 24\" Monitor FHD",
            quantity: 50,
            unit: "unité",
            unitPrice: 160,
            totalPrice: 8000
          },
          {
            description: "HP USB-C Docking Station",
            quantity: 50,
            unit: "unité",
            unitPrice: 140,
            totalPrice: 7000
          },
          {
            description: "Casques Jabra Evolve 20",
            quantity: 50,
            unit: "unité",
            unitPrice: 70,
            totalPrice: 3500
          },
          {
            description: "Services (installation + config)",
            quantity: 1,
            unit: "lot",
            unitPrice: 300,
            totalPrice: 300
          }
        ],
        total_ht: 68800,
        tva: 13760,
        total_ttc: 82560
      },
      {
        company: { name: "Nexa Informatique", location: "Paris 15ème" },
        commentaire: "Option premium avec extension de garantie 5 ans. Livraison + installation incluses. Assistance sur site disponible en option.",
        items: [
          {
            description: "Lenovo ThinkPad E15 i5, 16 Go RAM, 512 Go SSD",
            quantity: 50,
            unit: "unité",
            unitPrice: 1080,
            totalPrice: 54000
          },
          {
            description: "Lenovo 24\" Monitor FHD",
            quantity: 50,
            unit: "unité",
            unitPrice: 180,
            totalPrice: 9000
          },
          {
            description: "Docking Lenovo USB-C",
            quantity: 50,
            unit: "unité",
            unitPrice: 160,
            totalPrice: 8000
          },
          {
            description: "Casque Plantronics Blackwire",
            quantity: 50,
            unit: "unité",
            unitPrice: 65,
            totalPrice: 3250
          },
          {
            description: "Installation + config",
            quantity: 1,
            unit: "lot",
            unitPrice: 200,
            totalPrice: 200
          }
        ],
        total_ht: 74450,
        tva: 14890,
        total_ttc: 89340
      },
      {
        company: { name: "Global IT Partners", location: "Paris 9ème" },
        commentaire: "Solution économique avec garantie standard 3 ans. Installation incluse. Maintenance optionnelle à 1 200 €/an.",
        items: [
          {
            description: "Acer TravelMate i5, 16 Go RAM, 512 Go SSD",
            quantity: 50,
            unit: "unité",
            unitPrice: 920,
            totalPrice: 46000
          },
          {
            description: "Acer 24\" Monitor",
            quantity: 50,
            unit: "unité",
            unitPrice: 150,
            totalPrice: 7500
          },
          {
            description: "Docking station universelle USB-C",
            quantity: 50,
            unit: "unité",
            unitPrice: 130,
            totalPrice: 6500
          },
          {
            description: "Casque Sennheiser PC 8",
            quantity: 50,
            unit: "unité",
            unitPrice: 55,
            totalPrice: 2750
          },
          {
            description: "Livraison + configuration",
            quantity: 1,
            unit: "lot",
            unitPrice: 600,
            totalPrice: 600
          }
        ],
        total_ht: 63350,
        tva: 12670,
        total_ttc: 76020
      },
      {
        company: { name: "HexaTech", location: "Paris 16ème" },
        commentaire: "Proposition haut de gamme avec stations d'accueil Thunderbolt, support prioritaire 24/7 et garantie sur site 3 ans.",
        items: [
          {
            description: "Apple MacBook Air M2 16 Go RAM, 512 Go SSD",
            quantity: 50,
            unit: "unité",
            unitPrice: 1350,
            totalPrice: 67500
          },
          {
            description: "Écran LG UltraFine 24\"",
            quantity: 50,
            unit: "unité",
            unitPrice: 200,
            totalPrice: 10000
          },
          {
            description: "Docking station Thunderbolt",
            quantity: 50,
            unit: "unité",
            unitPrice: 180,
            totalPrice: 9000
          },
          {
            description: "Casque Bose 700 UC",
            quantity: 50,
            unit: "unité",
            unitPrice: 120,
            totalPrice: 6000
          },
          {
            description: "Installation & config",
            quantity: 1,
            unit: "lot",
            unitPrice: 1500,
            totalPrice: 1500
          }
        ],
        total_ht: 94000,
        tva: 18800,
        total_ttc: 112800
      }
    ];

    const devisToInsert = [];

    for (let i = 0; i < devisData.length; i++) {
      const devisInfo = devisData[i];
      

      const devis = {
        marche_id: marcheId,
        sent_to: userId,
        created_by: crypto.randomUUID(),
        marche_title: marche.title,
        company_name: devisInfo.company.name,
        location: devisInfo.company.location,
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