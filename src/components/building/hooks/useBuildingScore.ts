
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBuildingScore(id: string) {
  const { data: buildingScore } = useQuery({
    queryKey: ['buildingScore', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_building_scores')
        .select('*')
        .eq('building_id', id)
        .eq('user_id', user.id)
        .single();

      if (error) return null;
      return data;
    },
  });

  return buildingScore;
}
