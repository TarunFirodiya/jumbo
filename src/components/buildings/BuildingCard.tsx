
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { ListingCardCarousel } from "@/components/building/ListingCardCarousel";
import { formatPrice } from "@/lib/utils";
import { processMediaContent, extractRegularPhotos, extractAiStagedPhotos } from "@/utils/mediaUtils";

interface BuildingCardProps {
  building: Tables<"buildings">;
  onNavigate: (path: string) => void;
  onShortlist: (buildingId: string) => void;
  isShortlisted: boolean;
}

export function BuildingCard({ building, onNavigate, onShortlist, isShortlisted }: BuildingCardProps) {
  const navigate = useNavigate();
  
  // Process media content for images
  const content = processMediaContent(building.media_content);
  const images = extractRegularPhotos(content);
  const aiStagedPhotos = extractAiStagedPhotos(content);
  const thumbnailImage = content.thumbnail;

  console.log(`[BuildingCard ${building.id}] Processing media content:`, building.media_content);
  console.log(`[BuildingCard ${building.id}] Extracted images:`, images);
  console.log(`[BuildingCard ${building.id}] AI staged photos:`, aiStagedPhotos);
  console.log(`[BuildingCard ${building.id}] Thumbnail:`, thumbnailImage);
  
  const handleClick = () => {
    // Create a safe slug using BHK types instead of bedrooms property
    const bhkInfo = building.bhk_types && building.bhk_types.length > 0 
      ? `${building.bhk_types[0]}-bhk-` 
      : '';
    
    const slug = building.name
      ? `${bhkInfo}${building.name.toLowerCase().replace(/\s+/g, '-')}-${building.locality ? building.locality.toLowerCase().replace(/\s+/g, '-') : 'location'}-${building.id}`
      : `property-${building.id}`;
    
    onNavigate(`/property/${slug}`);
  };

  const handleShortlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShortlist(building.id);
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow flex flex-col h-full" 
      onClick={handleClick}
    >
      <div className="relative">
        {images.length > 0 || thumbnailImage ? (
          <ListingCardCarousel 
            images={images}
            thumbnailImage={thumbnailImage}
            aiStagedPhotos={aiStagedPhotos}
            alt={`${building.name || 'Building'} in ${building.locality || 'Location'}`}
          />
        ) : (
          <div className="aspect-video bg-gray-200 flex items-center justify-center">
            <Building2 className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 h-8 w-8 rounded-full ${
            isShortlisted ? 'bg-primary text-white' : 'bg-white/80 text-gray-600'
          } hover:scale-110 transition-all shadow-sm`}
          onClick={handleShortlistClick}
        >
          <Heart className={`h-4 w-4 ${isShortlisted ? 'fill-white' : ''}`} />
          <span className="sr-only">Shortlist</span>
        </Button>
      </div>
      
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{building.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-1">
            {building.locality}
            {building.sub_locality ? `, ${building.sub_locality}` : ''}
          </p>
        </div>
        
        <div className="mt-4">
          {building.min_price ? (
            <p className="font-medium">From {formatPrice(building.min_price)}</p>
          ) : (
            <p className="text-muted-foreground text-sm">Price on request</p>
          )}
        </div>
      </div>
    </Card>
  );
}
