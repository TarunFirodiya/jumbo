
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationTab } from "@/components/building/tabs/LocationTab";
import { AmenitiesTab } from "@/components/building/tabs/AmenitiesTab";
import { ReviewsTab } from "@/components/building/tabs/ReviewsTab";
import { Info, MapPin, Home, Star, FileText, Ruler } from "lucide-react";
import { NearbyPlaces } from "@/components/building/NearbyPlaces";

interface PropertyTabsProps {
  buildingName: string;
  latitude?: number | null;
  longitude?: number | null;
  features: string[];
  googleRating?: number;
  googleReviews?: any[]; // This would be extended as needed
  buildingSpecs?: any; // This would include additional building specifications
  nearbyPlaces?: any;
}

export function PropertyTabs({
  buildingName,
  latitude,
  longitude, 
  features,
  googleRating,
  googleReviews,
  buildingSpecs,
  nearbyPlaces
}: PropertyTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full mt-8">
      <TabsList className="grid grid-cols-5 md:w-fit w-full">
        <TabsTrigger value="overview" className="flex items-center gap-1">
          <Info className="h-4 w-4 md:mr-1 md:block hidden" />
          <span className="md:block hidden">Overview</span>
          <span className="md:hidden block">Info</span>
        </TabsTrigger>
        <TabsTrigger value="location" className="flex items-center gap-1">
          <MapPin className="h-4 w-4 md:mr-1 md:block hidden" />
          <span className="md:block hidden">Location</span>
          <span className="md:hidden block">Map</span>
        </TabsTrigger>
        <TabsTrigger value="amenities" className="flex items-center gap-1">
          <Home className="h-4 w-4 md:mr-1 md:block hidden" />
          <span className="md:block hidden">Amenities</span>
          <span className="md:hidden block">Features</span>
        </TabsTrigger>
        {googleRating && (
          <TabsTrigger value="reviews" className="flex items-center gap-1">
            <Star className="h-4 w-4 md:mr-1 md:block hidden" />
            <span className="md:block hidden">Reviews</span>
            <span className="md:hidden block">Rating</span>
          </TabsTrigger>
        )}
        <TabsTrigger value="documents" className="flex items-center gap-1">
          <FileText className="h-4 w-4 md:mr-1 md:block hidden" />
          <span className="md:block hidden">Documents</span>
          <span className="md:hidden block">Docs</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">About this property</h3>
            <p className="text-gray-600">
              This prestigious {buildingName} offers a perfect blend of modern living and convenience.
              Featuring {features.slice(0, 3).join(", ")}{features.length > 3 ? " and more" : ""}.
              Ideal for families looking for comfort and excellent connectivity.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Property Specifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
              <div>
                <p className="text-sm text-muted-foreground">Property Type</p>
                <p className="font-medium">Apartment</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Furnishing</p>
                <p className="font-medium">Unfurnished</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Parking</p>
                <p className="font-medium">Available</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Possession Status</p>
                <p className="font-medium">Ready to Move</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Units</p>
                <p className="font-medium">10 Units</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Construction Status</p>
                <p className="font-medium">Completed</p>
              </div>
            </div>
          </div>
          
          {nearbyPlaces && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Nearby Places</h3>
              <NearbyPlaces nearbyPlaces={nearbyPlaces} />
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="location" className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Location & Nearby</h3>
        <LocationTab
          latitude={latitude}
          longitude={longitude}
          buildingName={buildingName}
        />
      </TabsContent>
      
      <TabsContent value="amenities" className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Building Amenities</h3>
        <AmenitiesTab features={features} />
      </TabsContent>
      
      {googleRating && (
        <TabsContent value="reviews" className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Resident & Visitor Reviews</h3>
          <ReviewsTab />
        </TabsContent>
      )}
      
      <TabsContent value="documents" className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Legal Documents</h3>
        <div className="p-6 text-center border rounded-lg bg-gray-50">
          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-lg font-medium">Legal documents available on request</p>
          <p className="text-muted-foreground mt-1">Contact our support team to access legal documents</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
