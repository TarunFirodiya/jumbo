
import { ImageCarousel } from "./ImageCarousel";
import { normalizeImageArray, processMediaUrl, processMediaContent, extractRegularPhotos, extractAiStagedPhotos } from "@/utils/mediaProcessing";
import { useEffect } from "react";

interface PropertyGalleryProps {
  images?: string[];
  videoThumbnail?: string | null;
  streetView?: string | null;
  floorPlanImage?: string | null;
  aiStagedPhotos?: string[] | null;
  mediaContent?: Record<string, string[]> | null; // New prop for the flat JSON media content
}

export function PropertyGallery({ 
  images = [], 
  videoThumbnail, 
  streetView, 
  floorPlanImage,
  aiStagedPhotos,
  mediaContent
}: PropertyGalleryProps) {
  // Process media content if available (new format), otherwise use legacy fields
  const processedContent = mediaContent ? processMediaContent(mediaContent) : null;
  
  // Use either new format or legacy format
  const useNewFormat = !!processedContent && (
    Object.keys(processedContent.photos).length > 0 || 
    Object.keys(processedContent.aiStagedPhotos).length > 0 ||
    processedContent.video || 
    processedContent.streetView ||
    processedContent.floorPlan
  );
  
  // Process all media URLs from either new or legacy format
  const processedVideoThumbnail = useNewFormat 
    ? processedContent?.video
    : (videoThumbnail ? processMediaUrl(videoThumbnail) : null);
  
  const processedStreetView = useNewFormat
    ? processedContent?.streetView
    : (streetView ? processMediaUrl(streetView) : null);
  
  const processedFloorPlan = useNewFormat
    ? processedContent?.floorPlan
    : (floorPlanImage ? processMediaUrl(floorPlanImage) : null);
  
  // Process images to ensure they are arrays with processed URLs
  const normalizedImages = useNewFormat
    ? extractRegularPhotos(processedContent!)
    : normalizeImageArray(images);
    
  const normalizedAiPhotos = useNewFormat
    ? extractAiStagedPhotos(processedContent!)
    : normalizeImageArray(aiStagedPhotos);
  
  // Log for debugging - verbose to track exactly what's happening
  useEffect(() => {
    console.log("PropertyGallery - Using format:", useNewFormat ? "New JSON" : "Legacy");
    
    if (useNewFormat) {
      console.log("PropertyGallery - Processed Content:", processedContent);
      console.log("PropertyGallery - Extracted regular photos:", normalizedImages);
      console.log("PropertyGallery - Extracted AI photos:", normalizedAiPhotos);
    } else {
      console.log("PropertyGallery - Input Images:", images);
      console.log("PropertyGallery - Input AI Staged Photos:", aiStagedPhotos);
      console.log("PropertyGallery - Input Video:", videoThumbnail);
      console.log("PropertyGallery - Input Street View:", streetView);
      console.log("PropertyGallery - Input Floor Plan:", floorPlanImage);
      
      console.log("PropertyGallery - Processed Images:", normalizedImages);
      console.log("PropertyGallery - Processed AI Photos:", normalizedAiPhotos);
      console.log("PropertyGallery - Processed Video:", processedVideoThumbnail);
      console.log("PropertyGallery - Processed Street View:", processedStreetView);
      console.log("PropertyGallery - Processed Floor Plan:", processedFloorPlan);
    }
  }, [
    useNewFormat, processedContent, images, aiStagedPhotos, videoThumbnail, streetView, floorPlanImage,
    normalizedImages, normalizedAiPhotos, processedVideoThumbnail, processedStreetView, processedFloorPlan
  ]);
    
  // If we have no images at all, use a default placeholder
  const displayImages = normalizedImages?.length > 0 
    ? normalizedImages 
    : ["/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png"];

  return (
    <div className="w-full rounded-lg overflow-hidden bg-muted">
      <ImageCarousel 
        images={displayImages} 
        videoThumbnail={processedVideoThumbnail} 
        streetView={processedStreetView} 
        floorPlanImage={processedFloorPlan}
        aiStagedPhotos={normalizedAiPhotos && normalizedAiPhotos.length > 0 ? normalizedAiPhotos : null}
      />
    </div>
  );
}
