
import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus, Upload, Image as ImageIcon, Video, Map, Sparkles, File } from "lucide-react";
import { toast } from "sonner";

interface MediaContentManagerProps {
  mediaContent: Record<string, string[]>;
  onChange: (mediaContent: Record<string, string[]>) => void;
  onCancel?: () => void;
}

type MediaCategory = 'regular' | 'ai' | 'video' | 'streetView' | 'floorPlan';

export function MediaContentManager({
  mediaContent = {},
  onChange,
  onCancel
}: MediaContentManagerProps) {
  const [activeTab, setActiveTab] = useState<MediaCategory>('regular');
  const [newRoomName, setNewRoomName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  
  // Group keys into categories
  const getRegularRooms = () => {
    return Object.keys(mediaContent).filter(key => 
      !key.toLowerCase().includes('imagine') && 
      !key.toLowerCase().includes('video') && 
      !key.toLowerCase().includes('streetview') && 
      !key.toLowerCase().includes('floorplan')
    );
  };
  
  const getAiRooms = () => {
    return Object.keys(mediaContent).filter(key => 
      key.toLowerCase().includes('imagine')
    );
  };
  
  const getVideoKeys = () => {
    return Object.keys(mediaContent).filter(key => 
      key.toLowerCase().includes('video')
    );
  };
  
  const getStreetViewKeys = () => {
    return Object.keys(mediaContent).filter(key => 
      key.toLowerCase().includes('streetview') ||
      key.toLowerCase() === 'street view'
    );
  };
  
  const getFloorPlanKeys = () => {
    return Object.keys(mediaContent).filter(key => 
      key.toLowerCase().includes('floorplan') ||
      key.toLowerCase() === 'floor plan'
    );
  };
  
  const handleAddMedia = useCallback(() => {
    if (!newRoomName.trim()) {
      toast.error("Please enter a room or category name");
      return;
    }
    
    if (!newUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    
    let key = newRoomName.trim();
    
    // Format key based on active tab
    if (activeTab === 'ai') {
      if (!key.toLowerCase().endsWith('_imagine')) {
        key = `${key}_Imagine`;
      }
    } else if (activeTab === 'video') {
      if (!key.toLowerCase().includes('video')) {
        key = `${key} Video`;
      }
    } else if (activeTab === 'streetView') {
      if (!key.toLowerCase().includes('streetview')) {
        key = `${key} StreetView`;
      }
    } else if (activeTab === 'floorPlan') {
      if (!key.toLowerCase().includes('floorplan')) {
        key = `${key} FloorPlan`;
      }
    }
    
    // Update the media content
    const updatedMediaContent = { ...mediaContent };
    if (!updatedMediaContent[key]) {
      updatedMediaContent[key] = [];
    }
    updatedMediaContent[key].push(newUrl.trim());
    
    onChange(updatedMediaContent);
    setNewUrl('');
    toast.success(`Media added to ${key}`);
  }, [activeTab, newRoomName, newUrl, mediaContent, onChange]);
  
  const handleRemoveUrl = useCallback((key: string, index: number) => {
    const updatedMediaContent = { ...mediaContent };
    updatedMediaContent[key] = updatedMediaContent[key].filter((_, i) => i !== index);
    
    // Remove the key if there are no URLs left
    if (updatedMediaContent[key].length === 0) {
      delete updatedMediaContent[key];
    }
    
    onChange(updatedMediaContent);
    toast.success(`Media removed from ${key}`);
  }, [mediaContent, onChange]);
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'regular':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Room name (e.g., Living Room, Master Bedroom)"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
              <Input 
                placeholder="Image URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
              <Button onClick={handleAddMedia} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {getRegularRooms().map(room => (
                <div key={room} className="border p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{room}</h3>
                  </div>
                  <div className="space-y-2">
                    {mediaContent[room].map((url, index) => (
                      <div key={`${room}_${index}`} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 w-full overflow-hidden">
                          <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <span className="truncate text-sm">{url}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveUrl(room, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {getRegularRooms().length === 0 && (
                <div className="flex flex-col items-center justify-center text-muted-foreground p-8 border border-dashed rounded-md">
                  <ImageIcon className="h-8 w-8 mb-2" />
                  <p>No regular photos added yet</p>
                  <p className="text-sm">Add some photos to rooms using the form above</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'ai':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Room name (e.g., Living Room, Kitchen)"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
              <Input 
                placeholder="AI Generated Image URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
              <Button onClick={handleAddMedia} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {getAiRooms().map(room => (
                <div key={room} className="border p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{room}</h3>
                  </div>
                  <div className="space-y-2">
                    {mediaContent[room].map((url, index) => (
                      <div key={`${room}_${index}`} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 w-full overflow-hidden">
                          <div className="h-10 w-10 bg-purple-100 rounded flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                          </div>
                          <span className="truncate text-sm">{url}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveUrl(room, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {getAiRooms().length === 0 && (
                <div className="flex flex-col items-center justify-center text-muted-foreground p-8 border border-dashed rounded-md">
                  <Sparkles className="h-8 w-8 mb-2" />
                  <p>No AI staged photos added yet</p>
                  <p className="text-sm">Add some AI staged photos to rooms using the form above</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'video':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Video type (e.g., 30Sec_Video, Tour Video)"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
              <Input 
                placeholder="Video URL (YouTube or direct link)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
              <Button onClick={handleAddMedia} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {getVideoKeys().map(key => (
                <div key={key} className="border p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{key}</h3>
                  </div>
                  <div className="space-y-2">
                    {mediaContent[key].map((url, index) => (
                      <div key={`${key}_${index}`} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 w-full overflow-hidden">
                          <div className="h-10 w-10 bg-red-100 rounded flex items-center justify-center">
                            <Video className="h-5 w-5 text-red-500" />
                          </div>
                          <span className="truncate text-sm">{url}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveUrl(key, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {getVideoKeys().length === 0 && (
                <div className="flex flex-col items-center justify-center text-muted-foreground p-8 border border-dashed rounded-md">
                  <Video className="h-8 w-8 mb-2" />
                  <p>No videos added yet</p>
                  <p className="text-sm">Add some videos using the form above</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'streetView':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Street View (e.g., Street View, Building Exterior)"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
              <Input 
                placeholder="Google Maps Street View URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
              <Button onClick={handleAddMedia} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {getStreetViewKeys().map(key => (
                <div key={key} className="border p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{key}</h3>
                  </div>
                  <div className="space-y-2">
                    {mediaContent[key].map((url, index) => (
                      <div key={`${key}_${index}`} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 w-full overflow-hidden">
                          <div className="h-10 w-10 bg-blue-100 rounded flex items-center justify-center">
                            <Map className="h-5 w-5 text-blue-500" />
                          </div>
                          <span className="truncate text-sm">{url}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveUrl(key, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {getStreetViewKeys().length === 0 && (
                <div className="flex flex-col items-center justify-center text-muted-foreground p-8 border border-dashed rounded-md">
                  <Map className="h-8 w-8 mb-2" />
                  <p>No street view added yet</p>
                  <p className="text-sm">Add a Google Street View link using the form above</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'floorPlan':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Floor Plan (e.g., FloorPlan, Layout)"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
              <Input 
                placeholder="Floor Plan Image URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
              <Button onClick={handleAddMedia} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {getFloorPlanKeys().map(key => (
                <div key={key} className="border p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{key}</h3>
                  </div>
                  <div className="space-y-2">
                    {mediaContent[key].map((url, index) => (
                      <div key={`${key}_${index}`} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 w-full overflow-hidden">
                          <div className="h-10 w-10 bg-green-100 rounded flex items-center justify-center">
                            <File className="h-5 w-5 text-green-500" />
                          </div>
                          <span className="truncate text-sm">{url}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveUrl(key, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {getFloorPlanKeys().length === 0 && (
                <div className="flex flex-col items-center justify-center text-muted-foreground p-8 border border-dashed rounded-md">
                  <File className="h-8 w-8 mb-2" />
                  <p>No floor plan added yet</p>
                  <p className="text-sm">Add a floor plan image using the form above</p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Media Content Manager</h2>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MediaCategory)}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="regular" className="flex items-center gap-1">
            <ImageIcon className="h-4 w-4" />
            <span>Regular Photos</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            <span>AI Staged</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-1">
            <Video className="h-4 w-4" />
            <span>Videos</span>
          </TabsTrigger>
          <TabsTrigger value="streetView" className="flex items-center gap-1">
            <Map className="h-4 w-4" />
            <span>Street View</span>
          </TabsTrigger>
          <TabsTrigger value="floorPlan" className="flex items-center gap-1">
            <File className="h-4 w-4" />
            <span>Floor Plan</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {renderTabContent()}
    </div>
  );
}
