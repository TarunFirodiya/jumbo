
import { ImageCarousel } from "./ImageCarousel";
import { getThumbnailUrl } from "@/utils/mediaProcessing";

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
  // Process images to ensure they are arrays
  const normalizedImages = Array.isArray(images) ? images : (images ? [images] : []);
  const normalizedAiPhotos = Array.isArray(aiStagedPhotos) ? aiStagedPhotos : (aiStagedPhotos ? [aiStagedPhotos] : []);
  
  // Log for debugging
  console.log("PropertyGallery - Regular Images:", normalizedImages);
  console.log("PropertyGallery - AI Staged Photos:", normalizedAiPhotos);
    
  // If we have no images at all, use a default
  const displayImages = normalizedImages?.length > 0 
    ? normalizedImages 
    : [getThumbnailUrl(null, normalizedImages, normalizedAiPhotos)];

  return (
    <div className="w-full rounded-lg overflow-hidden bg-muted">
      <ImageCarousel 
        images={displayImages} 
        videoThumbnail={videoThumbnail} 
        streetView={streetView} 
        floorPlanImage={floorPlanImage}
        aiStagedPhotos={normalizedAiPhotos}
      />
    </div>
  );
}
