
import { ImageCarousel } from "./ImageCarousel";
import { normalizeImageArray, processMediaUrl } from "@/utils/mediaProcessing";
import { useEffect } from "react";

interface PropertyGalleryProps {
  images: string[];
  videoThumbnail?: string | null;
  streetView?: string | null;
  floorPlanImage?: string | null;
  aiStagedPhotos?: string[] | null;
}

export function PropertyGallery({ 
  images, 
  videoThumbnail, 
  streetView, 
  floorPlanImage,
  aiStagedPhotos
}: PropertyGalleryProps) {
  // Process all media URLs
  const processedVideoThumbnail = videoThumbnail ? processMediaUrl(videoThumbnail) : null;
  const processedStreetView = streetView ? processMediaUrl(streetView) : null;
  const processedFloorPlan = floorPlanImage ? processMediaUrl(floorPlanImage) : null;
  
  // Process images to ensure they are arrays with processed URLs
  const normalizedImages = normalizeImageArray(images);
  const normalizedAiPhotos = normalizeImageArray(aiStagedPhotos);
  
  // Log for debugging - verbose to track exactly what's happening
  useEffect(() => {
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
  }, [
    images, aiStagedPhotos, videoThumbnail, streetView, floorPlanImage,
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
