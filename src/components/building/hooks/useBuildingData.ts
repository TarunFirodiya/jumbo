
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBuildingData(id: string) {
  const { data: building, isLoading } = useQuery({
    queryKey: ['building', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: listings } = useQuery({
    queryKey: ['listings', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('building_id', id);

      if (error) throw error;
      return data;
    },
  });

  return {
    building,
    listings,
    isLoading
  };
}
