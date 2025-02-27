
import { useParams, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageCarousel } from "@/components/building/ImageCarousel";
import { BuildingHeader } from "@/components/building/BuildingHeader";
import { BasicDetails } from "@/components/building/BasicDetails";
import { LocationTab } from "@/components/building/tabs/LocationTab";
import { AmenitiesTab } from "@/components/building/tabs/AmenitiesTab";
import { ReviewsTab } from "@/components/building/tabs/ReviewsTab";
import { ListingVariants } from "@/components/building/ListingVariants";
import { useBuildingData } from "@/components/building/hooks/useBuildingData";
import { useShortlist } from "@/components/building/hooks/useShortlist";
import { useState, useCallback, useMemo } from "react";

export default function BuildingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedListing, setSelectedListing] = useState<string | null>(null);

  const { building, listings, isLoading } = useBuildingData(id!);
  const { isShortlisted, toggleShortlist } = useShortlist(id!, building?.name || '');

  // Memoize expensive calculations
  const startingPrice = useMemo(() => {
    if (!listings?.length) return Number(building?.min_price || 0);
    return Math.min(...listings.map(l => Number(l.price || 0)));
  }, [listings, building?.min_price]);

  // Get images based on selected listing or fallback to building images
  const displayImages = useMemo(() => {
    if (selectedListing && listings) {
      const selectedListingImages = listings.find(l => l.id === selectedListing)?.images;
      return selectedListingImages?.length ? selectedListingImages : building?.images || [];
    }
    return building?.images || [];
  }, [selectedListing, listings, building?.images]);

  // Use callback for event handlers
  const handleListingSelect = useCallback((id: string) => {
    setSelectedListing(id);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 rounded-full border-4 border-t-primary animate-spin"></div>
      </div>
    );
  }

  if (!building) {
    return <div className="container mx-auto px-4 py-8">Building not found</div>;
  }

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

      <ImageCarousel images={displayImages} />

      <div className="container mx-auto px-4 py-8">
        {/* Mobile: Stacked layout */}
        <div className="md:hidden space-y-8">
          <ListingVariants 
            listings={listings} 
            buildingId={building.id}
            buildingName={building.name}
            isMobile={true}
            onListingSelect={handleListingSelect}
            selectedListingId={selectedListing}
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
          
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-semibold mb-6">Where is the home</h2>
              <LocationTab
                latitude={building.latitude}
                longitude={building.longitude}
                buildingName={building.name}
              />
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-6">What this place offers</h2>
              <AmenitiesTab features={building.features} />
            </section>

            {building.google_rating && (
              <section>
                <h2 className="text-2xl font-semibold mb-6">What people say</h2>
                <ReviewsTab />
              </section>
            )}
          </div>
        </div>

        {/* Desktop: Two-column layout */}
        <div className="hidden md:grid md:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-12">
            <BasicDetails
              totalFloors={building.total_floors}
              age={building.age?.toString()}
              pricePsqft={building.price_psqft}
              minPrice={building.min_price}
              maxPrice={building.max_price}
              water={building.water}
              bank={building.bank}
            />

            <section>
              <h2 className="text-2xl font-semibold mb-6">Where is the home</h2>
              <LocationTab
                latitude={building.latitude}
                longitude={building.longitude}
                buildingName={building.name}
              />
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-6">What this place offers</h2>
              <AmenitiesTab features={building.features} />
            </section>

            {building.google_rating && (
              <section>
                <h2 className="text-2xl font-semibold mb-6">What people say</h2>
                <ReviewsTab />
              </section>
            )}
          </div>

          <div>
            <ListingVariants 
              listings={listings} 
              buildingId={building.id}
              buildingName={building.name}
              onListingSelect={handleListingSelect}
              selectedListingId={selectedListing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
