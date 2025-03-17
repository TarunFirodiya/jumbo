
import { useState, useEffect, memo, useCallback } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Image as ImageIcon, Map, Video, Sparkles } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import useEmblaCarousel from 'embla-carousel-react';
import type { UseEmblaCarouselType } from 'embla-carousel-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageCarouselProps {
  images: string[];
  videoThumbnail?: string | null;
  streetView?: string | null;
  floorPlanImage?: string | null;
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

// Generate an AI staged image based on the building's details
const generateAIImage = (buildingName: string, index: number) => {
  // For now, we'll use placeholder images. In a real implementation, you would
  // integrate with an AI image generation service.
  const placeholders = [
    '/lovable-uploads/1e05ff87-3f51-476e-adaf-2dd13c1fa4f7.png',
    '/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png',
    '/lovable-uploads/7f78928d-0b35-4267-8b36-ead15a4ed061.png'
  ];
  
  return placeholders[index % placeholders.length];
};

const MediaElement = memo(({ url, index, onError, buildingName }: { url: string; index: number; onError: (index: number) => void; buildingName: string }) => {
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

  // Check if it's a Google Street View URL and fix the rendering
  if (url?.includes('maps.googleapis.com') && url.includes('streetview')) {
    return (
      <iframe
        src={url}
        className="w-full h-full"
        loading="lazy"
        allowFullScreen
      />
    );
  }

  const processedUrl = url;

  return (
    <img
      src={processedUrl}
      alt={`Image ${index + 1} of ${buildingName}`}
      className="w-full h-full object-cover"
      loading="lazy"
      onError={() => onError(index)}
    />
  );
});

MediaElement.displayName = 'MediaElement';

