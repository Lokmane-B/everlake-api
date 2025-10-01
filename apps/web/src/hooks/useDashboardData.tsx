import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DashboardData {
  totalProjects: number;
  activeAO: number;
  receivedDevis: number;
  acceptedDevis: number;
  totalRevenue: number;
  monthlyRevenue: number;
  conversionRate: number;
  averageDevisValue: number;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    totalProjects: 0,
    activeAO: 0,
    receivedDevis: 0,
    acceptedDevis: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    averageDevisValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchDashboardData();

    // Set up realtime subscriptions for all relevant tables
    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `created_by=eq.${user.id}`
        },
        () => fetchDashboardData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marches',
          filter: `created_by=eq.${user.id}`
        },
        () => fetchDashboardData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devis'
        },
        () => fetchDashboardData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch all data in parallel
      const [projectsRes, marchesRes, devisRes] = await Promise.all([
        supabase.from('projects').select('*').eq('created_by', user.id),
        supabase.from('marches').select('*').eq('created_by', user.id),
        supabase.from('devis').select('*').eq('sent_to', user.id),
      ]);

      const projects = projectsRes.data || [];
      const marches = marchesRes.data || [];
      const allDevis = devisRes.data || [];

      // Filter devis to only show received responses from external companies
      // (devis created by others in response to current user's calls for tenders)
      const marcheIds = marches.map((m: any) => m.id);
      const devis = allDevis.filter((d: any) =>
        d.marche_id && marcheIds.includes(d.marche_id) && d.created_by !== user.id
      );

      // Calculate metrics
      const totalProjects = projects.length;
      const activeAO = marches.filter(m => m.status === 'Actif').length;
      const receivedDevis = devis.length;
      const acceptedDevis = devis.filter(d => d.status === 'Accepté').length;
      
      const totalRevenue = devis
        .filter(d => d.status === 'Accepté')
        .reduce((sum, d) => sum + (d.total_ttc || 0), 0);
      
      // Monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = devis
        .filter(d => {
          if (d.status !== 'Accepté' || !d.created_at) return false;
          const devisDate = new Date(d.created_at);
          return devisDate.getMonth() === currentMonth && devisDate.getFullYear() === currentYear;
        })
        .reduce((sum, d) => sum + (d.total_ttc || 0), 0);

      const conversionRate = receivedDevis > 0 ? (acceptedDevis / receivedDevis) * 100 : 0;
      const averageDevisValue = receivedDevis > 0 
        ? devis.reduce((sum, d) => sum + (d.total_ttc || 0), 0) / receivedDevis 
        : 0;

      setData({
        totalProjects,
        activeAO,
        receivedDevis,
        acceptedDevis,
        totalRevenue,
        monthlyRevenue,
        conversionRate,
        averageDevisValue,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    refetch: fetchDashboardData
  };
}