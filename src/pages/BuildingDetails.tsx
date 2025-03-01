import { useParams, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PropertyGallery } from "@/components/building/PropertyGallery";
import { BuildingHeader } from "@/components/building/BuildingHeader";
import { PropertyDetailsSection } from "@/components/building/PropertyDetailsSection";
import { PropertyTabs } from "@/components/building/PropertyTabs";
import { BreadcrumbNav } from "@/components/building/BreadcrumbNav";
import { ListingVariants } from "@/components/building/ListingVariants";
import { SimilarProperties } from "@/components/building/SimilarProperties";
import { useBuildingData } from "@/components/building/hooks/useBuildingData";
import { useShortlist } from "@/components/building/hooks/useShortlist";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Share2, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BuildingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { building, listings, isLoading } = useBuildingData(id!);
  const { isShortlisted, toggleShortlist } = useShortlist(id!, building?.name || '');

  useEffect(() => {
    if (listings && listings.length > 0 && !selectedListing) {
      setSelectedListing(listings[0].id);
    }
  }, [listings, selectedListing]);

  const startingPrice = useMemo(() => {
    if (!listings?.length) return Number(building?.min_price || 0);
    return Math.min(...listings.map(l => Number(l.price || 0)));
  }, [listings, building?.min_price]);

  const displayImages = useMemo(() => {
    if (selectedListing && listings) {
      const selectedListingImages = listings.find(l => l.id === selectedListing)?.images;
      return selectedListingImages?.length ? selectedListingImages : building?.images || [];
    }
    return building?.images || [];
  }, [selectedListing, listings, building?.images]);

  const handleListingSelect = useCallback((id: string) => {
    setSelectedListing(id);
  }, []);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: building?.name || 'Property Details',
        text: `Check out this property: ${building?.name}`,
        url: window.location.href,
      })
        .catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied to clipboard",
        description: "You can now share it with anyone.",
      });
    }
  }, [building?.name, toast]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <>
        <SEO title="Loading Property Details | Cozy Dwell Search" />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="h-12 w-12 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
      </>
    );
  }

  if (!building) {
    return (
      <>
        <SEO title="Property Not Found | Cozy Dwell Search" />
        <div className="container mx-auto px-4 py-8">Building not found</div>
      </>
    );
  }

  const features = Array.isArray(building.features) ? building.features.map(f => String(f)) : [];
  const amenitiesText = features.slice(0, 3).join(', ');
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    "name": building.name,
    "description": `${building.bhk_types?.join(', ')} BHK apartments in ${building.locality}. Starting at ₹${(startingPrice/10000000).toFixed(1)} Cr. Features: ${amenitiesText}.`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": building.locality,
      "addressRegion": "Delhi NCR",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": building.latitude,
      "longitude": building.longitude
    },
    "image": building.images?.[0],
    "numberOfRooms": building.bhk_types?.[0] || "",
    "petsAllowed": features.some(f => f.toLowerCase().includes("pet")),
    "yearBuilt": building.age ? new Date().getFullYear() - building.age : undefined,
    "floorSize": {
      "@type": "QuantitativeValue",
      "unitText": "SQFT"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": startingPrice,
      "validFrom": new Date().toISOString()
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <SEO
        title={`${building.name} | ${building.bhk_types?.join(', ')} BHK in ${building.locality}`}
        description={`${building.bhk_types?.join(', ')} BHK apartments available in ${building.locality}. Starting at ₹${(startingPrice/10000000).toFixed(1)} Cr. Features: ${amenitiesText}.`}
        canonical={`/buildings/${id}`}
        ogImage={building.images?.[0] || ''}
        type="article"
        structuredData={structuredData}
      />

      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav buildingName={building.name} locality={building.locality || ''} />
      </div>

      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <BuildingHeader
            name={building.name}
            locality={building.locality || ''}
            googleRating={building.google_rating}
            isShortlisted={isShortlisted || false}
            onToggleShortlist={toggleShortlist}
            startingPrice={startingPrice}
            onShareClick={handleShare}
          />
        </div>
      </div>

      <PropertyGallery images={displayImages} />

      <div className="container mx-auto px-4 py-8">
        <div className="md:hidden space-y-8 pb-24">
          <ListingVariants 
            listings={listings} 
            buildingId={building.id}
            buildingName={building.name}
            isMobile={true}
            onListingSelect={handleListingSelect}
            selectedListingId={selectedListing}
          />
          
          <PropertyDetailsSection
            totalFloors={building.total_floors}
            age={building.age?.toString()}
            pricePsqft={building.price_psqft}
            minPrice={building.min_price}
            maxPrice={building.max_price}
            water={building.water}
            bank={building.bank}
            bhkTypes={building.bhk_types}
          />
          
          <PropertyTabs
            buildingName={building.name}
            latitude={building.latitude}
            longitude={building.longitude}
            features={features}
            googleRating={building.google_rating}
          />
          
          <SimilarProperties 
            currentBuildingId={building.id}
            bhkTypes={building.bhk_types}
            locality={building.locality}
            minPrice={building.min_price}
            maxPrice={building.max_price}
          />
        </div>

        <div className="hidden md:grid md:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-12">
            <PropertyDetailsSection
              totalFloors={building.total_floors}
              age={building.age?.toString()}
              pricePsqft={building.price_psqft}
              minPrice={building.min_price}
              maxPrice={building.max_price}
              water={building.water}
              bank={building.bank}
              bhkTypes={building.bhk_types}
            />

            <PropertyTabs
              buildingName={building.name}
              latitude={building.latitude}
              longitude={building.longitude}
              features={features}
              googleRating={building.google_rating}
            />
            
            <SimilarProperties 
              currentBuildingId={building.id}
              bhkTypes={building.bhk_types}
              locality={building.locality}
              minPrice={building.min_price}
              maxPrice={building.max_price}
            />
          </div>

          <div>
            <div className="md:sticky md:top-28">
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
      
      {showBackToTop && (
        <Button 
          onClick={scrollToTop} 
          className="fixed bottom-6 right-6 z-50 size-12 rounded-full shadow-lg p-0"
          size="icon"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
