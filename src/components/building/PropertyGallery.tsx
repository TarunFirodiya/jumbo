
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PropertyGalleryProps {
  images: string[];
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-video bg-muted flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="w-full rounded-lg overflow-hidden bg-muted">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:grid-rows-2 md:h-[500px]">
          <div className="md:col-span-2 md:row-span-2">
            <img
              src={images[0]}
              alt="Primary property view"
              className="w-full h-full object-cover rounded-tl-lg rounded-tr-lg md:rounded-tr-none md:rounded-bl-lg"
            />
          </div>
          
          <div className="hidden md:block">
            {images.length > 1 && (
              <img
                src={images[1]}
                alt="Property view 2"
                className="w-full h-full object-cover rounded-tr-lg"
              />
            )}
          </div>
          
          <div className="hidden md:block relative">
            {images.length > 2 && (
              <>
                <img
                  src={images[2]}
                  alt="Property view 3"
                  className="w-full h-full object-cover rounded-br-lg"
                />
                {images.length > 3 && (
                  <div 
                    className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer rounded-br-lg"
                    onClick={() => setOpen(true)}
                  >
                    <p className="text-white font-medium text-lg">
                      +{images.length - 3} Photos
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="p-4 md:hidden flex justify-center">
          <Button
            variant="outline"
            onClick={() => setOpen(true)}
            className="w-full max-w-sm"
          >
            View All Photos
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-screen-lg p-0 bg-black h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <p className="font-medium">
              {currentIndex + 1} / {images.length}
            </p>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={() => setOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative">
            <img
              src={images[currentIndex]}
              alt={`Property view ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="p-4 overflow-x-auto">
            <div className="flex gap-2">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`w-20 h-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-md ${
                    currentIndex === index ? "ring-2 ring-white" : ""
                  }`}
                  onClick={() => setCurrentIndex(index)}
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
        </DialogContent>
      </Dialog>
    </>
  );
}
