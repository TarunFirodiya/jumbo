import { MapPin, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BuildingHeaderProps {
  name: string;
  locality: string;
  subLocality: string;
  googleRating?: number;
  isShortlisted: boolean;
  onToggleShortlist: () => void;
}

export function BuildingHeader({
  name,
  locality,
  subLocality,
  googleRating,
  isShortlisted,
  onToggleShortlist,
}: BuildingHeaderProps) {
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ));
  };

  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-semibold">{name}</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{locality}{subLocality && `, ${subLocality}`}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {googleRating && (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              {renderStars(googleRating)}
              <span className="font-semibold ml-1">{googleRating}</span>
            </div>
            <span className="text-sm text-muted-foreground">The people's voice!</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleShortlist}
          className={cn(
            "transition-colors",
            isShortlisted && "text-red-500 hover:text-red-600"
          )}
        >
          <Heart className={cn("h-5 w-5", isShortlisted && "fill-current")} />
        </Button>
      </div>
    </div>
  );
}