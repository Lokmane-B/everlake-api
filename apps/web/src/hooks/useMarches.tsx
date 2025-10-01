import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Marche {
  id: string;
  title: string;
  sector: string | null;
  budget: string | null;
  end_date: string | null;
  start_date: string | null;
  location: string | null;
  contract_type: string | null;
  description: string | null;
  cahier_des_charges: string | null;
  evaluation_criteria: any;
  documents: any;
  visibility: string | null;
  status: string | null;
  company_name: string | null;
  created_at: string;
  created_by: string | null;
  quantity: string | null;
}

export const useMarches = () => {
  const [marches, setMarches] = useState<Marche[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMarches = async () => {
    try {
      setLoading(true);
      
      // Only fetch if user is authenticated (security fix)
      if (!user) {
        setMarches([]);
        return;
      }
      
      // Récupérer tous les marchés publics (visibilité = 'publique')
      const { data, error } = await supabase
        .from('marches')
        .select('*')
        .eq('visibility', 'publique')
        .in('status', ['Actif', 'Attribué']) // Inclure les marchés attribués
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des marchés:', error);
        return;
      }

      setMarches(data as Marche[] || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMarcheById = async (id: string): Promise<Marche | null> => {
    try {
      // Only fetch if user is authenticated (security fix)
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('marches')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Erreur lors de la récupération du marché:', error);
        return null;
      }

      return data as Marche;
    } catch (error) {
      console.error('Erreur:', error);
      return null;
    }
  };

  const refetch = () => {
    fetchMarches();
  };

  useEffect(() => {
    fetchMarches();

    // Set up realtime subscription for marches changes
    const channel = supabase
      .channel('marches-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marches'
        },
        () => {
          fetchMarches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]); // Re-fetch when user authentication changes

  return {
    marches,
    loading,
    refetch,
    getMarcheById
  };
};