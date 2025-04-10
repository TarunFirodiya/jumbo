
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, CalendarDays, Building2, Home, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateBuildingSlug } from "@/utils/slugUtils";
import { Tables } from "@/integrations/supabase/types";

interface BuildingCardProps {
  building: Tables<"buildings">; // Using the correct type from Supabase types
  onNavigate: (path: string) => void;
  onShortlist: (buildingId: string) => void;
  isShortlisted: boolean;
}

export function BuildingCard({
  building,
  onNavigate,
  onShortlist,
  isShortlisted
}: BuildingCardProps) {
  const [isShortlisting, setIsShortlisting] = useState(false);
  
  const handleShortlist = (e: React.MouseEvent, buildingId: string) => {
    e.stopPropagation();
    setIsShortlisting(true);
    onShortlist(buildingId);
    
    setTimeout(() => {
      setIsShortlisting(false);
    }, 800);
  };

  // Generate SEO-friendly URL slug
  const slug = generateBuildingSlug(
    building.name,
    building.locality || '',
    building.bhk_types || [],
    building.id
  );
  
  return (
    <Card 
      key={building.id} 
      className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      onClick={() => onNavigate(`/property/${slug}`)}
    >
      <div className="relative bg-muted">
        {building.images && building.images.length > 0 ? (
          <div className="aspect-[4/3]">
            <img 
              src={building.images[0]} 
              alt={building.name}
              className="w-full h-full object-cover" 
            />
          </div>
        ) : (
          <div className="aspect-[4/3] flex items-center justify-center bg-slate-100">
            <Building2 className="h-12 w-12 text-slate-300" />
          </div>
        )}
        <button
          onClick={(e) => handleShortlist(e, building.id)}
          className={cn(
            "absolute top-2 right-2 p-2 z-10 transition-all",
            isShortlisting ? "scale-125" : "hover:scale-110"
          )}
        >
          <Heart
            className={cn(
              "h-6 w-6 transition-all duration-300",
              isShortlisted 
                ? "fill-red-500 stroke-red-500" 
                : "stroke-white fill-black/20 group-hover:fill-black/30",
              isShortlisting && !isShortlisted && "animate-pulse fill-red-500 stroke-red-500"
            )}
          />
        </button>
      </div>
      <CardContent className="p-4 group-hover:bg-slate-50 transition-colors duration-300">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold line-clamp-1">{building.name}</h3>
            {building.google_rating && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                <span className="font-medium">{building.google_rating}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{building.locality || 'Unknown location'}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {building.age && (
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{building.age} years</span>
              </div>
            )}
            {building.total_floors && (
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{building.total_floors} floors</span>
              </div>
            )}
            {building.bhk_types && building.bhk_types.length > 0 && (
              <div className="flex items-center gap-1">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{building.bhk_types.join(", ")} BHK</span>
              </div>
            )}
          </div>
          <div className="flex items-baseline">
            <span className="text-xs text-muted-foreground mr-1">Starting at</span>
            <span className="text-lg font-semibold">
              ₹{(building.min_price ? (building.min_price/10000000).toFixed(1) : "N/A")} Cr
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
