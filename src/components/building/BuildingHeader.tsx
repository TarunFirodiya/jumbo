import { useState, useEffect } from "react";
import { MapPin, Heart, Star, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { motion, AnimatePresence } from "framer-motion";

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
  const isScrolled = useScrollAnimation();
  
  useEffect(() => {
    setCurrentShortlistedState(isShortlisted);
  }, [isShortlisted]);
  
  const handleToggleShortlist = () => {
    setIsShortlisting(true);
    setCurrentShortlistedState(!currentShortlistedState);
    onToggleShortlist();
    
    setTimeout(() => {
      setIsShortlisting(false);
    }, 800);
  };
  
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4 transition-transform",
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ));
  };

  return (
    <motion.div 
      className={cn(
        "flex justify-between items-start p-1 transition-all duration-300",
        isScrolled ? "py-2" : "py-4"
      )}
      animate={{ 
        height: isScrolled ? "60px" : "auto",
        backgroundColor: isScrolled ? "hsl(var(--background)/0.9)" : "transparent",
        backdropFilter: isScrolled ? "blur(10px)" : "none"
      }}
    >
      <div className="space-y-1">
        <h1 className={cn(
          "font-serif font-semibold tracking-tight transition-all duration-300",
          isScrolled ? "text-xl" : "text-2xl md:text-3xl"
        )}>
          {name}
        </h1>
        <AnimatePresence>
          {!isScrolled && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-muted-foreground group"
            >
              <MapPin className="h-4 w-4 group-hover:text-primary transition-colors" />
              <span>{locality}</span>
              {startingPrice && (
                <span className="ml-2 text-sm font-medium bg-secondary/50 px-2 py-1 rounded-md">
                  Starting at ₹{(startingPrice/10000000).toFixed(1)} Cr
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex items-center gap-3">
        {googleRating && (
          <div className="flex flex-col items-end animate-fade-down">
            <div className="flex items-center gap-1">
              {renderStars(googleRating)}
              <span className="font-semibold ml-1">{googleRating}</span>
            </div>
            {!isScrolled && (
              <span className="text-sm text-muted-foreground">Google Ratings</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 animate-fade-down">
          {onShareClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onShareClick}
              className="text-gray-500 hover:text-gray-700 hover:scale-105 transition-all duration-300"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleShortlist}
            className={cn(
              "transition-all duration-300",
              currentShortlistedState ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-gray-700",
              isShortlisting ? "scale-125" : "hover:scale-110"
            )}
          >
            <Heart 
              className={cn(
                "h-5 w-5 transition-all duration-300", 
                currentShortlistedState && "fill-current",
                isShortlisting && !currentShortlistedState && "animate-pulse fill-red-500"
              )} 
            />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
