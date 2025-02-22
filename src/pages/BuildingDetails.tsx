import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ImageCarousel } from "@/components/building/ImageCarousel";
import { BuildingHeader } from "@/components/building/BuildingHeader";
import { BasicDetails } from "@/components/building/BasicDetails";
import { LocationTab } from "@/components/building/tabs/LocationTab";
import { AmenitiesTab } from "@/components/building/tabs/AmenitiesTab";
import { ReviewsTab } from "@/components/building/tabs/ReviewsTab";
import { ListingVariants } from "@/components/building/ListingVariants";
import { useBuildingData } from "@/components/building/hooks/useBuildingData";
import { useShortlist } from "@/components/building/hooks/useShortlist";
import { useState } from "react";

export default function BuildingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const { building, listings, isLoading } = useBuildingData(id!);
  const { isShortlisted, toggleShortlist } = useShortlist(id!, building?.name || '');

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!building) {
    return <div className="container mx-auto px-4 py-8">Building not found</div>;
  }

  const startingPrice = listings?.length 
    ? Math.min(...listings.map(l => Number(l.price || 0))) 
    : Number(building.min_price || 0);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <BuildingHeader
            name={building.name}
            locality={building.locality || ''}
            googleRating={building.google_rating}
            isShortlisted={isShortlisted || false}
            onToggleShortlist={toggleShortlist}
            startingPrice={startingPrice}
          />
        </div>
      </div>

      <ImageCarousel 
        images={building.images || []} 
        onImageClick={() => setShowAllPhotos(true)}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Desktop: Two-column layout */}
        <div className="hidden md:grid md:grid-cols-2 gap-8 mb-8">
          <BasicDetails
            totalFloors={building.total_floors}
            age={building.age?.toString()}
            pricePsqft={building.price_psqft}
            minPrice={building.min_price}
            maxPrice={building.max_price}
            water={building.water}
            bank={building.bank}
          />
          <div className="sticky top-28">
            <ListingVariants 
              listings={listings} 
              buildingId={building.id}
              buildingName={building.name}
            />
          </div>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="md:hidden space-y-8">
          <ListingVariants 
            listings={listings} 
            buildingId={building.id}
            buildingName={building.name}
            isMobile={true}
          />
          <BasicDetails
            totalFloors={building.total_floors}
            age={building.age?.toString()}
            pricePsqft={building.price_psqft}
            minPrice={building.min_price}
            maxPrice={building.max_price}
            water={building.water}
            bank={building.bank}
          />
        </div>

        <Tabs defaultValue="location" className="w-full">
          {isMobile ? (
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex w-max border-b rounded-none p-0">
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="reviews" disabled={!building.google_rating}>Reviews</TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <TabsList className="w-full justify-start">
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="reviews" disabled={!building.google_rating}>Reviews</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="location">
            <LocationTab
              latitude={building.latitude}
              longitude={building.longitude}
              buildingName={building.name}
            />
          </TabsContent>

          <TabsContent value="amenities">
            <AmenitiesTab features={building.features} />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
