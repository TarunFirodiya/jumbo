
import { useState, useEffect } from "react";
import { MapPin, Heart, Star, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BuildingHeaderProps {
  name: string;
  locality: string;
  googleRating?: number;
  isShortlisted: boolean;
  onToggleShortlist: () => void;
  startingPrice?: number;
  onShareClick?: () => void;
}

export function BuildingHeader({
  name,
  locality,
  googleRating,
  isShortlisted,
  onToggleShortlist,
  startingPrice,
  onShareClick,
}: BuildingHeaderProps) {
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [currentShortlistedState, setCurrentShortlistedState] = useState(isShortlisted);
  
  // Update local state when prop changes
  useEffect(() => {
    setCurrentShortlistedState(isShortlisted);
  }, [isShortlisted]);
  
  const handleToggleShortlist = () => {
    setIsShortlisting(true);
    // Optimistically update UI
    setCurrentShortlistedState(!currentShortlistedState);
    // Call the actual toggle function
    onToggleShortlist();
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsShortlisting(false);
    }, 800);
  };
  
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
          <span>{locality}</span>
        </div>
        {startingPrice && (
          <div className="mt-1 text-sm font-medium">
            Starting at ₹{(startingPrice/10000000).toFixed(1)} Cr
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {googleRating && (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              {renderStars(googleRating)}
              <span className="font-semibold ml-1">{googleRating}</span>
            </div>
            <span className="text-sm text-muted-foreground">Google Ratings</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          {onShareClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onShareClick}
              className="text-gray-400 hover:text-gray-500 hover:scale-105 transition-transform"
            >
              <Share2 className="h-6 w-6" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleShortlist}
            className={cn(
              "transition-all",
              currentShortlistedState ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-gray-500",
              isShortlisting ? "scale-125" : "hover:scale-105"
            )}
          >
            <Heart 
              className={cn(
                "h-6 w-6 transition-all duration-300", 
                currentShortlistedState && "fill-current",
                isShortlisting && !currentShortlistedState && "animate-pulse fill-red-500"
              )} 
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
