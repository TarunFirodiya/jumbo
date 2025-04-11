
import { useState, useEffect } from "react";
import { Star, Heart, Building2, ArrowUpDown, Bed } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateBuildingSlug } from "@/utils/slugUtils";
import { Tables } from "@/integrations/supabase/types";
import { SquareFootage } from "@/components/icons/SquareFootage";
import { 
  extractImageArrayFromObject, 
  getPlaceholderImage,
  isHeicUrl 
} from "@/utils/mediaUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/utils";

interface BuildingCardProps {
  building: Tables<"buildings">; 
  listing?: Tables<"listings">;
  onNavigate: (path: string) => void;
  onShortlist: (buildingId: string) => void;
  isShortlisted: boolean;
}

export function BuildingCard({
  building,
  listing,
  onNavigate,
  onShortlist,
  isShortlisted
}: BuildingCardProps) {
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [mainImage, setMainImage] = useState('');
  
  // Fetch first available listing if not provided
  const { data: fetchedListing } = useQuery({
    queryKey: ['first-listing', building.id],
    queryFn: async () => {
      if (listing) return null; // Skip if listing is already provided
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('building_id', building.id)
        .eq('status', 'available')
        .limit(1);
      
      if (error) {
        console.error('Error fetching listing:', error);
        return null;
      }
      
      return data?.[0] || null;
    },
    enabled: !listing
  });
  
  // Use provided listing or the fetched one
  const activeListing = listing || fetchedListing;
  
  const handleShortlist = (e: React.MouseEvent, buildingId: string) => {
    e.stopPropagation();
    setIsShortlisting(true);
    onShortlist(buildingId);
    
    setTimeout(() => {
      setIsShortlisting(false);
    }, 800);
  };

  const handleImageError = () => {
    console.log(`BuildingCard: Image error for building ${building.id}`);
    setImageError(true);
    setMainImage(getPlaceholderImage());
  };

  // Set up the main image when component mounts or building changes
  useEffect(() => {
    // Get building images
    const buildingImages = extractImageArrayFromObject(building);
    
    // Use the first image or a placeholder
    let imageToUse = imageError || buildingImages.length === 0 
      ? getPlaceholderImage()
      : buildingImages[0];
    
    // Check if it's a HEIC image and use placeholder instead
    if (isHeicUrl(imageToUse)) {
      console.log(`BuildingCard: Found HEIC image, using placeholder: ${imageToUse}`);
      setMainImage(getPlaceholderImage());
    } else {
      setMainImage(imageToUse);
    }
  }, [building, imageError]);

  // Generate SEO-friendly URL slug
  const slug = generateBuildingSlug(
    building.name,
    building.locality,
    building.bhk_types,
    building.id
  );
  
  // Get the main BHK type for the card title
  const mainBhkType = activeListing?.bedrooms 
    ? `${activeListing.bedrooms}BHK` 
    : (building.bhk_types && building.bhk_types.length > 0 
        ? building.bhk_types[0] 
        : "");
  
  return (
    <div 
      key={building.id + (listing?.id || '')}
      className="overflow-hidden cursor-pointer group rounded-3xl bg-white shadow-md hover:shadow-xl transition-all duration-300"
      onClick={() => onNavigate(`/property/${slug}`)}
    >
      <div className="relative">
        {/* Property Image */}
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={mainImage} 
            alt={building.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          
          {/* Rating Pill */}
          {building.google_rating && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-slate-700/80 text-white px-3 py-1.5 rounded-lg">
              <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
              <span className="font-medium">{building.google_rating}</span>
            </div>
          )}
          
          {/* Shortlist Button */}
          <button
            onClick={(e) => handleShortlist(e, building.id)}
            className={cn(
              "absolute top-3 right-3 p-2 z-10 transition-all bg-white rounded-full shadow-md",
              isShortlisting ? "scale-125" : "hover:scale-110"
            )}
            aria-label={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-all duration-300",
                isShortlisted 
                  ? "fill-red-500 stroke-red-500" 
                  : "stroke-gray-500 fill-transparent",
                isShortlisting && !isShortlisted && "animate-pulse fill-red-500 stroke-red-500"
              )}
            />
          </button>
          
          {/* Dark overlay with property title */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-black/0 p-4 pt-16">
            <h3 className="text-xl font-bold text-white">
              {mainBhkType} {building.name ? `in ${building.name}` : ""}
            </h3>
            <p className="text-white/90 text-sm font-medium">
              {building.locality || ""}
            </p>
          </div>
        </div>
      </div>
      
      {/* Property details in footer */}
      <div className="p-3 flex items-center justify-between bg-black/90 text-white">
        {/* Area */}
        <div className="flex items-center gap-1.5">
          <SquareFootage className="h-5 w-5 text-white" />
          <span className="font-medium">
            {activeListing?.built_up_area ? `${activeListing.built_up_area} sq ft` : "--"}
          </span>
        </div>
        
        {/* Floor */}
        <div className="flex items-center gap-1.5">
          <Building2 className="h-5 w-5 text-white" />
          <span className="font-medium">
            {activeListing?.floor ? `${activeListing.floor}${getOrdinalSuffix(activeListing.floor)} floor` : "--"}
          </span>
        </div>
        
        {/* Price */}
        <div className="text-xl font-bold">
          {activeListing?.price 
            ? `${formatIndianCrore(activeListing.price)} Crore` 
            : (building.min_price 
              ? `${formatIndianCrore(building.min_price)} Cr` 
              : "Price on request")}
        </div>
      </div>
    </div>
  );
}

// Helper function to format price in Indian Crore format (e.g., 1.60 Crore)
function formatIndianCrore(price: number): string {
  if (!price) return "";
  
  const crore = (price/10000000).toFixed(2);
  return crore.endsWith('.00') 
    ? crore.slice(0, -3) 
    : crore;
}

// Helper function to get ordinal suffix (e.g., 1st, 2nd, 3rd, 4th)
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
}
