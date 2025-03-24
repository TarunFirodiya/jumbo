
import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselControlsProps {
  displayImages: string[];
  currentSlide: number;
  setCurrentSlide: (index: number) => void;
  showThumbnails?: boolean;
}

export const CarouselControls = memo(function CarouselControls({ 
  displayImages, 
  currentSlide, 
  setCurrentSlide, 
  showThumbnails = true 
}: CarouselControlsProps) {
  if (displayImages.length <= 1) {
    return null;
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = currentSlide === 0 ? displayImages.length - 1 : currentSlide - 1;
    setCurrentSlide(newIndex);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = currentSlide === displayImages.length - 1 ? 0 : currentSlide + 1;
    setCurrentSlide(newIndex);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="sr-only">Previous image</span>
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
        onClick={goToNext}
      >
        <ChevronRight className="h-6 w-6" />
        <span className="sr-only">Next image</span>
      </Button>

      {showThumbnails && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {displayImages.map((_, index) => (
            <button
              key={index}
              className={`h-1.5 w-1.5 rounded-full bg-white/80 transition-all ${
                currentSlide === index ? "w-2.5 opacity-100" : "opacity-60"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(index);
              }}
            >
              <span className="sr-only">Image {index + 1}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
});
