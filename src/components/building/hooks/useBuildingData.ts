
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { normalizeImageArray } from "@/utils/mediaProcessing";

// Define a type that includes the proper properties
export type BuildingWithFeatures = Tables<"buildings">;

// Define a type for listings with properly typed images that extends the base listing type
export type ListingWithProcessedImages = Tables<"listings"> & {
  images: string[] | null;
  ai_staged_photos: string[] | null;
  media_metadata?: {
    regularImages: string[];
    aiStagedPhotos: string[];
    floorPlan: string | null;
    video: string | null;
    streetView: string | null;
    lastUpdated: string;
  } | null;
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
        
        // Process images to ensure they're an array
        if (data) {
          const buildingWithFeatures = data as BuildingWithFeatures;
          
          // Normalize images to array format
          buildingWithFeatures.images = normalizeImageArray(buildingWithFeatures.images);
          
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
        
        // Process listing images to ensure proper typing
        return data?.map(listing => {
          // Create a safe copy of the listing to modify with properly typed fields
          const processedListing = { ...listing } as ListingWithProcessedImages;
          
          // Process regular images
          processedListing.images = normalizeImageArray(listing.images);
          
          // Process AI staged photos
          processedListing.ai_staged_photos = normalizeImageArray(listing.ai_staged_photos);
          
          // Use media_metadata if available, otherwise generate a default structure
          if (!processedListing.media_metadata) {
            processedListing.media_metadata = {
              regularImages: processedListing.images || [],
              aiStagedPhotos: processedListing.ai_staged_photos || [],
              floorPlan: listing.floor_plan_image || null,
              video: null,
              streetView: null,
              lastUpdated: new Date().toISOString()
            };
          }
          
          return processedListing;
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
