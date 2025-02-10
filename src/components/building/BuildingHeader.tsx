
import { MapPin, Heart, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { MatchScore } from "@/components/MatchScore";

interface BuildingHeaderProps {
  name: string;
  locality: string;
  googleRating?: number;
  isShortlisted: boolean;
  onToggleShortlist: () => void;
  startingPrice?: number;
  matchScore?: number;
  onScoreClick?: () => void;
}

export function BuildingHeader({
  name,
  locality,
  googleRating,
  isShortlisted,
  onToggleShortlist,
  startingPrice,
  matchScore,
  onScoreClick,
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
      <div className="flex items-start gap-4">
        {typeof matchScore === 'number' && (
          <div 
            className="cursor-pointer" 
            onClick={onScoreClick}
          >
            <MatchScore score={matchScore} />
          </div>
        )}
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
      </div>
      <div className="flex items-center gap-4">
        {googleRating && (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              {renderStars(googleRating)}
              <span className="font-semibold ml-1">{googleRating}</span>
            </div>
            <span className="text-sm text-muted-foreground">Google Ratings</span>
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
