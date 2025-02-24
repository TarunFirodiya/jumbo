
import { useState, useEffect } from 'react';
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

export function ImageCarousel({ images, onImageClick }: ImageCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emblaRef, setEmblaRef] = useState<UseEmblaCarouselType[1] | null>(null);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  if (!images?.length) {
    return (
      <div className="w-full aspect-video bg-muted flex items-center justify-center">
        <img 
          src="/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png"
          alt="Building placeholder"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const handleImageError = (index: number) => {
    setFailedImages(prev => ({ ...prev, [index]: true }));
  };

  const processImageUrl = (url: string) => {
    if (url.includes('maps.googleapis.com')) {
      return '/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png';
    }
    return url;
  };

  const handleNavigation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="w-full aspect-video relative group" onClick={onImageClick}>
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
            <CarouselItem key={index}>
              <div className="aspect-video w-full overflow-hidden">
                {failedImages[index] ? (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <img 
                      src="/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png"
                      alt={`Building placeholder ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <img
                    src={processImageUrl(image)}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(index)}
                  />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleNavigation} />
        <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleNavigation} />

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" onClick={handleNavigation}>
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentSlide === index ? "bg-white scale-125" : "bg-white/50"
              )}
              onClick={(e) => {
                e.stopPropagation();
                emblaRef?.scrollTo(index);
              }}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
