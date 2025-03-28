import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRef, useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { staggerContainer, itemFadeIn } from "@/components/ui/motion-animations";
import BuildingFilters, { Filter, BUDGET_RANGES } from "@/components/ui/filters";

interface Collection {
  id: string;
  name: string;
  iconUrl: string;
  description?: string;
}

const collections: Collection[] = [
  {
    id: "Affordable",
    name: "Affordable",
    iconUrl: "/lovable-uploads/5108ee7d-075e-48fa-8f15-cc6bcb951f57.png",
    description: "Budget-friendly homes"
  },
  {
    id: "Gated Apartment",
    name: "Gated",
    iconUrl: "/lovable-uploads/4f137503-5396-4dc6-b8c3-9825a77225ab.png",
    description: "Secure gated communities"
  },
  {
    id: "New Construction",
    name: "New",
    iconUrl: "/lovable-uploads/4ef453e4-4ad6-4e6a-a976-da5d90d5381a.png",
    description: "Newly constructed"
  },
  {
    id: "Child Friendly",
    name: "Kids Friendly",
    iconUrl: "/lovable-uploads/b519014d-fdf4-4afd-a56d-1d8d050749a8.png",
    description: "Great for families"
  },
  {
    id: "Luxury Community",
    name: "Luxury",
    iconUrl: "/lovable-uploads/98d92f31-19ac-4916-838d-51550da202e5.png",
    description: "Premium communities"
  },
  {
    id: "Spacious Layout",
    name: "Spacious",
    iconUrl: "/lovable-uploads/546490ac-c727-4cd4-87a8-b467d49f6438.png",
    description: "Large living spaces"
  },
  {
    id: "Vastu Compliant",
    name: "Vastu",
    iconUrl: "/lovable-uploads/d1672d7d-12f3-4119-9b83-952524bc9ddb.png",
    description: "Following Vastu principles"
  }
];

interface CollectionsBarProps {
  selectedCollections: string[];
  onCollectionToggle: (collectionId: string) => void;
  onFiltersChange: (filters: Filter[]) => void;
  buildings: any[];
}

export function CollectionsBar({ 
  selectedCollections, 
  onCollectionToggle,
  onFiltersChange,
  buildings
}: CollectionsBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filter[]>([]);

  const localities = Array.from(new Set(buildings.map(b => b.locality).filter(Boolean)));
  const bhkTypes = Array.from(new Set(buildings.flatMap(b => b.bhk_types || []))).sort((a, b) => a - b);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

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
    
    setTimeout(() => {
      setActiveFilter(null);
    }, 300);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border-b relative bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm"
    >
      <div className="flex items-center px-4">
        <ScrollArea ref={scrollContainerRef} className="w-full py-3">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex space-x-2"
          >
            {collections.map((collection) => {
              const isSelected = selectedCollections.includes(collection.id);
              const isActive = activeFilter === collection.id;
              
              return (
                <TooltipProvider key={collection.id} delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        variants={itemFadeIn}
                      >
                        <Button
                          variant="ghost"
                          className={cn(
                            "flex flex-col items-center justify-center h-auto px-3 py-3 space-y-2 rounded-lg",
                            "transition-all duration-300 min-w-[80px] hover:bg-gray-100",
                            isSelected && "bg-gray-100 ring-1 ring-gray-200 filter-selected",
                            isActive && "filter-pulse"
                          )}
                          onClick={() => handleFilterClick(collection.id)}
                        >
                          <motion.div 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "transition-all duration-300 w-11 h-11 p-1.5 rounded-full",
                              isSelected 
                                ? "bg-white shadow-md" 
                                : "opacity-80 hover:opacity-100"
                            )}
                          >
                            <img 
                              src={collection.iconUrl} 
                              alt={collection.name}
                              className={cn(
                                "w-full h-full object-contain transition-transform duration-300",
                                isSelected && "scale-110"
                              )}
                            />
                          </motion.div>
                          <span className={cn(
                            "text-xs font-medium transition-colors duration-300",
                            isSelected
                              ? "text-foreground font-semibold"
                              : "text-muted-foreground"
                          )}>
                            {collection.name}
                          </span>
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-gray-900 text-white border-none text-xs">
                      {collection.description || collection.name}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </motion.div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <BuildingFilters
          filters={filters}
          setFilters={setFilters}
          localities={localities}
          bhkTypes={bhkTypes}
        />
      </div>

      {isMobile && (
        <>
          {showLeftArrow && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-md z-10 rounded-full h-8 w-8 border"
                onClick={() => scroll('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
          {showRightArrow && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-md z-10 rounded-full h-8 w-8 border"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
