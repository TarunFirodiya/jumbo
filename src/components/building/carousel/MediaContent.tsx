
import { memo, useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { isYoutubeUrl, isGoogleMapsUrl, getPlaceholderImage, isHeicUrl, convertHeicToJpeg } from '@/utils/mediaUtils';

interface MediaContentProps {
  activeTab: string;
  currentSlide: number;
  displayImages: string[];
  videoThumbnail?: string | null;
  streetView?: string | null;
  floorPlanImage?: string | null;
  buildingName?: string;
}

export const MediaContent = memo(function MediaContent({
  activeTab,
  currentSlide,
  displayImages,
  videoThumbnail,
  streetView,
  floorPlanImage,
  buildingName = "Property"
}: MediaContentProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [convertedImages, setConvertedImages] = useState<Record<string, string>>({});
  const [isConverting, setIsConverting] = useState(false);
  
  // Convert HEIC images when they're displayed
  useEffect(() => {
    const currentImage = displayImages[currentSlide];
    
    if (currentImage && isHeicUrl(currentImage) && !convertedImages[currentImage]) {
      setIsConverting(true);
      
      convertHeicToJpeg(currentImage)
        .then(convertedUrl => {
          setConvertedImages(prev => ({
            ...prev,
            [currentImage]: convertedUrl
          }));
          setIsConverting(false);
        })
        .catch(error => {
          console.error("Error converting HEIC image:", error);
          setImageErrors(prev => ({ ...prev, [currentImage]: true }));
          setIsConverting(false);
        });
    }
  }, [currentSlide, displayImages, convertedImages]);
  
  // Debug log for active tab and images
  useEffect(() => {
    console.log(`[MediaContent] Component mounted/updated for tab ${activeTab}`);
    console.log(`[MediaContent] Display images:`, displayImages);
    console.log(`[MediaContent] Current slide: ${currentSlide}`);
  }, [activeTab, displayImages, currentSlide]);
  
  if (displayImages.length === 0) {
    console.log(`[MediaContent] No images available for ${activeTab} tab`);
    return (
      <div className="flex flex-col items-center justify-center text-white/80 p-6 text-center">
        <img 
          src={getPlaceholderImage()}
          alt="No images available"
          className="w-64 h-64 object-contain opacity-50 mb-4"
        />
        <p>No content available for this section</p>
        <p className="text-sm mt-2">Try selecting a different category from the tabs above</p>
      </div>
    );
  }

  // Handle image error by storing it in state
  const handleImageError = (url: string) => {
    console.error(`[MediaContent] Image failed to load: ${url}`);
    setImageErrors(prev => ({ ...prev, [url]: true }));
  };

  const imageUrl = displayImages[currentSlide];
  
  // If we've already had an error with this image, use fallback
  if (imageUrl && imageErrors[imageUrl]) {
    console.log(`[MediaContent] Using fallback for previously failed image: ${imageUrl}`);
    return (
      <div className="flex flex-col items-center justify-center text-white/80 p-6 text-center">
        <img 
          src={getPlaceholderImage()}
          alt="Image not available"
          className="w-64 h-64 object-contain opacity-50 mb-4"
        />
        <p>The image could not be loaded</p>
        <p className="text-sm mt-2">The source may be unavailable or in an unsupported format</p>
        <p className="text-xs mt-4 text-gray-400 break-all">{imageUrl}</p>
      </div>
    );
  }
  
  // If image is currently converting, show loading state
  if (isConverting) {
    return (
      <div className="flex flex-col items-center justify-center text-white/80 p-6 text-center">
        <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <p>Converting HEIC image...</p>
        <p className="text-sm mt-2">This may take a moment</p>
      </div>
    );
  }
  
  // Check if image is HEIC and we have a converted version
  const isHeicImage = imageUrl && isHeicUrl(imageUrl);
  const displayUrl = isHeicImage && convertedImages[imageUrl] ? convertedImages[imageUrl] : imageUrl;
  
  // Render different content based on active tab
  if (activeTab === "photos" || activeTab === "imagine") {
    console.log(`[MediaContent] Rendering image: ${displayUrl} for ${activeTab} tab`);
    
    return (
      <>
        <img
          src={displayUrl}
          alt={`${activeTab === "imagine" ? "AI Staged Image" : "Property view"} ${currentSlide + 1}`}
          className="max-h-full max-w-full object-contain"
          onError={() => handleImageError(imageUrl)}
        />
        
        {activeTab === "imagine" && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            <span>AI Staged</span>
          </div>
        )}
      </>
    );
  }
  
  if (activeTab === "video" && videoThumbnail) {
    console.log(`[MediaContent] Rendering video: ${videoThumbnail}`);
    
    if (isYoutubeUrl(videoThumbnail)) {
      return (
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
      );
    } else {
      // If it's not a YouTube URL, try to render as a direct video
      return (
        <div className="w-full h-full flex items-center justify-center">
          <video 
            src={videoThumbnail}
            className="w-full max-h-full max-w-full" 
            style={{ height: "80vh" }}
            controls
            onError={() => handleImageError(videoThumbnail)}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
  }
  
  if (activeTab === "streetView" && streetView) {
    console.log(`[MediaContent] Rendering street view: ${streetView} (Is Google Maps: ${isGoogleMapsUrl(streetView)})`);
    
    if (isGoogleMapsUrl(streetView)) {
      return (
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
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center text-white/80 p-6 text-center">
          <img 
            src={getPlaceholderImage()}
            alt="Street view format not supported"
            className="w-64 h-64 object-contain opacity-50 mb-4"
          />
          <p>Street view format is not supported</p>
          <p className="text-sm mt-2">Please use a Google Maps Street View link</p>
          <p className="text-xs mt-4 text-gray-400 break-all">{streetView}</p>
        </div>
      );
    }
  }
  
  if (activeTab === "floorPlan" && floorPlanImage) {
    console.log(`[MediaContent] Rendering floor plan: ${floorPlanImage}`);
    return (
      <img 
        src={floorPlanImage} 
        alt="Floor Plan" 
        className="max-h-full max-w-full object-contain" 
        onError={() => handleImageError(floorPlanImage)}
      />
    );
  }
  
  console.log(`[MediaContent] No specific content available for ${activeTab} tab`);
  return (
    <div className="flex flex-col items-center justify-center text-white/80 p-6 text-center">
      <img 
        src={getPlaceholderImage()}
        alt="No content available"
        className="w-64 h-64 object-contain opacity-50 mb-4"
      />
      <p>No content available for this category</p>
      <p className="text-sm mt-2">Try selecting a different category or check back later</p>
    </div>
  );
});
