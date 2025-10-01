import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Devis {
  id: string;
  marche_id: string | null;
  marche_title: string | null;
  company_name: string | null;
  location: string | null;
  status: string | null;
  total_ht: number | null;
  tva: number | null;
  total_ttc: number | null;
  commentaire: string | null;
  items: any[];
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  marche_sector?: string | null;
  marche_end_date?: string | null;
}

export function useDevis() {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setDevis([]);
      setLoading(false);
      return;
    }

    fetchDevis();

    // Set up realtime subscription
    const channel = supabase
      .channel('devis-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devis'
        },
        (payload) => {
          console.log('Devis realtime update:', payload);
          fetchDevis(); // Refetch to ensure consistency
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchDevis = async () => {
    try {
      const { data, error } = await supabase
        .from('devis')
        .select(`
          *,
          marche:marches(
            sector,
            end_date,
            created_by
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter to show only devis created by current user (not received devis)
      const filteredData = (data || []).filter(devis => 
        devis.created_by === user?.id
      );
      
      setDevis(filteredData.map(devis => ({
        ...devis,
        items: Array.isArray(devis.items) ? devis.items : [],
        marche_sector: devis.marche?.sector,
        marche_end_date: devis.marche?.end_date
      })));
    } catch (error) {
      console.error('Error fetching devis:', error);
      setDevis([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    devis,
    loading,
    refetch: fetchDevis
  };
}