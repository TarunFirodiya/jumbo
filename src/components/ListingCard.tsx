import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeIndianRupee, Bed, Square, Compass, Layers } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useState } from "react";
import { VisitRequestModal } from "./VisitRequestModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ListingCardCarousel } from "./building/ListingCardCarousel";
import { normalizeImageArray } from "@/utils/mediaProcessing";

type ListingCardProps = {
  listing: Tables<"listings">;
};

export default function ListingCard({ listing }: ListingCardProps) {
  const [showVisitModal, setShowVisitModal] = useState(false);
  
  // Get current user
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const handleVisitRequest = () => {
    // If user is not logged in, trigger auth modal directly
    if (!user) {
      document.dispatchEvent(new CustomEvent('triggerAuthModal', {
        detail: { action: 'visit' }
      }));
      return;
    }
    
    // Otherwise show the visit modal
    setShowVisitModal(true);
  };

  // Process images to ensure they are arrays
  const images = normalizeImageArray(listing.images);
  const aiStagedPhotos = normalizeImageArray(listing.ai_staged_photos);
  
  console.log("[ListingCard] Processing images for listing:", listing.id);
  console.log("[ListingCard] Thumbnail:", listing.thumbnail_image);
  console.log("[ListingCard] Images:", images);
  console.log("[ListingCard] AI Images:", aiStagedPhotos);
  
  // Clear distinction between the thumbnail source and image sources
  const thumbnailImage = listing.thumbnail_image || null;

  return (
    <Card className="overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow">
      {/* Carousel for listing images */}
      <div className="relative">
        <ListingCardCarousel 
          images={images}
          thumbnailImage={thumbnailImage}
          aiStagedPhotos={aiStagedPhotos}
          alt={`Listing in ${listing.building_name}`}
        />
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <BadgeIndianRupee className="h-5 w-5 text-muted-foreground" />
          <span>{listing.price?.toLocaleString()}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4 text-muted-foreground" />
            <span>{listing.built_up_area} sq.ft</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <span>{listing.bedrooms} Bed</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span>Floor {listing.floor}</span>
          </div>

          {listing.facing && (
            <div className="flex items-center gap-1">
              <Compass className="h-4 w-4 text-muted-foreground" />
              <span>{listing.facing}</span>
            </div>
          )}
        </div>

        <Button 
          onClick={handleVisitRequest} 
          className="w-full"
        >
          Request a Visit
        </Button>

        {/* Only render the modal if user is authenticated */}
        {user && (
          <VisitRequestModal
            open={showVisitModal}
            onOpenChange={setShowVisitModal}
            buildingId={listing.building_id || ""}
            buildingName={listing.building_name || ""}
            listingId={listing.id}
          />
        )}
      </div>
    </Card>
  );
}
