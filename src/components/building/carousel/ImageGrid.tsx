
import { memo } from 'react';
import { MediaElement } from '../ImageCarousel';

interface ImageGridProps {
  images: string[];
  aiStagedPhotos?: string[] | null; 
  buildingName?: string;
  onError: (index: number) => void;
  onClick: () => void;
}

export const ImageGrid = memo(function ImageGrid({
  images,
  aiStagedPhotos,
  buildingName = "Property",
  onError,
  onClick
}: ImageGridProps) {
  // If no images, return placeholder
  if (!images || images.length === 0) {
    return (
      <div className="md:col-span-3 md:row-span-2 flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div 
        className="md:col-span-2 md:row-span-2"
        onClick={onClick}
      >
        <MediaElement 
          url={images[0]} 
          index={0} 
          onError={onError} 
          buildingName={buildingName}
        />
      </div>
      
      <div className="hidden md:block">
        {images.length > 1 && (
          <MediaElement 
            url={images[1]} 
            index={1} 
            onError={onError} 
            buildingName={buildingName}
          />
        )}
      </div>
      
      <div className="hidden md:block relative">
        {images.length > 2 && (
          <>
            <MediaElement 
              url={images[2]} 
              index={2} 
              onError={onError} 
              buildingName={buildingName}
            />
            {images.length > 3 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <p className="text-white font-medium text-lg">
                  +{images.length - 3} Photos
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
});
