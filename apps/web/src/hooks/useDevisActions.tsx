import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface DevisAction {
  acceptDevis: (devisId: string) => Promise<void>;
  refuseDevis: (devisId: string) => Promise<void>;
  selectDevis: (devisId: string, marcheId: string, companyName: string) => Promise<void>;
  loading: boolean;
}

export function useDevisActions(): DevisAction {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const acceptDevis = async (devisId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('devis')
        .update({ status: 'Accepté' })
        .eq('id', devisId)
        .eq('sent_to', user.id);

      if (error) throw error;

      toast({
        title: "Devis accepté",
        description: "Le devis a été accepté avec succès."
      });
    } catch (error) {
      console.error('Error accepting devis:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accepter le devis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refuseDevis = async (devisId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('devis')
        .update({ status: 'Refusé' })
        .eq('id', devisId)
        .eq('sent_to', user.id);

      if (error) throw error;

      toast({
        title: "Devis refusé",
        description: "Le devis a été refusé."
      });
    } catch (error) {
      console.error('Error refusing devis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de refuser le devis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectDevis = async (devisId: string, marcheId: string, companyName: string) => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Mettre à jour le statut du devis sélectionné
      const { error: devisError } = await supabase
        .from('devis')
        .update({ status: 'Sélectionné' })
        .eq('id', devisId)
        .eq('sent_to', user.id);

      if (devisError) throw devisError;

      // Mettre à jour le marché avec l'attributaire et changer le statut
      const { error: marcheError } = await supabase
        .from('marches')
        .update({ 
          attributaire_company_name: companyName,
          attributaire_devis_id: devisId,
          status: 'Attribué'
        })
        .eq('id', marcheId)
        .eq('created_by', user.id);

      if (marcheError) throw marcheError;

      // Marquer les autres devis du même marché comme "Refusé"
      const { error: otherDevisError } = await supabase
        .from('devis')
        .update({ status: 'Refusé' })
        .eq('marche_id', marcheId)
        .eq('sent_to', user.id)
        .neq('id', devisId);

      if (otherDevisError) {
        console.warn('Warning updating other devis:', otherDevisError);
      }

      toast({
        title: "Devis sélectionné",
        description: `Le devis de ${companyName} a été sélectionné et l'appel d'offres a été attribué.`
      });
    } catch (error) {
      console.error('Error selecting devis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sélectionner le devis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    acceptDevis,
    refuseDevis,
    selectDevis,
    loading
  };
}