import { useState, useCallback, memo, useMemo, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Grid, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import useEmblaCarousel from 'embla-carousel-react';
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyGalleryProps {
  images: string[];
  videUrl?: string;
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

const MediaElement = memo(({ url, index, onError }: { url: string; index: number; onError: (index: number) => void }) => {
  const [isLoading, setIsLoading] = useState(true);

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

  // Handle special cases for image URLs
  const processedUrl = url?.includes('maps.googleapis.com') ? 
    '/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png' : url;

  return (
    <div className="relative w-full h-full">
      {isLoading && <Skeleton className="absolute inset-0" />}
      <img
        src={processedUrl}
        alt={`Image ${index + 1}`}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          onError(index);
          setIsLoading(false);
        }}
      />
    </div>
  );
});

MediaElement.displayName = 'MediaElement';

export const PropertyGallery = memo(function PropertyGallery({ images, videUrl, onImageClick }: PropertyGalleryProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeView, setActiveView] = useState<'all' | 'interior' | 'exterior' | 'floor-plan'>('all');
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [thumbsRef] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const handleImageError = useCallback((index: number) => {
    setFailedImages(prev => ({ ...prev, [index]: true }));
  }, []);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSlideChange = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on('select', onSlideChange);
    return () => {
      emblaApi.off('select', onSlideChange);
    };
  }, [emblaApi, onSlideChange]);

  if (!images?.length) {
    return (
      <div className="w-full aspect-video bg-muted flex items-center justify-center rounded-lg">
        <img 
          src="/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png"
          alt="Building placeholder"
          className="w-full h-full object-cover rounded-lg"
          loading="lazy"
        />
      </div>
    );
  }

  const GridView = () => (
    <div className="relative hidden md:grid grid-cols-4 grid-rows-2 gap-2 aspect-[2/1] rounded-lg overflow-hidden">
      <div className="col-span-2 row-span-2 relative overflow-hidden">
        <MediaElement url={images[0]} index={0} onError={handleImageError} />
      </div>
      <div className="relative overflow-hidden">
        {images.length > 1 && <MediaElement url={images[1]} index={1} onError={handleImageError} />}
      </div>
      <div className="relative overflow-hidden">
        {images.length > 2 && <MediaElement url={images[2]} index={2} onError={handleImageError} />}
      </div>
      <div className="relative overflow-hidden">
        {images.length > 3 && <MediaElement url={images[3]} index={3} onError={handleImageError} />}
      </div>
      <div className="relative overflow-hidden">
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

      <Button 
        className="absolute bottom-4 right-4 bg-white/90 text-black hover:bg-white/100 backdrop-blur-sm z-10"
        onClick={() => setShowAllPhotos(true)}
      >
        <Grid className="h-4 w-4 mr-2" />
        View All Photos ({images.length})
      </Button>
    </div>
  );

  const MobileView = () => (
    <div className="md:hidden relative">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index} className="aspect-video">
              <MediaElement url={image} index={index} onError={handleImageError} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
        
        <div className="absolute bottom-4 right-4 z-10">
          <Button 
            size="sm"
            variant="secondary"
            className="bg-white/90 text-black hover:bg-white/100 backdrop-blur-sm"
            onClick={() => setShowAllPhotos(true)}
          >
            <Camera className="h-3.5 w-3.5 mr-1.5" />
            {currentSlide + 1}/{images.length}
          </Button>
        </div>
      </Carousel>
    </div>
  );

  const FullScreenGallery = () => (
    <Dialog open={showAllPhotos} onOpenChange={setShowAllPhotos}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 gap-0">
        <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
          <div className="flex gap-4">
            <Button 
              size="sm"
              variant="secondary" 
              className={cn("bg-white/90 backdrop-blur-sm", activeView === 'all' && "bg-primary text-white hover:bg-primary/90")}
              onClick={() => setActiveView('all')}
            >
              All Photos
            </Button>
            <Button 
              size="sm"
              variant="secondary" 
              className={cn("bg-white/90 backdrop-blur-sm", activeView === 'interior' && "bg-primary text-white hover:bg-primary/90")}
              onClick={() => setActiveView('interior')}
            >
              Interior
            </Button>
            <Button 
              size="sm"
              variant="secondary" 
              className={cn("bg-white/90 backdrop-blur-sm", activeView === 'exterior' && "bg-primary text-white hover:bg-primary/90")}
              onClick={() => setActiveView('exterior')}
            >
              Exterior
            </Button>
            <Button 
              size="sm"
              variant="secondary" 
              className={cn("bg-white/90 backdrop-blur-sm", activeView === 'floor-plan' && "bg-primary text-white hover:bg-primary/90")}
              onClick={() => setActiveView('floor-plan')}
            >
              Floor Plan
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-white/90 backdrop-blur-sm h-9 w-9" 
            onClick={() => setShowAllPhotos(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col h-full pt-16">
          <div className="flex-1 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full" ref={emblaRef}>
                <div className="flex h-full">
                  {images.map((image, index) => (
                    <div key={index} className="flex-[0_0_100%] min-w-0 h-full">
                      <div className="h-full w-full flex items-center justify-center px-4">
                        <div className="relative max-h-full max-w-full">
                          <MediaElement url={image} index={index} onError={handleImageError} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="icon" 
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm"
              onClick={() => emblaApi?.scrollPrev()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm"
              onClick={() => emblaApi?.scrollNext()}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="h-20 py-3 px-4 overflow-hidden bg-gray-900">
            <div className="h-full overflow-hidden" ref={thumbsRef}>
              <div className="flex h-full gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={cn(
                      "relative flex-[0_0_auto] min-w-0 h-full cursor-pointer overflow-hidden rounded-md border-2",
                      currentSlide === index ? "border-primary" : "border-transparent"
                    )}
                    onClick={() => onThumbClick(index)}
                  >
                    <img 
                      src={image} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="h-full object-cover aspect-video w-auto"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div>
      <div className="cursor-pointer" onClick={() => setShowAllPhotos(true)}>
        <GridView />
        <MobileView />
      </div>
      <FullScreenGallery />
    </div>
  );
});
