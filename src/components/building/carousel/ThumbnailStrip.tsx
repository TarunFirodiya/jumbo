
import { memo } from 'react';

interface ThumbnailStripProps {
  displayImages: string[];
  currentSlide: number;
  setCurrentSlide: (index: number) => void;
}

export const ThumbnailStrip = memo(function ThumbnailStrip({
  displayImages,
  currentSlide,
  setCurrentSlide
}: ThumbnailStripProps) {
  if (displayImages.length <= 1) {
    return null;
  }

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex gap-2">
        {displayImages.map((image, index) => (
          <div
            key={index}
            className={`w-20 h-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-md ${
              currentSlide === index ? "ring-2 ring-white" : ""
            }`}
            onClick={() => setCurrentSlide(index)}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
});