export const ImageCarousel = memo(function ImageCarousel({ images, videoThumbnail, streetView, floorPlanImage, onImageClick }: ImageCarouselProps) {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emblaApi, setEmblaApi] = useState<UseEmblaCarouselType[1] | null>(null);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState("photos");
  const [aiImages, setAiImages] = useState<string[]>([]);

  useEffect(() => {
    // Generate AI images when component mounts
    if (images && images.length > 0) {
      const generatedImages = Array.from({ length: 3 }).map((_, index) => 
        generateAIImage(images[0], index)
      );
      setAiImages(generatedImages);
    }
  }, [images]);

  const handleImageError = useCallback((index: number) => {
    setFailedImages(prev => ({ ...prev, [index]: true }));
  }, []);

  const getDisplayImages = useCallback(() => {
    switch (activeTab) {
      case "streetView":
        return streetView ? [streetView] : [];
      case "floorPlan":
        return floorPlanImage ? [floorPlanImage] : [];
      case "imagine":
        return aiImages;
      default:
        return images;
    }
  }, [activeTab, images, streetView, floorPlanImage, aiImages]);

  const displayImages = getDisplayImages();

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

  const buildingName = "Property"; // Ideally pass this from props

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentSlide(0);
    if (emblaApi) {
      emblaApi.scrollTo(0);
    }
  };

  return (
    <>
      <div className="w-full relative rounded-lg overflow-hidden bg-muted">
        {/* Overlay tabs on the left side */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <TabsList orientation="vertical" className="bg-black/30 backdrop-blur-sm border border-white/20">
            <TabsTrigger 
              value="photos" 
              onClick={() => handleTabChange("photos")}
              className={`text-white ${activeTab === "photos" ? "bg-white/20" : "bg-transparent hover:bg-white/10"}`}
              title="Photos"
            >
              <ImageIcon className="h-5 w-5" />
            </TabsTrigger>
            
            {videoThumbnail && (
              <TabsTrigger 
                value="video" 
                onClick={() => handleTabChange("video")}
                className={`text-white ${activeTab === "video" ? "bg-white/20" : "bg-transparent hover:bg-white/10"}`}
                title="Video"
              >
                <Video className="h-5 w-5" />
              </TabsTrigger>
            )}
            
            {streetView && (
              <TabsTrigger 
                value="streetView" 
                onClick={() => handleTabChange("streetView")}
                className={`text-white ${activeTab === "streetView" ? "bg-white/20" : "bg-transparent hover:bg-white/10"}`}
                title="Street View"
              >
                <Map className="h-5 w-5" />
              </TabsTrigger>
            )}
            
            {floorPlanImage && (
              <TabsTrigger 
                value="floorPlan" 
                onClick={() => handleTabChange("floorPlan")}
                className={`text-white ${activeTab === "floorPlan" ? "bg-white/20" : "bg-transparent hover:bg-white/10"}`}
                title="Floor Plan"
              >
                <ImageIcon className="h-5 w-5" />
              </TabsTrigger>
            )}
            
            <TabsTrigger 
              value="imagine" 
              onClick={() => handleTabChange("imagine")}
              className={`text-white ${activeTab === "imagine" ? "bg-white/20" : "bg-transparent hover:bg-white/10"}`}
              title="AI Staged Images"
            >
              <Sparkles className="h-5 w-5" />
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Main image display */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:grid-rows-2 md:h-[500px] cursor-pointer"
          onClick={() => setShowFullScreen(true)}
        >
          {activeTab === "photos" && images.length > 0 ? (
            <>
              <div className="md:col-span-2 md:row-span-2">
                <MediaElement 
                  url={images[0]} 
                  index={0} 
                  onError={handleImageError} 
                  buildingName={buildingName}
                />
              </div>
              
              <div className="hidden md:block">
                {images.length > 1 && (
                  <MediaElement 
                    url={images[1]} 
                    index={1} 
                    onError={handleImageError} 
                    buildingName={buildingName}
                  />
                )}
              </div>
              
              <div className="hidden md:block relative">
                {images.length > 2 && (
                  <>
                    <MediaElement 
                      url={images[2]} 
                      index={2} 
                      onError={handleImageError} 
                      buildingName={buildingName}
                    />
                    {images.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <p className="text-white font-medium text-lg">
                          +{images.length - 3} Photos
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : activeTab === "video" && videoThumbnail ? (
            <div className="md:col-span-3 md:row-span-2 aspect-video">
              <iframe 
                src={videoThumbnail} 
                className="w-full h-full" 
                frameBorder="0" 
                allowFullScreen
                title="Property video"
              ></iframe>
            </div>
          ) : activeTab === "streetView" && streetView ? (
            <div className="md:col-span-3 md:row-span-2 aspect-video">
              <iframe 
                src={streetView} 
                className="w-full h-full" 
                frameBorder="0" 
                allowFullScreen
                title="Street view"
              ></iframe>
            </div>
          ) : activeTab === "floorPlan" && floorPlanImage ? (
            <div className="md:col-span-3 md:row-span-2 flex items-center justify-center p-4">
              <img 
                src={floorPlanImage} 
                alt="Floor Plan" 
                className="max-h-full object-contain" 
              />
            </div>
          ) : activeTab === "imagine" && aiImages.length > 0 ? (
            <>
              <div className="md:col-span-2 md:row-span-2">
                <MediaElement 
                  url={aiImages[0]} 
                  index={0} 
                  onError={handleImageError} 
                  buildingName={buildingName}
                />
                <div className="absolute bottom-4 left-16 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  AI Staged
                </div>
              </div>
              
              <div className="hidden md:block">
                {aiImages.length > 1 && (
                  <MediaElement 
                    url={aiImages[1]} 
                    index={1} 
                    onError={handleImageError} 
                    buildingName={buildingName}
                  />
                )}
              </div>
              
              <div className="hidden md:block">
                {aiImages.length > 2 && (
                  <MediaElement 
                    url={aiImages[2]} 
                    index={2} 
                    onError={handleImageError} 
                    buildingName={buildingName}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="md:col-span-3 md:row-span-2 flex items-center justify-center">
              <p className="text-muted-foreground">No content available</p>
            </div>
          )}
        </div>

        <div className="p-4 md:hidden flex justify-center">
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setShowFullScreen(true);
            }}
            className="w-full max-w-sm"
          >
            View All
          </Button>
        </div>
      </div>

      {/* Full Screen Modal */}
      <Dialog open={showFullScreen} onOpenChange={setShowFullScreen}>
        <DialogContent className="max-w-screen-lg p-0 bg-black h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <div className="flex items-center gap-2">
              <div className="flex rounded-full bg-white/10 p-1">
                <TabsList className="bg-transparent border-none">
                  <TabsTrigger 
                    value="photos" 
                    onClick={() => handleTabChange("photos")}
                    className={`text-white ${activeTab === "photos" ? "bg-white/20" : "bg-transparent"}`}
                  >
                    Photos
                  </TabsTrigger>
                  {videoThumbnail && (
                    <TabsTrigger 
                      value="video" 
                      onClick={() => handleTabChange("video")}
                      className={`text-white ${activeTab === "video" ? "bg-white/20" : "bg-transparent"}`}
                    >
                      Video
                    </TabsTrigger>
                  )}
                  {streetView && (
                    <TabsTrigger 
                      value="streetView" 
                      onClick={() => handleTabChange("streetView")}
                      className={`text-white ${activeTab === "streetView" ? "bg-white/20" : "bg-transparent"}`}
                    >
                      Street View
                    </TabsTrigger>
                  )}
                  {floorPlanImage && (
                    <TabsTrigger 
                      value="floorPlan" 
                      onClick={() => handleTabChange("floorPlan")}
                      className={`text-white ${activeTab === "floorPlan" ? "bg-white/20" : "bg-transparent"}`}
                    >
                      Floor Plan
                    </TabsTrigger>
                  )}
                  <TabsTrigger 
                    value="imagine" 
                    onClick={() => handleTabChange("imagine")}
                    className={`text-white ${activeTab === "imagine" ? "bg-white/20" : "bg-transparent"}`}
                  >
                    AI Staged
                  </TabsTrigger>
                </TabsList>
              </div>
              <p className="font-medium ml-2">
                {(activeTab === "photos" || activeTab === "imagine") && displayImages.length > 0 && 
                  `${currentSlide + 1} / ${displayImages.length}`
                }
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={() => setShowFullScreen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative">
            {displayImages.length > 0 ? (
              <>
                {(activeTab === "photos" || activeTab === "imagine") ? (
                  <>
                    <img
                      src={displayImages[currentSlide]}
                      alt={`${activeTab === "imagine" ? "AI Staged Image" : "Property view"} ${currentSlide + 1}`}
                      className="max-h-full max-w-full object-contain"
                    />
                    
                    {activeTab === "imagine" && (
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        AI Staged Image
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(prev => (prev === 0 ? displayImages.length - 1 : prev - 1));
                      }}
                      disabled={displayImages.length <= 1}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(prev => (prev === displayImages.length - 1 ? 0 : prev + 1));
                      }}
                      disabled={displayImages.length <= 1}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                ) : activeTab === "video" && videoThumbnail ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <iframe 
                      src={videoThumbnail} 
                      className="w-full max-h-full max-w-full" 
                      style={{ height: "80vh" }}
                      frameBorder="0" 
                      allowFullScreen
                      title="Property video"
                    ></iframe>
                  </div>
                ) : activeTab === "streetView" && streetView ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <iframe 
                      src={streetView} 
                      className="w-full max-h-full max-w-full" 
                      style={{ height: "80vh" }}
                      frameBorder="0" 
                      allowFullScreen
                      title="Street view"
                    ></iframe>
                  </div>
                ) : activeTab === "floorPlan" && floorPlanImage ? (
                  <img 
                    src={floorPlanImage} 
                    alt="Floor Plan" 
                    className="max-h-full max-w-full object-contain" 
                  />
                ) : null}
              </>
            ) : (
              <p className="text-white">No content available</p>
            )}
          </div>
          
          {(activeTab === "photos" || activeTab === "imagine") && displayImages.length > 1 && (
            <div className="p-4 overflow-x-auto">
              <div className="flex gap-2">
                {displayImages.map((image, index) => (
                  <div
                    key={index}
                    className={`w-20 h-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-md ${
                      currentSlide === index ? "ring-2 ring-white" : ""
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});
