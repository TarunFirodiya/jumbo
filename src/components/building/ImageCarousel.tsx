
import { useState, useEffect, memo, useCallback } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { type UseEmblaCarouselType } from 'embla-carousel-react';

interface ImageCarouselProps {
  images: string[];
  onImageClick?: (e: React.MouseEvent) => void;
}

const isYoutubeUrl = (url: string) => {
  return url?.includes('youtube.com') || url?.includes('youtu.be');
};

const getYoutubeEmbedUrl = (url: string) => {
  if (!url) return '';
  const videoId = url.includes('youtu.be') 
    ? url.split('/').pop() 
    : url.split('v=')[1]?.split('&')[0];
  return `https://www.youtube.com/embed/${videoId}`;
};

// Memoized media element component to prevent re-renders
const MediaElement = memo(({ url, index, onError }: { url: string; index: number; onError: (index: number) => void }) => {
  if (isYoutubeUrl(url)) {
    return (
      <iframe
        src={getYoutubeEmbedUrl(url)}
        className="w-full h-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // Process image URL to handle special cases
  const processedUrl = url?.includes('maps.googleapis.com') ? 
    '/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png' : url;

  return (
    <img
      src={processedUrl}
      alt={`Image ${index + 1}`}
      className="w-full h-full object-cover"
      loading="lazy"
      onError={() => onError(index)}
    />
  );
});

MediaElement.displayName = 'MediaElement';

export const ImageCarousel = memo(function ImageCarousel({ images, onImageClick }: ImageCarouselProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emblaRef, setEmblaRef] = useState<UseEmblaCarouselType[1] | null>(null);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const handleImageError = useCallback((index: number) => {
    setFailedImages(prev => ({ ...prev, [index]: true }));
  }, []);

  // If no images, show placeholder
  if (!images?.length) {
    return (
      <div className="w-full aspect-video bg-muted flex items-center justify-center">
        <img 
          src="/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png"
          alt="Building placeholder"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // Grid view for desktop
  const GridView = () => (
    <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 aspect-[2/1]" onClick={() => setShowAllPhotos(true)}>
      <div className="col-span-2 row-span-2 relative overflow-hidden rounded-l-lg">
        <MediaElement url={images[0]} index={0} onError={handleImageError} />
      </div>
      <div className="relative overflow-hidden">
        {images.length > 1 && <MediaElement url={images[1]} index={1} onError={handleImageError} />}
      </div>
      <div className="relative overflow-hidden rounded-tr-lg">
        {images.length > 2 && <MediaElement url={images[2]} index={2} onError={handleImageError} />}
      </div>
      <div className="relative overflow-hidden">
        {images.length > 3 && <MediaElement url={images[3]} index={3} onError={handleImageError} />}
      </div>
      <div className="relative overflow-hidden rounded-br-lg">
        {images.length > 4 && (
          <div 
            className="absolute inset-0 bg-black/50 flex items-center justify-center text-white cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowAllPhotos(true);
            }}
          >
            <span>+{images.length - 4} more</span>
          </div>
        )}
        {images.length > 4 ? (
          <MediaElement url={images[4]} index={4} onError={handleImageError} />
        ) : images.length > 3 ? (
          <MediaElement url={images[3]} index={3} onError={handleImageError} />
        ) : null}
      </div>
    </div>
  );

  // Single Image for Mobile
  const MobileView = () => (
    <div className="md:hidden w-full aspect-video relative" onClick={() => setShowAllPhotos(true)}>
      <MediaElement url={images[0]} index={0} onError={handleImageError} />
    </div>
  );

  // Full Screen Carousel
  const FullScreenCarousel = () => (
    <Dialog open={showAllPhotos} onOpenChange={setShowAllPhotos}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
        <Button 
          variant="ghost" 
          className="absolute right-4 top-4 z-50" 
          onClick={() => setShowAllPhotos(false)}
        >
          <X className="h-6 w-6" />
        </Button>
        
        <Carousel
          className="w-full h-full"
          setApi={setEmblaRef}
          onSelect={() => {
            if (emblaRef) {
              setCurrentSlide(emblaRef.selectedScrollSnap());
            }
          }}
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index} className="h-[90vh] flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  <MediaElement url={image} index={index} onError={handleImageError} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentSlide === index ? "bg-white scale-125" : "bg-white/50"
                )}
                onClick={() => emblaRef?.scrollTo(index)}
              />
            ))}
          </div>
        </Carousel>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <GridView />
      <MobileView />
      <FullScreenCarousel />
    </>
  );
});
