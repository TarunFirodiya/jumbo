
import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Image as ImageIcon, 
  MapPin, 
  Video, 
  Sparkles, 
  X, 
  Upload, 
  ArrowUp, 
  ArrowDown, 
  Star
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface ImageUploaderProps {
  images?: string[];
  aiStagedPhotos?: string[];
  floorPlanImage?: string | null;
  videoThumbnail?: string | null;
  streetView?: string | null;
  onImagesChange?: (images: string[]) => void;
  onAiStagedPhotosChange?: (images: string[]) => void;
  onFloorPlanChange?: (url: string | null) => void;
  onVideoChange?: (url: string | null) => void;
  onStreetViewChange?: (url: string | null) => void;
  onThumbnailChange?: (url: string) => void;
}

type ImageCategory = 'regular' | 'aiStaged' | 'floorPlan' | 'video' | 'streetView';

export function ImageUploader({
  images = [],
  aiStagedPhotos = [],
  floorPlanImage,
  videoThumbnail,
  streetView,
  onImagesChange,
  onAiStagedPhotosChange,
  onFloorPlanChange,
  onVideoChange,
  onStreetViewChange,
  onThumbnailChange
}: ImageUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ImageCategory>('regular');
  const [draggedImage, setDraggedImage] = useState<{ index: number, category: ImageCategory } | null>(null);
  const [thumbnailIndex, setThumbnailIndex] = useState<number | null>(null);
  
  // Handle file uploads
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, category: ImageCategory) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // In a real application, you would upload these files to a server
    // For this demo, we'll create fake URLs
    const newImages = Array.from(files).map(file => {
      const fakeUrl = URL.createObjectURL(file);
      return fakeUrl;
    });
    
    switch (category) {
      case 'regular':
        if (onImagesChange) onImagesChange([...images, ...newImages]);
        break;
      case 'aiStaged':
        if (onAiStagedPhotosChange) onAiStagedPhotosChange([...aiStagedPhotos, ...newImages]);
        break;
      case 'floorPlan':
        if (onFloorPlanChange && newImages[0]) onFloorPlanChange(newImages[0]);
        break;
      case 'video':
        if (onVideoChange && newImages[0]) onVideoChange(newImages[0]);
        break;
      case 'streetView':
        if (onStreetViewChange && newImages[0]) onStreetViewChange(newImages[0]);
        break;
    }
    
    // Reset the input value to allow uploading the same file again
    e.target.value = '';
    
    toast.success(`${newImages.length} image(s) uploaded successfully to ${category} category`);
  }, [images, aiStagedPhotos, onImagesChange, onAiStagedPhotosChange, onFloorPlanChange, onVideoChange, onStreetViewChange]);
  
  // Handle image removal
  const handleRemoveImage = useCallback((index: number, category: ImageCategory) => {
    switch (category) {
      case 'regular':
        if (onImagesChange) {
          const newImages = [...images];
          newImages.splice(index, 1);
          onImagesChange(newImages);
        }
        break;
      case 'aiStaged':
        if (onAiStagedPhotosChange) {
          const newImages = [...aiStagedPhotos];
          newImages.splice(index, 1);
          onAiStagedPhotosChange(newImages);
        }
        break;
      case 'floorPlan':
        if (onFloorPlanChange) onFloorPlanChange(null);
        break;
      case 'video':
        if (onVideoChange) onVideoChange(null);
        break;
      case 'streetView':
        if (onStreetViewChange) onStreetViewChange(null);
        break;
    }
    
    toast.success(`Image removed from ${category} category`);
  }, [images, aiStagedPhotos, onImagesChange, onAiStagedPhotosChange, onFloorPlanChange, onVideoChange, onStreetViewChange]);
  
  // Handle reordering of images using arrow buttons
  const handleMoveImage = useCallback((index: number, direction: 'up' | 'down', category: ImageCategory) => {
    if (category === 'regular' && onImagesChange) {
      const newImages = [...images];
      if (direction === 'up' && index > 0) {
        [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
      } else if (direction === 'down' && index < newImages.length - 1) {
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      }
      onImagesChange(newImages);
    } else if (category === 'aiStaged' && onAiStagedPhotosChange) {
      const newImages = [...aiStagedPhotos];
      if (direction === 'up' && index > 0) {
        [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
      } else if (direction === 'down' && index < newImages.length - 1) {
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      }
      onAiStagedPhotosChange(newImages);
    }
  }, [images, aiStagedPhotos, onImagesChange, onAiStagedPhotosChange]);
  
  // Set image as thumbnail
  const handleSetThumbnail = useCallback((index: number, category: ImageCategory) => {
    let selectedImage: string | null = null;
    
    if (category === 'regular' && images[index]) {
      selectedImage = images[index];
      setThumbnailIndex(index);
    } else if (category === 'aiStaged' && aiStagedPhotos[index]) {
      selectedImage = aiStagedPhotos[index];
      setThumbnailIndex(index);
    }
    
    if (selectedImage && onThumbnailChange) {
      onThumbnailChange(selectedImage);
      toast.success('Thumbnail updated successfully');
    }
  }, [images, aiStagedPhotos, onThumbnailChange]);
  
  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'regular':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Regular Property Photos</h3>
              <div>
                <input
                  type="file"
                  id="regular-image-upload"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'regular')}
                />
                <label htmlFor="regular-image-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span><Upload className="h-4 w-4 mr-2" /> Upload Images</span>
                  </Button>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div 
                  key={`regular-${index}`}
                  className="relative group aspect-square rounded-md overflow-hidden border border-muted"
                >
                  <img 
                    src={image} 
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-full bg-black/40 text-white"
                        onClick={() => handleRemoveImage(index, 'regular')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full bg-black/40 text-white"
                          onClick={() => handleMoveImage(index, 'up', 'regular')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full bg-black/40 text-white"
                          onClick={() => handleMoveImage(index, 'down', 'regular')}
                          disabled={index === images.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-7 w-7 rounded-full ${thumbnailIndex === index ? 'bg-yellow-500 text-black' : 'bg-black/40 text-white'}`}
                        onClick={() => handleSetThumbnail(index, 'regular')}
                        title="Set as thumbnail"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {thumbnailIndex === index && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-xs px-2 py-1 rounded-full text-black">
                      Thumbnail
                    </div>
                  )}
                </div>
              ))}
              
              {images.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center border border-dashed rounded-md p-8 text-muted-foreground">
                  <ImageIcon className="h-10 w-10 mb-2" />
                  <p>No images uploaded yet</p>
                  <p className="text-sm">Upload some images to get started</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'aiStaged':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">AI Staged Photos</h3>
              <div>
                <input
                  type="file"
                  id="aiStaged-image-upload"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'aiStaged')}
                />
                <label htmlFor="aiStaged-image-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span><Upload className="h-4 w-4 mr-2" /> Upload AI Photos</span>
                  </Button>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {aiStagedPhotos.map((image, index) => (
                <div 
                  key={`aiStaged-${index}`}
                  className="relative group aspect-square rounded-md overflow-hidden border border-muted"
                >
                  <img 
                    src={image} 
                    alt={`AI Staged image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-full bg-black/40 text-white"
                        onClick={() => handleRemoveImage(index, 'aiStaged')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full bg-black/40 text-white"
                          onClick={() => handleMoveImage(index, 'up', 'aiStaged')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full bg-black/40 text-white"
                          onClick={() => handleMoveImage(index, 'down', 'aiStaged')}
                          disabled={index === aiStagedPhotos.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-7 w-7 rounded-full ${thumbnailIndex === index ? 'bg-yellow-500 text-black' : 'bg-black/40 text-white'}`}
                        onClick={() => handleSetThumbnail(index, 'aiStaged')}
                        title="Set as thumbnail"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="absolute top-2 left-2 bg-purple-500 text-xs px-2 py-1 rounded-full text-white flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>AI</span>
                  </div>
                  
                  {thumbnailIndex === index && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-xs px-2 py-1 rounded-full text-black">
                      Thumbnail
                    </div>
                  )}
                </div>
              ))}
              
              {aiStagedPhotos.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center border border-dashed rounded-md p-8 text-muted-foreground">
                  <Sparkles className="h-10 w-10 mb-2" />
                  <p>No AI-staged images uploaded yet</p>
                  <p className="text-sm">Upload some AI-generated images to enhance your listing</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'floorPlan':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Floor Plan</h3>
              <div>
                <input
                  type="file"
                  id="floorPlan-image-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'floorPlan')}
                />
                <label htmlFor="floorPlan-image-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span><Upload className="h-4 w-4 mr-2" /> Upload Floor Plan</span>
                  </Button>
                </label>
              </div>
            </div>
            
            {floorPlanImage ? (
              <div className="relative group aspect-video rounded-md overflow-hidden border border-muted">
                <img 
                  src={floorPlanImage} 
                  alt="Floor Plan"
                  className="w-full h-full object-contain bg-white"
                />
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-full bg-black/40 text-white"
                    onClick={() => handleRemoveImage(0, 'floorPlan')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed rounded-md p-12 text-muted-foreground">
                <ImageIcon className="h-10 w-10 mb-2" />
                <p>No floor plan uploaded yet</p>
                <p className="text-sm">Upload a floor plan to help buyers understand the property layout</p>
              </div>
            )}
          </div>
        );
        
      case 'video':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Property Video</h3>
              <div className="flex gap-2">
                <input
                  type="file"
                  id="video-upload"
                  className="hidden"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'video')}
                />
                <label htmlFor="video-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span><Upload className="h-4 w-4 mr-2" /> Upload Video</span>
                  </Button>
                </label>
                
                <input 
                  type="url"
                  placeholder="Or paste YouTube URL"
                  className="px-3 py-2 border rounded-md text-sm"
                  onBlur={(e) => {
                    if (e.target.value && onVideoChange) {
                      onVideoChange(e.target.value);
                      toast.success('Video URL added successfully');
                    }
                  }}
                />
              </div>
            </div>
            
            {videoThumbnail ? (
              <div className="relative group aspect-video rounded-md overflow-hidden border border-muted">
                {videoThumbnail.includes('youtube') || videoThumbnail.includes('youtu.be') ? (
                  <iframe 
                    src={videoThumbnail} 
                    className="w-full h-full" 
                    frameBorder="0" 
                    allowFullScreen
                    title="Property video"
                  ></iframe>
                ) : (
                  <video 
                    src={videoThumbnail} 
                    controls
                    className="w-full h-full object-contain"
                  ></video>
                )}
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-full bg-black/40 text-white"
                    onClick={() => handleRemoveImage(0, 'video')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed rounded-md p-12 text-muted-foreground">
                <Video className="h-10 w-10 mb-2" />
                <p>No video uploaded yet</p>
                <p className="text-sm">Upload a video or paste a YouTube URL to showcase your property</p>
              </div>
            )}
          </div>
        );
        
      case 'streetView':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Street View</h3>
              <div>
                <input 
                  type="url"
                  placeholder="Paste Google Street View URL"
                  className="px-3 py-2 border rounded-md text-sm w-full md:w-80"
                  onBlur={(e) => {
                    if (e.target.value && onStreetViewChange) {
                      onStreetViewChange(e.target.value);
                      toast.success('Street View URL added successfully');
                    }
                  }}
                />
              </div>
            </div>
            
            {streetView ? (
              <div className="relative group aspect-video rounded-md overflow-hidden border border-muted">
                <iframe 
                  src={streetView} 
                  className="w-full h-full" 
                  frameBorder="0" 
                  allowFullScreen
                  title="Street view"
                ></iframe>
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-full bg-black/40 text-white"
                    onClick={() => handleRemoveImage(0, 'streetView')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed rounded-md p-12 text-muted-foreground">
                <MapPin className="h-10 w-10 mb-2" />
                <p>No street view added yet</p>
                <p className="text-sm">Add a Google Street View URL to help buyers see the surroundings</p>
              </div>
            )}
          </div>
        );
    }
  };
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full">
        <ImageIcon className="mr-2 h-4 w-4" /> Manage Property Media
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Property Media Management</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ImageCategory)}>
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="regular" className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" /> Photos
              </TabsTrigger>
              <TabsTrigger value="aiStaged" className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" /> AI Staged
              </TabsTrigger>
              <TabsTrigger value="floorPlan" className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" /> Floor Plan
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-1">
                <Video className="h-4 w-4" /> Video
              </TabsTrigger>
              <TabsTrigger value="streetView" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Street View
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="mt-4 max-h-[60vh] overflow-y-auto p-1">
            {renderTabContent()}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsOpen(false);
              toast.success("Media updates saved successfully");
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
