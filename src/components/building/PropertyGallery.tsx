
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Image, Video, StreetView } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PropertyGalleryProps {
  images: string[];
  videoThumbnail?: string | null;
  streetView?: string | null;
  floorPlanImage?: string | null;
}

export function PropertyGallery({ images, videoThumbnail, streetView, floorPlanImage }: PropertyGalleryProps) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("photos");
  
  const hasMultipleMedia = (videoThumbnail || streetView || floorPlanImage) && images.length > 0;
  
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
        {hasMultipleMedia ? (
          <Tabs defaultValue="photos" className="w-full" onValueChange={setActiveTab}>
            <div className="px-4 pt-4">
              <TabsList className="w-full grid grid-cols-4 mb-4">
                <TabsTrigger value="photos" className="flex items-center gap-1">
                  <Image className="h-4 w-4" />
                  <span className="hidden sm:inline">Photos</span>
                </TabsTrigger>
                {videoThumbnail && (
                  <TabsTrigger value="video" className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    <span className="hidden sm:inline">Video</span>
                  </TabsTrigger>
                )}
                {streetView && (
                  <TabsTrigger value="streetView" className="flex items-center gap-1">
                    <StreetView className="h-4 w-4" />
                    <span className="hidden sm:inline">Street View</span>
                  </TabsTrigger>
                )}
                {floorPlanImage && (
                  <TabsTrigger value="floorPlan" className="flex items-center gap-1">
                    <Image className="h-4 w-4" />
                    <span className="hidden sm:inline">Floor Plan</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent value="photos" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:grid-rows-2 md:h-[500px]">
                <div className="md:col-span-2 md:row-span-2">
                  <img
                    src={images[0]}
                    alt="Primary property view"
                    className="w-full h-full object-cover rounded-tl-lg rounded-tr-lg md:rounded-tr-none md:rounded-bl-lg cursor-pointer"
                    onClick={() => {
                      setActiveTab("photos");
                      setCurrentIndex(0);
                      setOpen(true);
                    }}
                  />
                </div>
                
                <div className="hidden md:block">
                  {images.length > 1 && (
                    <img
                      src={images[1]}
                      alt="Property view 2"
                      className="w-full h-full object-cover rounded-tr-lg cursor-pointer"
                      onClick={() => {
                        setActiveTab("photos");
                        setCurrentIndex(1);
                        setOpen(true);
                      }}
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
                          onClick={() => {
                            setActiveTab("photos");
                            setOpen(true);
                          }}
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
                  onClick={() => {
                    setActiveTab("photos");
                    setOpen(true);
                  }}
                  className="w-full max-w-sm"
                >
                  View All Photos
                </Button>
              </div>
            </TabsContent>

            {videoThumbnail && (
              <TabsContent value="video" className="mt-0">
                <div className="aspect-video flex items-center justify-center relative">
                  <iframe 
                    src={videoThumbnail} 
                    className="w-full h-full md:h-[500px]" 
                    frameBorder="0" 
                    allowFullScreen
                    title="Property video"
                  ></iframe>
                </div>
              </TabsContent>
            )}

            {streetView && (
              <TabsContent value="streetView" className="mt-0">
                <div className="aspect-video flex items-center justify-center relative">
                  <iframe 
                    src={streetView} 
                    className="w-full h-full md:h-[500px]" 
                    frameBorder="0" 
                    allowFullScreen
                    title="Street view"
                  ></iframe>
                </div>
              </TabsContent>
            )}

            {floorPlanImage && (
              <TabsContent value="floorPlan" className="mt-0">
                <div className="flex items-center justify-center p-4 md:h-[500px]">
                  <img 
                    src={floorPlanImage} 
                    alt="Floor Plan" 
                    className="max-h-full object-contain" 
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:grid-rows-2 md:h-[500px]">
            <div className="md:col-span-2 md:row-span-2">
              <img
                src={images[0]}
                alt="Primary property view"
                className="w-full h-full object-cover rounded-tl-lg rounded-tr-lg md:rounded-tr-none md:rounded-bl-lg cursor-pointer"
                onClick={() => {
                  setCurrentIndex(0);
                  setOpen(true);
                }}
              />
            </div>
            
            <div className="hidden md:block">
              {images.length > 1 && (
                <img
                  src={images[1]}
                  alt="Property view 2"
                  className="w-full h-full object-cover rounded-tr-lg cursor-pointer"
                  onClick={() => {
                    setCurrentIndex(1);
                    setOpen(true);
                  }}
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
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-screen-lg p-0 bg-black h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <div className="flex items-center gap-2">
              {hasMultipleMedia && (
                <div className="flex rounded-full bg-white/10 p-1">
                  <TabsList className="bg-transparent border-none">
                    <TabsTrigger 
                      value="photos" 
                      onClick={() => setActiveTab("photos")}
                      className={`text-white ${activeTab === "photos" ? "bg-white/20" : "bg-transparent"}`}
                    >
                      Photos
                    </TabsTrigger>
                    {videoThumbnail && (
                      <TabsTrigger 
                        value="video" 
                        onClick={() => setActiveTab("video")}
                        className={`text-white ${activeTab === "video" ? "bg-white/20" : "bg-transparent"}`}
                      >
                        Video
                      </TabsTrigger>
                    )}
                    {streetView && (
                      <TabsTrigger 
                        value="streetView" 
                        onClick={() => setActiveTab("streetView")}
                        className={`text-white ${activeTab === "streetView" ? "bg-white/20" : "bg-transparent"}`}
                      >
                        Street View
                      </TabsTrigger>
                    )}
                    {floorPlanImage && (
                      <TabsTrigger 
                        value="floorPlan" 
                        onClick={() => setActiveTab("floorPlan")}
                        className={`text-white ${activeTab === "floorPlan" ? "bg-white/20" : "bg-transparent"}`}
                      >
                        Floor Plan
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>
              )}
              <p className="font-medium ml-2">
                {activeTab === "photos" && `${currentIndex + 1} / ${images.length}`}
              </p>
            </div>
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
            {activeTab === "photos" && (
              <>
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
              </>
            )}
            
            {activeTab === "video" && videoThumbnail && (
              <div className="w-full h-full flex items-center justify-center">
                <iframe 
                  src={videoThumbnail} 
                  className="w-full max-h-full max-w-full" 
                  style={{ height: "80vh" }}
                  frameBorder="0" 
                  allowFullScreen
                  title="Property video"
                ></iframe>
              </div>
            )}
            
            {activeTab === "streetView" && streetView && (
              <div className="w-full h-full flex items-center justify-center">
                <iframe 
                  src={streetView} 
                  className="w-full max-h-full max-w-full" 
                  style={{ height: "80vh" }}
                  frameBorder="0" 
                  allowFullScreen
                  title="Street view"
                ></iframe>
              </div>
            )}
            
            {activeTab === "floorPlan" && floorPlanImage && (
              <img 
                src={floorPlanImage} 
                alt="Floor Plan" 
                className="max-h-full max-w-full object-contain" 
              />
            )}
          </div>
          
          {activeTab === "photos" && (
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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
