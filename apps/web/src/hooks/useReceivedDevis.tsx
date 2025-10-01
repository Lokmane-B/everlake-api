import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ReceivedDevis {
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
}

export function useReceivedDevis() {
  const [devis, setDevis] = useState<ReceivedDevis[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.log('[useReceivedDevis] No user, skip fetch');
      setDevis([]);
      setLoading(false);
      return;
    }

    fetchDevis();

    // Set up realtime subscription for devis and marches changes
    const devisChannel = supabase
      .channel('received-devis-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devis'
        },
        () => {
          fetchDevis();
        }
      )
      .subscribe();

    const marchesChannel = supabase
      .channel('marches-for-received-devis')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marches'
        },
        () => {
          fetchDevis();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(devisChannel);
      supabase.removeChannel(marchesChannel);
    };
  }, [user]);

  const fetchDevis = async () => {
    try {
      console.log('[useReceivedDevis] Fetch for user', user?.id);
      const { data, error } = await supabase
        .from('devis')
        .select('*')
        .eq('sent_to', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('[useReceivedDevis] Received devis count', data?.length);
      setDevis((data || []).map(d => ({
        ...d,
        items: Array.isArray(d.items) ? d.items : [],
      })));
    } catch (e) {
      console.error('Error fetching received devis:', e);
      setDevis([]);
    } finally {
      setLoading(false);
    }
  };

  return { devis, loading, refetch: fetchDevis };
}
