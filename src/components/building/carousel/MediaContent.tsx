
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
  if (displayImages.length === 0) {
    return <p className="text-white">No content available</p>;
  }

  // Render different content based on active tab
  if (activeTab === "photos" || activeTab === "imagine") {
    return (
      <>
        <img
          src={displayImages[currentSlide]}
          alt={`${activeTab === "imagine" ? "AI Staged Image" : "Property view"} ${currentSlide + 1}`}
          className="max-h-full max-w-full object-contain"
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
    return (
      <img 
        src={floorPlanImage} 
        alt="Floor Plan" 
        className="max-h-full max-w-full object-contain" 
      />
    );
  }
  
  return <p className="text-white">No content available for this category</p>;
});
