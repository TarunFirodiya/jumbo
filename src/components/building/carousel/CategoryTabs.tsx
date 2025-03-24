
import { memo } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, Map, Video, Sparkles } from "lucide-react";

interface CategoryTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  videoThumbnail?: string | null;
  streetView?: string | null;
  floorPlanImage?: string | null;
  orientation?: "horizontal" | "vertical";
  className?: string;
  style?: "pills" | "sidebar";
}

export const CategoryTabs = memo(function CategoryTabs({
  activeTab,
  onTabChange,
  videoThumbnail,
  streetView,
  floorPlanImage,
  orientation = "horizontal",
  className = "",
  style = "pills"
}: CategoryTabsProps) {
  if (style === "sidebar") {
    return (
      <div className={className}>
        <Tabs value={activeTab} onValueChange={onTabChange} orientation="vertical">
          <TabsList className="bg-black/30 backdrop-blur-sm border border-white/20 flex flex-col h-auto">
            <TabsTrigger 
              value="photos" 
              className={`text-white ${activeTab === "photos" ? "bg-white/20" : "bg-transparent hover:bg-white/10"}`}
              title="Photos"
            >
              <ImageIcon className="h-5 w-5" />
            </TabsTrigger>
            
            {videoThumbnail && (
              <TabsTrigger 
                value="video" 
                className={`text-white ${activeTab === "video" ? "bg-white/20" : "bg-transparent hover:bg-white/10"}`}
                title="Video"
              >
                <Video className="h-5 w-5" />
              </TabsTrigger>
            )}
            
            {streetView && (
              <TabsTrigger 
                value="streetView" 
                className={`text-white ${activeTab === "streetView" ? "bg-white/20" : "bg-transparent hover:bg-white/10"}`}
                title="Street View"
              >
                <Map className="h-5 w-5" />
              </TabsTrigger>
            )}
            
            {floorPlanImage && (
              <TabsTrigger 
                value="floorPlan" 
                className={`text-white ${activeTab === "floorPlan" ? "bg-white/20" : "bg-transparent hover:bg-white/10"}`}
                title="Floor Plan"
              >
                <ImageIcon className="h-5 w-5" />
              </TabsTrigger>
            )}
            
            <TabsTrigger 
              value="imagine" 
              className={`text-white ${activeTab === "imagine" ? "bg-white/20" : "bg-transparent hover:bg-white/10"}`}
              title="AI Staged Images"
            >
              <Sparkles className="h-5 w-5" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    );
  }

  // Default pills style
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className={className}>
      <div className="flex rounded-full bg-white/10 p-1">
        <TabsList className="bg-transparent border-none">
          <TabsTrigger 
            value="photos" 
            className={`text-white ${activeTab === "photos" ? "bg-white/20" : "bg-transparent"}`}
          >
            Photos
          </TabsTrigger>
          {videoThumbnail && (
            <TabsTrigger 
              value="video" 
              className={`text-white ${activeTab === "video" ? "bg-white/20" : "bg-transparent"}`}
            >
              Video
            </TabsTrigger>
          )}
          {streetView && (
            <TabsTrigger 
              value="streetView" 
              className={`text-white ${activeTab === "streetView" ? "bg-white/20" : "bg-transparent"}`}
            >
              Street View
            </TabsTrigger>
          )}
          {floorPlanImage && (
            <TabsTrigger 
              value="floorPlan" 
              className={`text-white ${activeTab === "floorPlan" ? "bg-white/20" : "bg-transparent"}`}
            >
              Floor Plan
            </TabsTrigger>
          )}
          <TabsTrigger 
            value="imagine" 
            className={`text-white ${activeTab === "imagine" ? "bg-white/20" : "bg-transparent"}`}
          >
            AI Staged
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  );
});
