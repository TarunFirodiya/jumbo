
import { useState, useEffect } from "react";
import { Star, Heart, Building2, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateBuildingSlug } from "@/utils/slugUtils";
import { Tables } from "@/integrations/supabase/types";
import { SquareFootage } from "@/components/icons/SquareFootage";
import { 
  extractImageArrayFromObject, 
  getPlaceholderImage, 
  isHeicUrl, 
  convertHeicToJpeg 
} from "@/utils/mediaUtils";

interface BuildingCardProps {
  building: Tables<"buildings">; 
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
  const [imageError, setImageError] = useState(false);
  const [mainImage, setMainImage] = useState('');
  const [isConvertingHeic, setIsConvertingHeic] = useState(false);
  
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
    
    // Check if it's a HEIC image
    if (isHeicUrl(imageToUse)) {
      console.log(`BuildingCard: Found HEIC image, will convert: ${imageToUse}`);
      setIsConvertingHeic(true);
      
      // First set the placeholder while we convert
      setMainImage(getPlaceholderImage());
      
      // Convert the HEIC image
      convertHeicToJpeg(imageToUse)
        .then(convertedUrl => {
          console.log(`BuildingCard: HEIC conversion successful: ${convertedUrl}`);
          setMainImage(convertedUrl);
          setIsConvertingHeic(false);
        })
        .catch(error => {
          console.error(`BuildingCard: HEIC conversion failed:`, error);
          setMainImage(getPlaceholderImage());
          setIsConvertingHeic(false);
        });
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
  
  // Format price to Indian format (e.g. 1,60,00,000)
  const formatIndianPrice = (price: number) => {
    if (!price) return "";
    
    const crore = (price/10000000).toFixed(2);
    return crore.endsWith('.00') 
      ? crore.slice(0, -3) 
      : crore;
  };
  
  // Get the main BHK type for the card title
  const mainBhkType = building.bhk_types && building.bhk_types.length > 0 
    ? building.bhk_types[0] 
    : "";
  
  return (
    <div 
      key={building.id} 
      className="overflow-hidden cursor-pointer group rounded-3xl bg-white shadow-md hover:shadow-xl transition-all duration-300"
      onClick={() => onNavigate(`/property/${slug}`)}
    >
      <div className="relative">
        {/* Property Image */}
        <div className="relative aspect-square overflow-hidden">
          {isConvertingHeic ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
              <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-gray-500">Converting image...</p>
            </div>
          ) : (
            <img 
              src={mainImage} 
              alt={building.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
          
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
      <div className="p-3 flex items-center justify-between bg-white">
        {/* Area */}
        <div className="flex items-center gap-1.5">
          <SquareFootage className="h-5 w-5 text-gray-600" />
          <span className="text-gray-800 font-medium">
            {building.total_units ? `${building.total_units} sq ft` : "--"}
          </span>
        </div>
        
        {/* Floor */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-5 w-5 text-gray-600" />
          <span className="text-gray-800 font-medium">
            {building.total_floors ? `${building.total_floors} floors` : "4th floor"}
          </span>
        </div>
        
        {/* Price */}
        <div className="text-xl font-bold">
          {building.min_price 
            ? `${formatIndianPrice(building.min_price)} Cr` 
            : "Price on request"}
        </div>
      </div>
    </div>
  );
}
