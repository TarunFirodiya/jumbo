
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRef, useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Collection {
  id: string;
  name: string;
  iconUrl: string;
  description?: string;
}

const collections: Collection[] = [
  {
    id: "affordable",
    name: "Affordable",
    iconUrl: "/lovable-uploads/5108ee7d-075e-48fa-8f15-cc6bcb951f57.png",
    description: "Budget-friendly homes"
  },
  {
    id: "gated-apartment",
    name: "Gated",
    iconUrl: "/lovable-uploads/4f137503-5396-4dc6-b8c3-9825a77225ab.png",
    description: "Secure gated communities"
  },
  {
    id: "new-construction",
    name: "New",
    iconUrl: "/lovable-uploads/4ef453e4-4ad6-4e6a-a976-da5d90d5381a.png",
    description: "Newly constructed"
  },
  {
    id: "child-friendly",
    name: "Kids Friendly",
    iconUrl: "/lovable-uploads/b519014d-fdf4-4afd-a56d-1d8d050749a8.png",
    description: "Great for families"
  },
  {
    id: "top 5 builder",
    name: "Top Builder",
    iconUrl: "/lovable-uploads/98d92f31-19ac-4916-838d-51550da202e5.png",
    description: "Premium builders"
  },
  {
    id: "spacious",
    name: "Spacious",
    iconUrl: "/lovable-uploads/546490ac-c727-4cd4-87a8-b467d49f6438.png",
    description: "Large living spaces"
  },
  {
    id: "high-rise",
    name: "High Rise",
    iconUrl: "/lovable-uploads/d1672d7d-12f3-4119-9b83-952524bc9ddb.png",
    description: "High rise buildings"
  },
  {
    id: "villa",
    name: "Villa",
    iconUrl: "/lovable-uploads/ed56d2f2-3075-4c81-8869-690f26958f23.png",
    description: "Luxury villas"
  },
  {
    id: "metro",
    name: "Metro",
    iconUrl: "/lovable-uploads/3a57f04c-05ce-4905-bc15-5e538e77a618.png",
    description: "Near metro stations"
  }
];

interface CollectionsBarProps {
  selectedCollections: string[];
  onCollectionToggle: (collectionId: string) => void;
}

export function CollectionsBar({ selectedCollections, onCollectionToggle }: CollectionsBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    const checkScroll = () => {
      if (!scrollContainerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
    };

    checkScroll();
    scrollContainerRef.current?.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      scrollContainerRef.current?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -200 : 200;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleFilterClick = (collectionId: string) => {
    setActiveFilter(collectionId);
    onCollectionToggle(collectionId);
    
    // Reset active state after animation completes
    setTimeout(() => {
      setActiveFilter(null);
    }, 300);
  };

  return (
    <div className="border-b relative bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
      <ScrollArea 
        ref={scrollContainerRef}
        className="w-full py-2"
      >
        <div className="flex space-x-2 px-4">
          {collections.map((collection) => {
            const isSelected = selectedCollections.includes(collection.id);
            const isActive = activeFilter === collection.id;
            
            return (
              <TooltipProvider key={collection.id} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex flex-col items-center justify-center h-auto px-3 py-3 space-y-1.5 rounded-lg",
                        "transition-all duration-300 min-w-[80px] hover:bg-gray-100",
                        isSelected && "bg-gray-100 ring-1 ring-gray-200",
                        isActive && "animate-pulse scale-105"
                      )}
                      onClick={() => handleFilterClick(collection.id)}
                    >
                      <div className={cn(
                        "transition-all duration-300 w-10 h-10 p-1.5 rounded-full",
                        isSelected 
                          ? "bg-white shadow-sm" 
                          : "opacity-80 hover:opacity-100"
                      )}>
                        <img 
                          src={collection.iconUrl} 
                          alt={collection.name}
                          className={cn(
                            "w-full h-full object-contain transition-transform duration-300",
                            isSelected && "scale-110"
                          )}
                        />
                      </div>
                      <span className={cn(
                        "text-xs font-medium transition-colors duration-300",
                        isSelected
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground"
                      )}>
                        {collection.name}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-900 text-white border-none text-xs">
                    {collection.description || collection.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {isMobile && (
        <>
          {showLeftArrow && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-md z-10 rounded-full h-8 w-8 border"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {showRightArrow && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-md z-10 rounded-full h-8 w-8 border"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
