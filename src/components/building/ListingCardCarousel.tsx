
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ListingCardCarouselProps {
  images: string[];
  aiStagedPhotos?: string[] | null;
  thumbnailImage?: string | null;
  alt?: string;
  aspectRatio?: 'portrait' | 'square' | 'video';
  onImageClick?: () => void;
  className?: string;
}

export function ListingCardCarousel({
  images,
  aiStagedPhotos,
  thumbnailImage,
  alt = 'Property image',
  aspectRatio = 'video',
  onImageClick,
  className
}: ListingCardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  // Debug logs to trace image availability
  console.log("[ListingCardCarousel] Props received:", { 
    imagesCount: images?.length || 0,
    aiStagedCount: aiStagedPhotos?.length || 0,
    thumbnailImage,
    aspectRatio
  });
  
  if (thumbnailImage) {
    console.log("[ListingCardCarousel] Using thumbnailImage:", thumbnailImage);
  }
  
  // Build display images array with priority order:
  // 1. Thumbnail (if provided)
  // 2. AI staged photos (if available)
  // 3. Regular images
  // 4. Fallback image
  const displayImages = (() => {
    let result: string[] = [];
    
    // Add thumbnail first if it exists
    if (thumbnailImage) {
      console.log("[ListingCardCarousel] Adding thumbnail to display images:", thumbnailImage);
      result.push(thumbnailImage);
    }
    
    // Then add AI staged photos if available
    if (aiStagedPhotos && aiStagedPhotos.length > 0) {
      console.log("[ListingCardCarousel] Adding AI staged photos:", aiStagedPhotos);
      // Avoid duplicating the thumbnail if it's also the first AI staged photo
      const filteredAiPhotos = aiStagedPhotos.filter(photo => 
        photo !== thumbnailImage && photo
      );
      result = [...result, ...filteredAiPhotos];
    }
    
    // Then add regular images, avoiding duplicates
    if (images && images.length > 0) {
      console.log("[ListingCardCarousel] Adding regular images:", images);
      const filteredImages = images.filter(img => 
        img !== thumbnailImage && 
        !(aiStagedPhotos || []).includes(img) &&
        img // Ensure it's not empty
      );
      result = [...result, ...filteredImages];
    }
    
    // Filter out any empty strings, null, or undefined values
    result = result.filter(Boolean);
    console.log("[ListingCardCarousel] Combined images before filtering:", result);
    
    // If we still have no images, use fallback
    if (result.length === 0) {
      console.log("[ListingCardCarousel] No images found, using fallback");
      return ["/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png"];
    }
    
    console.log("[ListingCardCarousel] Final display images:", result);
    return result;
  })();

  // Only enable navigation if we have more than one image
  const hasMultipleImages = displayImages.length > 1;

  const nextImage = () => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
  };

  const prevImage = () => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + displayImages.length) % displayImages.length);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (onImageClick) {
      e.stopPropagation();
      onImageClick();
    }
  };
  
  const handleImageError = (url: string) => {
    console.error(`[ListingCardCarousel] Image failed to load:`, url);
    setImageErrors(prev => ({ ...prev, [url]: true }));
  };
  
  // Check if current image is from AI staged photos
  const isAIImage = aiStagedPhotos?.includes(displayImages[currentIndex]);
  
  // Check if current image is the thumbnail
  const isThumbnail = thumbnailImage && displayImages[currentIndex] === thumbnailImage;
  
  // Check if current image has an error
  const currentImageHasError = imageErrors[displayImages[currentIndex]];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-t-lg",
        aspectRatio === 'portrait' ? 'aspect-[3/4]' : aspectRatio === 'square' ? 'aspect-square' : 'aspect-video',
        className
      )}
    >
      {/* Current image */}
      {currentImageHasError ? (
        <img
          src="/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png"
          alt="Image not available"
          className="h-full w-full object-cover transition-all"
        />
      ) : (
        <img
          src={displayImages[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          onClick={handleImageClick}
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
          onError={() => handleImageError(displayImages[currentIndex])}
        />
      )}

      {/* AI staged badge */}
      {isAIImage && !currentImageHasError && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          <span>AI Staged</span>
        </div>
      )}
      
      {/* Thumbnail badge */}
      {isThumbnail && !currentImageHasError && (
        <div className="absolute bottom-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
          Featured
        </div>
      )}

      {/* Navigation arrows - only show if there's more than one image */}
      {hasMultipleImages && (
        <>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            size="icon"
            variant="ghost"
            className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white/80 text-black opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Previous image</span>
          </Button>
          
          <Button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            size="icon"
            variant="ghost"
            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white/80 text-black opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Next image</span>
          </Button>
        </>
      )}

      {/* Image pagination dots */}
      {hasMultipleImages && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {displayImages.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-1.5 w-1.5 rounded-full bg-white/80 transition-all",
                currentIndex === index ? "w-2.5 opacity-100" : "opacity-60"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            >
              <span className="sr-only">Image {index + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
