
import { ImageCarousel } from "./ImageCarousel";

interface PropertyGalleryProps {
  images: string[];
  videoThumbnail?: string | null;
  streetView?: string | null;
  floorPlanImage?: string | null;
}

export function PropertyGallery({ images, videoThumbnail, streetView, floorPlanImage }: PropertyGalleryProps) {
  return (
    <div className="w-full rounded-lg overflow-hidden bg-muted">
      <ImageCarousel 
        images={images} 
        videoThumbnail={videoThumbnail} 
        streetView={streetView} 
        floorPlanImage={floorPlanImage} 
      />
    </div>
  );
}
