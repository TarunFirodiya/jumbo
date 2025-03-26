
import { memo } from 'react';
import { Sparkles } from 'lucide-react';

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
  // Debug log for active tab and images
  console.log(`[MediaContent] Rendering for tab ${activeTab} with ${displayImages.length} images`);
  console.log(`[MediaContent] Current slide: ${currentSlide}`);
  console.log(`[MediaContent] Display images:`, displayImages);
  
  if (displayImages.length === 0) {
    console.log(`[MediaContent] No images available for ${activeTab} tab`);
    return <p className="text-white">No content available</p>;
  }

  // Render different content based on active tab
  if (activeTab === "photos" || activeTab === "imagine") {
    const imageUrl = displayImages[currentSlide];
    console.log(`[MediaContent] Rendering image: ${imageUrl} for ${activeTab} tab`);
    
    return (
      <>
        <img
          src={imageUrl}
          alt={`${activeTab === "imagine" ? "AI Staged Image" : "Property view"} ${currentSlide + 1}`}
          className="max-h-full max-w-full object-contain"
          onError={(e) => {
            console.error(`[MediaContent] Image failed to load: ${imageUrl}`);
            (e.target as HTMLImageElement).src = "/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png";
          }}
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
  }
  
  if (activeTab === "streetView" && streetView) {
    console.log(`[MediaContent] Rendering street view: ${streetView}`);
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
  }
  
  if (activeTab === "floorPlan" && floorPlanImage) {
    console.log(`[MediaContent] Rendering floor plan: ${floorPlanImage}`);
    return (
      <img 
        src={floorPlanImage} 
        alt="Floor Plan" 
        className="max-h-full max-w-full object-contain" 
        onError={(e) => {
          console.error(`[MediaContent] Floor plan failed to load: ${floorPlanImage}`);
          (e.target as HTMLImageElement).src = "/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png";
        }}
      />
    );
  }
  
  console.log(`[MediaContent] No specific content available for ${activeTab} tab`);
  return <p className="text-white">No content available for this category</p>;
});
