
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBuildingScore(id: string) {
  const { data: buildingScore } = useQuery({
    queryKey: ['buildingScore', id],
    queryFn: async () => {
      console.log('Fetching building score for building:', id);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return null;
      }

      console.log('Calculating scores for user:', user.id);
      
      // First ensure scores are calculated
      const { data: calculationResult, error: calculationError } = await supabase.functions.invoke('calculate-building-scores', {
        body: { user_id: user.id }
      });

      if (calculationError) {
        console.error('Error calculating building scores:', calculationError);
      } else {
        console.log('Score calculation result:', calculationResult);
      }

      const { data, error } = await supabase
        .from('user_building_scores')
        .select('*')
        .eq('building_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching building score:', error);
        return null;
      }
      
      console.log('Building score data:', data);
      return data;
    },
    // Add retry logic in case of failures
    retry: 3,
    // Refresh data every minute to ensure we have latest scores
    refetchInterval: 60000,
  });

  return buildingScore;
}
