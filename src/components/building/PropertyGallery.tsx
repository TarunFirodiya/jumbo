
import { ImageCarousel } from "./ImageCarousel";
import { 
  processMediaContent, 
  extractRegularPhotos, 
  extractAiStagedPhotos,
  safeJsonToRecord
} from "@/utils/mediaUtils";
import { useEffect } from "react";
import { SafeJsonObject } from "@/types/mediaTypes";

interface PropertyGalleryProps {
  mediaContent?: SafeJsonObject;
}

export function PropertyGallery({ mediaContent }: PropertyGalleryProps) {
  // Process media content to categorize different media types
  const content = processMediaContent(mediaContent);
  
  // Extract arrays of regular and AI-staged photos
  const regularPhotos = extractRegularPhotos(content);
  const aiStagedPhotos = extractAiStagedPhotos(content);
  
  // Log processed content for debugging
  useEffect(() => {
    console.log("PropertyGallery - Processed Content:", content);
    console.log("PropertyGallery - Regular Photos:", regularPhotos);
    console.log("PropertyGallery - AI Staged Photos:", aiStagedPhotos);
  }, [content, regularPhotos, aiStagedPhotos]);
    
  return (
    <div className="w-full rounded-lg overflow-hidden bg-muted">
      <ImageCarousel 
        images={regularPhotos} 
        videoThumbnail={content.video} 
        streetView={content.streetView} 
        floorPlanImage={content.floorPlan}
        aiStagedPhotos={aiStagedPhotos.length > 0 ? aiStagedPhotos : null}
      />
    </div>
  );
}
