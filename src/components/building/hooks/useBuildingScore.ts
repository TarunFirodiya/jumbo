
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBuildingScore(id: string) {
  const { data: buildingScore } = useQuery({
    queryKey: ['buildingScore', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // First ensure scores are calculated
      await supabase.functions.invoke('calculate-building-scores', {
        body: { user_id: user.id }
      });

      const { data, error } = await supabase
        .from('user_building_scores')
        .select('*')
        .eq('building_id', id)
        .eq('user_id', user.id)
        .maybeSingle();  // Changed from .single() to .maybeSingle()

      if (error) {
        console.error('Error fetching building score:', error);
        return null;
      }
      
      // data will be null if no row exists
      return data;
    },
  });

  return buildingScore;
}
