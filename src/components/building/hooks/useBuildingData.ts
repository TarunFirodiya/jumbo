
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define a type that includes the features property
type BuildingWithFeatures = {
  id: string;
  name: string;
  amenities?: string[] | null;
  features?: string[] | null;
  [key: string]: any;
};

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
      
      // Ensure backwards compatibility with code expecting 'features'
      if (data && data.amenities) {
        const buildingWithFeatures = data as BuildingWithFeatures;
        buildingWithFeatures.features = data.amenities;
        return buildingWithFeatures;
      }
      
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
    enabled: !!id,
  });

  return {
    building,
    listings,
    isLoading
  };
}
