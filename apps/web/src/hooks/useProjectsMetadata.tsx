import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ProjectMetadata {
  projectId: string;
  sectors: string[];
  locations: string[];
  aoCount: number;
}

export function useProjectsMetadata() {
  const [metadata, setMetadata] = useState<ProjectMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setMetadata([]);
      setLoading(false);
      return;
    }

    fetchMetadata();
  }, [user]);

  const fetchMetadata = async () => {
    try {
      const { data: marches, error } = await supabase
        .from('marches')
        .select('project_id, sector, location')
        .eq('created_by', user?.id)
        .not('project_id', 'is', null);

      if (error) throw error;

      // Group by project_id and aggregate
      const projectGroups = (marches || []).reduce((acc, marche) => {
        if (!marche.project_id) return acc;
        
        if (!acc[marche.project_id]) {
          acc[marche.project_id] = {
            sectors: new Set<string>(),
            locations: new Set<string>(),
            count: 0
          };
        }
        
        if (marche.sector) acc[marche.project_id].sectors.add(marche.sector);
        if (marche.location) acc[marche.project_id].locations.add(marche.location);
        acc[marche.project_id].count++;
        
        return acc;
      }, {} as Record<string, { sectors: Set<string>; locations: Set<string>; count: number }>);

      const metadataList = Object.entries(projectGroups).map(([projectId, data]) => ({
        projectId,
        sectors: Array.from(data.sectors),
        locations: Array.from(data.locations),
        aoCount: data.count
      }));

      setMetadata(metadataList);
    } catch (error) {
      console.error('Error fetching projects metadata:', error);
      setMetadata([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    metadata,
    loading,
    refetch: fetchMetadata
  };
}