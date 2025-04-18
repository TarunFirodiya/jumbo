
import { useState, useEffect, memo, useCallback } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Image as ImageIcon, Map, Video, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryTabs } from './carousel/CategoryTabs';
import { CarouselControls } from './carousel/CarouselControls';
import { MediaContent } from './carousel/MediaContent';
import { ThumbnailStrip } from './carousel/ThumbnailStrip';
import { ImageGrid } from './carousel/ImageGrid';

export interface ImageCarouselProps {
  images: string[];
  videoThumbnail?: string | null;
  streetView?: string | null;
  floorPlanImage?: string | null;
  aiStagedPhotos?: string[] | null;
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

const generateAIImage = (buildingName: string, index: number) => {
  const placeholders = [
    '/lovable-uploads/1e05ff87-3f51-476e-adaf-2dd13c1fa4f7.png',
    '/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png',
    '/lovable-uploads/7f78928d-0b35-4267-8b36-ead15a4ed061.png'
  ];
  
  return placeholders[index % placeholders.length];
};

export const MediaElement = memo(({ url, index, onError, buildingName }: { url: string; index: number; onError: (index: number) => void; buildingName: string }) => {
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

  return (
    <img
      src={url}
      alt={`Image ${index + 1} of ${buildingName}`}
      className="w-full h-full object-cover"
      loading="lazy"
      onError={() => onError(index)}
    />
  );
});

MediaElement.displayName = 'MediaElement';

export const ImageCarousel = memo(function ImageCarousel({ 
  images, 
  videoThumbnail, 
  streetView, 
  floorPlanImage, 
  aiStagedPhotos, 
  onImageClick 
}: ImageCarouselProps) {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState("photos");
  const [aiImages, setAiImages] = useState<string[]>([]);

  // Enhanced logging for AI image debugging
  useEffect(() => {
    console.log("[ImageCarousel] Received props:");
    console.log("- AI Staged Photos:", aiStagedPhotos);
    console.log("- Regular Images:", images);
    console.log("- Active Tab:", activeTab);
    console.log("- Video Thumbnail:", videoThumbnail);
    console.log("- Street View:", streetView);
    console.log("- Floor Plan:", floorPlanImage);

    // For AI images, we need to ensure we're using valid data
    if (aiStagedPhotos && Array.isArray(aiStagedPhotos) && aiStagedPhotos.length > 0) {
      // Filter out any null or undefined values in the array
      const validAiPhotos = aiStagedPhotos.filter(Boolean);
      
      console.log("[ImageCarousel] Valid AI staged photos:", validAiPhotos);
      
      if (validAiPhotos.length > 0) {
        console.log("[ImageCarousel] Using real AI staged photos from database:", validAiPhotos);
        setAiImages(validAiPhotos);
      } else {
        console.log("[ImageCarousel] AI staged photos array exists but contains no valid URLs");
        generatePlaceholderAiImages();
      }
    } else {
      console.log("[ImageCarousel] No valid AI staged photos available");
      generatePlaceholderAiImages();
    }
  }, [images, aiStagedPhotos, activeTab, videoThumbnail, streetView, floorPlanImage]);

  // Helper function to generate placeholder AI images
  const generatePlaceholderAiImages = () => {
    if (images && images.length > 0) {
      console.log("[ImageCarousel] Generating placeholder AI images");
      const generatedImages = Array.from({ length: 3 }).map((_, index) => 
        generateAIImage(images[0], index)
      );
      console.log("[ImageCarousel] Generated placeholder AI images:", generatedImages);
      setAiImages(generatedImages);
    } else {
      console.log("[ImageCarousel] No regular images to base placeholder AI images on");
      setAiImages([]);
    }
  };

  const handleImageError = useCallback((index: number) => {
    console.log(`[ImageCarousel] Image at index ${index} failed to load`);
    setFailedImages(prev => ({ ...prev, [index]: true }));
  }, []);

  const getDisplayImages = useCallback(() => {
    switch (activeTab) {
      case "streetView":
        return streetView ? [streetView] : [];
      case "floorPlan":
        return floorPlanImage ? [floorPlanImage] : [];
      case "imagine":
        console.log("[ImageCarousel] Getting 'imagine' tab images", { aiStagedPhotos, aiImages });
        if (aiStagedPhotos && Array.isArray(aiStagedPhotos) && aiStagedPhotos.filter(Boolean).length > 0) {
          console.log("[ImageCarousel] Using aiStagedPhotos for imagine tab:", aiStagedPhotos);
          return aiStagedPhotos.filter(Boolean);
        }
        console.log("[ImageCarousel] Using generated aiImages for imagine tab:", aiImages);
        return aiImages.length > 0 ? aiImages : [];
      case "video":
        return videoThumbnail ? [videoThumbnail] : [];
      default:
        return images;
    }
  }, [activeTab, images, streetView, floorPlanImage, aiImages, aiStagedPhotos, videoThumbnail]);

  const displayImages = getDisplayImages();
  console.log("[ImageCarousel] Final displayImages:", displayImages);
  console.log("[ImageCarousel] Current active tab:", activeTab);

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
    console.log("[ImageCarousel] Tab changed to:", value);
    setActiveTab(value);
    setCurrentSlide(0);
  };

  return (
    <>
      <div className="w-full relative rounded-lg overflow-hidden bg-muted">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <CategoryTabs 
            activeTab={activeTab}
            onTabChange={handleTabChange}
            videoThumbnail={videoThumbnail}
            streetView={streetView}
            floorPlanImage={floorPlanImage}
            orientation="vertical"
            style="sidebar"
          />
        </div>

        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:grid-rows-2 md:h-[500px] cursor-pointer"
          onClick={() => setShowFullScreen(true)}
        >
          {activeTab === "photos" && images.length > 0 ? (
            <ImageGrid 
              images={images}
              aiStagedPhotos={aiStagedPhotos}
              buildingName={buildingName}
              onError={handleImageError}
              onClick={() => setShowFullScreen(true)}
            />
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
          ) : activeTab === "imagine" && (aiImages.length > 0 || (aiStagedPhotos && aiStagedPhotos.length > 0)) ? (
            <>
              <div className="md:col-span-2 md:row-span-2">
                <MediaElement 
                  url={aiImages.length > 0 ? aiImages[0] : (aiStagedPhotos && aiStagedPhotos[0])} 
                  index={0} 
                  onError={handleImageError} 
                  buildingName={buildingName}
                />
                <div className="absolute bottom-4 left-16 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Staged</span>
                </div>
              </div>
              
              <div className="hidden md:block">
                {aiImages.length > 1 || (aiStagedPhotos && aiStagedPhotos.length > 1) ? (
                  <MediaElement 
                    url={aiImages.length > 1 ? aiImages[1] : (aiStagedPhotos && aiStagedPhotos[1])} 
                    index={1} 
                    onError={handleImageError} 
                    buildingName={buildingName}
                  />
                ) : null}
              </div>
              
              <div className="hidden md:block">
                {aiImages.length > 2 || (aiStagedPhotos && aiStagedPhotos.length > 2) ? (
                  <MediaElement 
                    url={aiImages.length > 2 ? aiImages[2] : (aiStagedPhotos && aiStagedPhotos[2])} 
                    index={2} 
                    onError={handleImageError} 
                    buildingName={buildingName}
                  />
                ) : null}
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

      <Dialog open={showFullScreen} onOpenChange={setShowFullScreen}>
        <DialogContent className="max-w-screen-lg p-0 bg-black h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <div className="flex items-center gap-2">
              <CategoryTabs 
                activeTab={activeTab}
                onTabChange={handleTabChange}
                videoThumbnail={videoThumbnail}
                streetView={streetView}
                floorPlanImage={floorPlanImage}
              />
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
            <MediaContent 
              activeTab={activeTab}
              currentSlide={currentSlide}
              displayImages={displayImages}
              videoThumbnail={videoThumbnail}
              streetView={streetView}
              floorPlanImage={floorPlanImage}
              buildingName={buildingName}
            />
            
            <CarouselControls 
              displayImages={displayImages}
              currentSlide={currentSlide}
              setCurrentSlide={setCurrentSlide}
              showThumbnails={false}
            />
          </div>
          
          {(activeTab === "photos" || activeTab === "imagine") && displayImages.length > 1 && (
            <ThumbnailStrip 
              displayImages={displayImages}
              currentSlide={currentSlide}
              setCurrentSlide={setCurrentSlide}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});
