
import { ImageCarousel } from "./ImageCarousel";
import { 
  processMediaContent, 
  extractRegularPhotos, 
  extractAiStagedPhotos,
  getPlaceholderImage,
  isHeicUrl
} from "@/utils/mediaUtils";
import { useEffect, useState } from "react";
import { SafeJsonObject } from "@/types/mediaTypes";

interface PropertyGalleryProps {
  mediaContent?: SafeJsonObject;
}

export function PropertyGallery({ mediaContent }: PropertyGalleryProps) {
  const [regularPhotos, setRegularPhotos] = useState<string[]>([]);
  const [aiStagedPhotos, setAiStagedPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [streetViewUrl, setStreetViewUrl] = useState<string | null>(null);
  const [floorPlanUrl, setFloorPlanUrl] = useState<string | null>(null);
  
  // Process media content when it changes
  useEffect(() => {
    console.log("PropertyGallery - Original mediaContent:", mediaContent);
    
    try {
      // Process the media content
      const processedContent = processMediaContent(mediaContent);
      console.log("PropertyGallery - Processed Content:", processedContent);
      
      // Extract the media arrays - these functions now handle HEIC images internally
      const photos = extractRegularPhotos(processedContent);
      const aiPhotos = extractAiStagedPhotos(processedContent);
      
      setRegularPhotos(photos);
      setAiStagedPhotos(aiPhotos);
      setVideoUrl(processedContent.video);
      setStreetViewUrl(processedContent.streetView);
      setFloorPlanUrl(processedContent.floorPlan);
      
      console.log("PropertyGallery - Regular Photos:", photos);
      console.log("PropertyGallery - AI Staged Photos:", aiPhotos);
      console.log("PropertyGallery - Video URL:", processedContent.video);
      console.log("PropertyGallery - Street View URL:", processedContent.streetView);
      console.log("PropertyGallery - Floor Plan URL:", processedContent.floorPlan);
    } catch (error) {
      console.error("PropertyGallery - Error processing media content:", error);
      // Set fallback values
      setRegularPhotos([getPlaceholderImage()]);
      setAiStagedPhotos([]);
      setVideoUrl(null);
      setStreetViewUrl(null);
      setFloorPlanUrl(null);
    }
  }, [mediaContent]);
    
  return (
    <div className="w-full rounded-lg overflow-hidden bg-muted">
      <ImageCarousel 
        images={regularPhotos} 
        videoThumbnail={videoUrl} 
        streetView={streetViewUrl} 
        floorPlanImage={floorPlanUrl}
        aiStagedPhotos={aiStagedPhotos.length > 0 ? aiStagedPhotos : null}
      />
    </div>
  );
}
