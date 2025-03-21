
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

// Define a type that includes the proper properties
export type BuildingWithFeatures = Tables<"buildings">;

// Define a type for listings with properly typed images that extends the base listing type
export type ListingWithProcessedImages = Tables<"listings"> & {
  images: string[] | null;
  ai_staged_photos: string[] | null;
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
          
          if (typeof buildingWithFeatures.images === 'string') {
            try {
              // Some images might be stored as comma-separated strings
              const imageStr = buildingWithFeatures.images as unknown as string;
              if (imageStr.includes(',')) {
                buildingWithFeatures.images = imageStr.split(',').map(img => img.trim());
              } else {
                buildingWithFeatures.images = [imageStr];
              }
            } catch (e) {
              console.error('Error processing building images:', e);
              buildingWithFeatures.images = buildingWithFeatures.images ? [buildingWithFeatures.images as unknown as string] : [];
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
          
          // Process regular images
          if (typeof listing.images === 'string') {
            try {
              // Try to parse as JSON first
              updatedListing.images = JSON.parse(listing.images as unknown as string);
            } catch (e) {
              // If can't parse as JSON, try as comma-separated string
              const imagesStr = listing.images as unknown as string;
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
          
          // Process AI staged photos if they exist
          // First, check if the property exists in the database response
          const aiPhotos = (listing as any).ai_staged_photos;
          
          if (typeof aiPhotos === 'string') {
            try {
              updatedListing.ai_staged_photos = JSON.parse(aiPhotos);
            } catch (e) {
              const photosStr = aiPhotos;
              if (photosStr.includes(',')) {
                updatedListing.ai_staged_photos = photosStr.split(',').map(img => img.trim());
              } else {
                updatedListing.ai_staged_photos = [photosStr];
              }
            }
          } else if (Array.isArray(aiPhotos)) {
            updatedListing.ai_staged_photos = aiPhotos;
          } else {
            updatedListing.ai_staged_photos = [];
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
