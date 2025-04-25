
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

// Define a type that includes the features property
export type BuildingWithFeatures = {
  id: string;
  name: string;
  amenities?: string[] | null;
  features?: string[] | null;
  nearby_places?: any | null;
  [key: string]: any;
};

// Define a type for listings with properly typed images that extends the base listing type
export type ListingWithProcessedImages = Tables<"listings"> & {
  images: string[] | null;
};

export function useBuildingData(id: string) {
  const { toast } = useToast();
  
  const { data: building, isLoading, error: buildingError } = useQuery({
    queryKey: ['building', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('buildings')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // Ensure backwards compatibility with code expecting 'features'
        if (data) {
          const buildingWithFeatures = data as BuildingWithFeatures;
          // Only set features if it doesn't already exist
          if (!buildingWithFeatures.features && buildingWithFeatures.amenities) {
            buildingWithFeatures.features = buildingWithFeatures.amenities;
          }
          
          // Process images to ensure they're an array
          if (typeof buildingWithFeatures.images === 'string') {
            try {
              // Some images might be stored as comma-separated strings
              const imageStr = buildingWithFeatures.images as string;
              if (imageStr.includes(',')) {
                buildingWithFeatures.images = imageStr.split(',').map(img => img.trim());
              } else {
                buildingWithFeatures.images = [imageStr];
              }
            } catch (e) {
              console.error('Error processing building images:', e);
              buildingWithFeatures.images = buildingWithFeatures.images ? [buildingWithFeatures.images as string] : [];
            }
          }
          
          return buildingWithFeatures;
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching building data:', error);
        toast({
          title: "Error loading building data",
          description: "Please try again later",
          variant: "destructive"
        });
        throw error;
      }
    },
    retry: 2,
  });

  const { data: listings, error: listingsError } = useQuery({
    queryKey: ['listings', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('building_id', id);

        if (error) throw error;
        
        // Process listing images if needed
        return data?.map(listing => {
          // Create a safe copy of the listing to modify with properly typed images field
          const updatedListing = { ...listing } as ListingWithProcessedImages;
          
          if (typeof listing.images === 'string') {
            try {
              // Try to parse as JSON first
              updatedListing.images = JSON.parse(listing.images);
            } catch (e) {
              // If can't parse as JSON, try as comma-separated string
              const imagesStr = listing.images as string;
              if (imagesStr.includes(',')) {
                updatedListing.images = imagesStr.split(',').map(img => img.trim());
              } else {
                // If it's just a single string and not JSON or comma-separated
                updatedListing.images = [imagesStr];
              }
            }
          } else if (Array.isArray(listing.images)) {
            // If it's already an array, keep it
            updatedListing.images = listing.images;
          } else {
            // If images is null or undefined, set as empty array
            updatedListing.images = [];
          }
          
          return updatedListing;
        });
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast({
          title: "Error loading property listings",
          description: "Please try again later",
          variant: "destructive"
        });
        throw error;
      }
    },
    enabled: !!id,
    retry: 2,
  });

  return {
    building,
    listings,
    isLoading,
    error: buildingError || listingsError
  };
}
