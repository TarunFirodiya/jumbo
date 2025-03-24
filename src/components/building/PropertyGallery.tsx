
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
  // Use all available images, prioritizing AI-staged photos when present
  const allImages = aiStagedPhotos && aiStagedPhotos.length > 0 
    ? [...aiStagedPhotos, ...(images || [])]
    : images;
    
  // If we have no images at all, use a default
  const displayImages = allImages?.length > 0 
    ? allImages 
    : [getThumbnailUrl(null, images, aiStagedPhotos)];

  return (
    <div className="w-full rounded-lg overflow-hidden bg-muted">
      <ImageCarousel 
        images={displayImages} 
        videoThumbnail={videoThumbnail} 
        streetView={streetView} 
        floorPlanImage={floorPlanImage}
        aiStagedPhotos={aiStagedPhotos}
      />
    </div>
  );
}
