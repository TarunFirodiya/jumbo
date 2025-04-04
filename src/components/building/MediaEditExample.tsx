
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MediaUploader } from "./MediaUploader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BuildingWithMedia, ListingWithMedia } from "@/types/mediaTypes";

interface MediaEditExampleProps {
  buildingId?: string;
  listingId?: string;
  initialBuildingMedia?: Record<string, string[]> | null;
  initialListingMedia?: Record<string, string[]> | null;
}

export function MediaEditExample({
  buildingId,
  listingId,
  initialBuildingMedia = {},
  initialListingMedia = {}
}: MediaEditExampleProps) {
  const [buildingMediaContent, setBuildingMediaContent] = useState<Record<string, string[]>>(initialBuildingMedia || {});
  const [listingMediaContent, setListingMediaContent] = useState<Record<string, string[]>>(initialListingMedia || {});
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Save building media if we have a building ID
      if (buildingId) {
        const { error: buildingError } = await supabase
          .from('buildings')
          .update({
            media_content: buildingMediaContent
          } as Partial<BuildingWithMedia>)
          .eq('id', buildingId);
          
        if (buildingError) throw buildingError;
      }
      
      // Save listing media if we have a listing ID
      if (listingId) {
        const { error: listingError } = await supabase
          .from('listings')
          .update({
            media_content: listingMediaContent
          } as Partial<ListingWithMedia>)
          .eq('id', listingId);
          
        if (listingError) throw listingError;
      }
      
      toast.success("Media content saved successfully");
    } catch (error) {
      console.error("Error saving media content:", error);
      toast.error("Failed to save media content");
    } finally {
      setIsLoading(false);
    }
  }, [buildingId, listingId, buildingMediaContent, listingMediaContent]);

  return (
    <div className="space-y-6">
      {buildingId && (
        <Card>
          <CardHeader>
            <CardTitle>Building Media</CardTitle>
            <CardDescription>
              Manage media content related to the building's common areas, exterior, and facilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MediaUploader 
              mediaContent={buildingMediaContent}
              onMediaContentChange={setBuildingMediaContent}
            />
          </CardContent>
        </Card>
      )}
      
      {listingId && (
        <Card>
          <CardHeader>
            <CardTitle>Listing Media</CardTitle>
            <CardDescription>
              Manage media content for this specific unit including interior photos and floor plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MediaUploader 
              mediaContent={listingMediaContent}
              onMediaContentChange={setListingMediaContent}
            />
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
