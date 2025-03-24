
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getThumbnailUrl } from '@/utils/mediaProcessing';

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
  
  // Prioritize display order: thumbnail > AI staged > regular images > fallback
  const displayImages = (() => {
    // If thumbnail is specified, make it the first image
    if (thumbnailImage) {
      return [thumbnailImage, ...(images || [])].filter(Boolean);
    }
    
    // If AI staged photos exist, prioritize them
    if (aiStagedPhotos && aiStagedPhotos.length > 0) {
      return [...aiStagedPhotos, ...(images || [])].filter(Boolean);
    }
    
    // Regular images if available
    if (images?.length) {
      return [...images].filter(Boolean);
    }
    
    // Fallback image
    return ["/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png"];
  })();

  if (!displayImages?.length) {
    return (
      <div className={cn(
        "overflow-hidden rounded-t-lg bg-muted",
        aspectRatio === 'portrait' ? 'aspect-[3/4]' : aspectRatio === 'square' ? 'aspect-square' : 'aspect-video',
        className
      )}>
        <div className="h-full w-full flex items-center justify-center">
          <img 
            src="/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png"
            alt="Building placeholder"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + displayImages.length) % displayImages.length);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (onImageClick) {
      e.stopPropagation();
      onImageClick();
    }
  };
  
  // Check if current image is from AI staged photos
  const isAIImage = aiStagedPhotos && aiStagedPhotos.includes(displayImages[currentIndex]);
  
  // Check if current image is the thumbnail
  const isThumbnail = thumbnailImage && displayImages[currentIndex] === thumbnailImage;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-t-lg",
        aspectRatio === 'portrait' ? 'aspect-[3/4]' : aspectRatio === 'square' ? 'aspect-square' : 'aspect-video',
        className
      )}
    >
      {/* Current image */}
      <img
        src={displayImages[currentIndex]}
        alt={`${alt} ${currentIndex + 1}`}
        onClick={handleImageClick}
        className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
        onError={(e) => {
          // Fallback to placeholder on error
          (e.target as HTMLImageElement).src = "/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png";
        }}
      />

      {/* AI staged badge */}
      {isAIImage && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          <span>AI Staged</span>
        </div>
      )}
      
      {/* Thumbnail badge */}
      {isThumbnail && (
        <div className="absolute bottom-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
          Featured
        </div>
      )}

      {/* Navigation arrows - only show if there's more than one image */}
      {displayImages.length > 1 && (
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
      {displayImages.length > 1 && (
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
