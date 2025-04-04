
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { normalizeImageArray, processMediaContent, extractRegularPhotos, extractAiStagedPhotos } from "@/utils/mediaProcessing";

// Define a type that includes the proper properties
export type BuildingWithFeatures = Tables<"buildings">;

// Define a type for listings with properly typed images that extends the base listing type
export type ListingWithProcessedImages = Tables<"listings"> & {
  images: string[] | null;
  ai_staged_photos: string[] | null;
  processedMediaContent?: {
    photos: Record<string, string[]>;
    aiStagedPhotos: Record<string, string[]>;
    video: string | null;
    streetView: string | null;
    floorPlan: string | null;
    thumbnail: string | null;
  } | null;
};

export function useBuildingData(id: string) {
  const { toast } = useToast();
  
  // Validate UUID format first
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  const { data: building, isLoading, error: buildingError } = useQuery({
    queryKey: ['building', id],
    queryFn: async () => {
      try {
        console.log("Fetching building with ID:", id);
        
        if (!isValidUUID) {
          console.error("Invalid UUID format:", id);
          throw new Error(`Invalid UUID format: ${id}`);
        }
        
        const { data, error } = await supabase
          .from('buildings')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        // Process images to ensure they're an array
        if (data) {
          const buildingWithFeatures = data as BuildingWithFeatures;
          
          // Check if we have the new media_content field
          if (buildingWithFeatures.media_content) {
            console.log("Building has new media_content format:", buildingWithFeatures.media_content);
            const processedContent = processMediaContent(buildingWithFeatures.media_content as Record<string, string[]>);
            
            // Use processed content to set legacy fields for backward compatibility
            buildingWithFeatures.images = extractRegularPhotos(processedContent);
            buildingWithFeatures.video_thumbnail = processedContent.video;
            buildingWithFeatures.street_view = processedContent.streetView;
            // We don't save floor plan at building level typically
            
            console.log("Building with processed media content:", {
              regularImages: buildingWithFeatures.images,
              video: buildingWithFeatures.video_thumbnail,
              streetView: buildingWithFeatures.street_view
            });
          } else {
            // Normalize legacy images
            buildingWithFeatures.images = normalizeImageArray(buildingWithFeatures.images);
            console.log("Building with normalized legacy images:", buildingWithFeatures.images);
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
    enabled: id !== "" && isValidUUID,
  });

  const { data: listings, error: listingsError } = useQuery({
    queryKey: ['listings', id],
    queryFn: async () => {
      try {
        console.log("Fetching listings for building ID:", id);
        
        if (!isValidUUID) {
          console.error("Invalid UUID format:", id);
          throw new Error(`Invalid UUID format: ${id}`);
        }
        
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('building_id', id);

        if (error) {
          console.error("Supabase listings error:", error);
          throw error;
        }
        
        // Process listing images to ensure proper typing
        const processedListings = data?.map(listing => {
          // Create a safe copy of the listing to modify with properly typed fields
          const processedListing = { ...listing } as ListingWithProcessedImages;
          
          console.log(`Processing listing ${listing.id}:`);
          
          // Check if we have the new media_content field
          if (processedListing.media_content) {
            console.log(`- Listing has new media_content format:`, processedListing.media_content);
            const processedContent = processMediaContent(processedListing.media_content as Record<string, string[]>);
            
            // Store the processed content for easy access
            processedListing.processedMediaContent = processedContent;
            
            // Set legacy fields for backward compatibility
            processedListing.images = extractRegularPhotos(processedContent);
            processedListing.ai_staged_photos = extractAiStagedPhotos(processedContent);
            processedListing.floor_plan_image = processedContent.floorPlan;
            processedListing.thumbnail_image = processedContent.thumbnail || 
              (extractAiStagedPhotos(processedContent)[0] || extractRegularPhotos(processedContent)[0] || null);
            
            console.log(`- Processed from media_content:`, {
              regularImages: processedListing.images,
              aiStagedPhotos: processedListing.ai_staged_photos,
              floorPlan: processedListing.floor_plan_image,
              thumbnail: processedListing.thumbnail_image
            });
          } else {
            // Using legacy format, normalize the arrays
            console.log(`- Using legacy format for listing ${listing.id}`);
            console.log(`- Original images:`, listing.images);
            console.log(`- Original AI staged photos:`, listing.ai_staged_photos);
            console.log(`- Thumbnail image:`, listing.thumbnail_image);
            
            // Process regular images
            processedListing.images = normalizeImageArray(listing.images);
            
            // Process AI staged photos
            processedListing.ai_staged_photos = normalizeImageArray(listing.ai_staged_photos);
            
            console.log(`- Processed regular images:`, processedListing.images);
            console.log(`- Processed AI staged photos:`, processedListing.ai_staged_photos);
          }
          
          return processedListing;
        });
        
        return processedListings;
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
    enabled: !!id && id !== "" && isValidUUID,
    retry: 2,
  });

  return {
    building,
    listings,
    isLoading,
    error: buildingError || listingsError,
    isValidId: isValidUUID
  };
}
