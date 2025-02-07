
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
import { supabase } from "@/integrations/supabase/client";

interface ImageCarouselProps {
  images: string[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emblaRef, setEmblaRef] = useState<UseEmblaCarouselType[1] | null>(null);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [googleMapsKey, setGoogleMapsKey] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGoogleMapsKey() {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        if (error) throw error;
        setGoogleMapsKey(data.apiKey);
      } catch (error) {
        console.error('Error fetching Google Maps key:', error);
      }
    }
    fetchGoogleMapsKey();
  }, []);

  if (!images?.length) return null;

  const handleImageError = (index: number) => {
    setFailedImages(prev => ({ ...prev, [index]: true }));
  };

  const processImageUrl = (url: string) => {
    if (url.includes('maps.googleapis.com') && googleMapsKey) {
      return `${url}&key=${googleMapsKey}`;
    }
    return url;
  };

  return (
    <div className="w-full aspect-video relative">
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
                      src="https://images.unsplash.com/photo-1487958449943-2429e8be8625"
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
    </div>
  );
}
