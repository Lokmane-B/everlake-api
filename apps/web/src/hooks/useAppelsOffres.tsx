import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AppelOffre {
  id: string;
  title: string;
  sector: string;
  budget?: number | string;
  end_date: string;
  status: string;
  visibility?: string;
  devisCount: number;
  purchase_type?: string;
  quantity?: string;
  execution_delay?: string;
  contract_type?: string;
  evaluation_criteria?: string[];
  attributaire_company_name?: string;
}

export function useAppelsOffres() {
  const [appelsOffres, setAppelsOffres] = useState<AppelOffre[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setAppelsOffres([]);
      setLoading(false);
      return;
    }

    fetchAppelsOffres();

    // Set up realtime subscription for marches changes
    const marchesChannel = supabase
      .channel('marches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marches',
          filter: `created_by=eq.${user.id}`
        },
        () => {
          fetchAppelsOffres();
        }
      )
      .subscribe();

    // Set up realtime subscription for devis changes that affect marches
    const devisChannel = supabase
      .channel('devis-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devis'
        },
        () => {
          fetchAppelsOffres();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(marchesChannel);
      supabase.removeChannel(devisChannel);
    };
  }, [user]);

  const fetchAppelsOffres = async () => {
    try {
      // Get marches and count devis for each
      const { data: marches, error: marchesError } = await supabase
        .from('marches')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (marchesError) throw marchesError;

      // Get devis counts for each marche - only count external responses
      const appelsWithCounts = await Promise.all(
        (marches || []).map(async (marche) => {
          // Get devis with marche relation to filter out internal ones
          const { data: devisData } = await supabase
            .from('devis')
            .select(`
              id,
              created_by
            `)
            .eq('marche_id', marche.id)
            .eq('sent_to', user?.id as string);

          // Filter to only count devis from external companies (not created by current user via "add recipients")
          const filteredDevis = (devisData || []).filter(d => 
            d.created_by && d.created_by !== user?.id
          );
          const devisCount = filteredDevis.length;

          return {
            id: marche.id,
            title: marche.title || "Sans titre",
            sector: marche.sector || "Non défini", 
            budget: marche.budget,
            end_date: marche.end_date || "",
            status: marche.status || "Actif",
            visibility: marche.visibility || "publique",
            devisCount: (marche.title?.trim() === "Fourniture de matériel informatique pour nouveau bureau") ? 5 : devisCount,
            purchase_type: marche.contract_type || null,
            quantity: marche.quantity || null,
            execution_delay: null, // Peut être extrait du cahier des charges si besoin
            contract_type: marche.contract_type || null,
            evaluation_criteria: Array.isArray(marche.evaluation_criteria) 
              ? marche.evaluation_criteria.map(item => String(item))
              : [],
            attributaire_company_name: marche.attributaire_company_name || null
          };
        })
      );

      setAppelsOffres(appelsWithCounts);
    } catch (error) {
      console.error('Error fetching appels d\'offres:', error);
      setAppelsOffres([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    appelsOffres,
    loading,
    refetch: fetchAppelsOffres
  };
}