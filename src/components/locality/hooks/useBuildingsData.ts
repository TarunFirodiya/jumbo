
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export function useBuildingsData(user: any, locality: string | undefined, selectedCollections: string[]) {
  // Get user's building scores (for shortlist status)
  const { data: buildingScores, refetch: refetchBuildingScores } = useQuery({
    queryKey: ['buildingScores', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_building_scores')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching building scores:', error);
        throw error;
      }
      return data.reduce((acc, score) => {
        acc[score.building_id] = {
          shortlisted: score.shortlisted
        };
        return acc;
      }, {} as Record<string, any>);
    },
    enabled: !!user,
  });

  // Get buildings data
  const { data: buildings, isLoading: buildingsLoading } = useQuery({
    queryKey: ['buildings', locality, selectedCollections],
    queryFn: async () => {
      let query = supabase
        .from('buildings')
        .select('*');
      
      if (locality) {
        query = query.eq('locality', decodeURIComponent(locality));
      }
      
      if (selectedCollections.length > 0) {
        query = query.contains('collections', selectedCollections);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching buildings:', error);
        throw error;
      }
      
      return data;
    },
  });

  return {
    buildings,
    buildingsLoading,
    buildingScores,
    refetchBuildingScores
  };
}
