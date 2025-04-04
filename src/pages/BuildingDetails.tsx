import { useParams, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { PropertyGallery } from "@/components/building/PropertyGallery";
import { BuildingHeader } from "@/components/building/BuildingHeader";
import { PropertyDetailsSection } from "@/components/building/PropertyDetailsSection";
import { BreadcrumbNav } from "@/components/building/BreadcrumbNav";
import { ListingVariants } from "@/components/building/ListingVariants";
import { SimilarProperties } from "@/components/building/SimilarProperties";
import { useBuildingData, BuildingWithFeatures } from "@/components/building/hooks/useBuildingData";
import { useShortlist } from "@/components/building/hooks/useShortlist";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { ChevronUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { AmenitiesGrid } from "@/components/building/AmenitiesGrid";
import { LocationTab } from "@/components/building/tabs/LocationTab";
import { generateBuildingSlug, extractIdFromSlug } from "@/utils/slugUtils";

export default function BuildingDetails() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const isScrolled = useScrollAnimation();

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const buildingId = useMemo(() => {
    if (id) return id;
    if (slug) {
      const extractedId = extractIdFromSlug(slug);
      console.log("Extracted ID from slug:", extractedId);
      if (extractedId) return extractedId;
    }
    return "";
  }, [id, slug]);

  console.log("Building ID for data fetching:", buildingId);

  const {
    building,
    listings,
    isLoading,
    error,
    isValidId
  } = useBuildingData(buildingId);
  
  const {
    isShortlisted,
    toggleShortlist
  } = useShortlist(buildingId, building?.name || '');

  useEffect(() => {
    if (building && id && !slug) {
      const seoSlug = generateBuildingSlug(
        building.name,
        building.locality,
        building.bhk_types,
        building.id
      );
      navigate(`/property/${seoSlug}`, { replace: true });
    }
  }, [building, id, slug, navigate]);

  useEffect(() => {
    if (listings && listings.length > 0 && !selectedListing) {
      setSelectedListing(listings[0].id);
    }
  }, [listings, selectedListing]);

  const startingPrice = useMemo(() => {
    if (!listings?.length) return Number(building?.min_price || 0);
    return Math.min(...listings.map(l => Number(l.price || 0)));
  }, [listings, building?.min_price]);

  // Get the selected listing's media content (either new format or legacy)
  const selectedListingData = useMemo(() => {
    if (selectedListing && listings) {
      return listings.find(l => l.id === selectedListing);
    }
    return null;
  }, [selectedListing, listings]);
  
  // Determine which images to display based on selected listing
  const displayImages = useMemo(() => {
    if (selectedListingData?.images?.length) {
      return selectedListingData.images;
    }
    return building?.images || [];
  }, [selectedListingData, building?.images]);

  // Get media content from either selected listing or building
  const mediaContent = useMemo(() => {
    // First try to get from selected listing
    if (selectedListingData?.media_content) {
      return selectedListingData.media_content as Record<string, string[]>;
    }
    // If not available in listing, try to get from building
    if (building?.media_content) {
      return building.media_content as Record<string, string[]>;
    }
    return null;
  }, [selectedListingData, building]);

  const handleListingSelect = useCallback((id: string) => {
    setSelectedListing(id);
  }, []);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: building?.name || 'Property Details',
        text: `Check out this property: ${building?.name}`,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied to clipboard",
        description: "You can now share it with anyone."
      });
    }
  }, [building?.name, toast]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isValidId && buildingId) {
    return <>
        <SEO 
          title="Invalid Property ID | Cozy Dwell Search" 
          description="The property ID provided is not valid. Please try searching for properties from our main listing page."
          noindex={true}
        />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Property ID</h1>
          <p className="mb-4">The property ID in the URL is not in a valid format.</p>
          <Button onClick={() => navigate('/buildings')}>Browse All Properties</Button>
        </div>
      </>;
  }

  if (isLoading) {
    return <>
        <SEO 
          title="Loading Property Details | Cozy Dwell Search"
          description="Please wait while we load the property details."
          noindex={true}
        />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="h-12 w-12 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
      </>;
  }

  if (!building) {
    return <>
        <SEO 
          title="Property Not Found | Cozy Dwell Search"
          description="We couldn't find the property you're looking for. Please try browsing our other available properties."
          noindex={true}
        />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <p className="mb-4">We couldn't find the property you're looking for.</p>
          <Button onClick={() => navigate('/buildings')}>Browse All Properties</Button>
        </div>
      </>;
  }

  const amenitiesArray = building.amenities || [];
  const stringFeatures = Array.isArray(amenitiesArray) ? amenitiesArray.map(f => String(f)) : [];
  const amenitiesText = stringFeatures.slice(0, 3).join(', ');

  const seoSlug = generateBuildingSlug(
    building.name,
    building.locality,
    building.bhk_types,
    building.id
  );
  const canonicalUrl = `/property/${seoSlug}`;

  const keywords = [
    `${building.bhk_types?.join(', ')} BHK`,
    building.name,
    building.locality || 'luxury homes',
    'property for sale',
    ...stringFeatures.slice(0, 5)
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    "name": building.name,
    "description": `${building.bhk_types?.join(', ')} BHK apartments in ${building.locality}. Starting at ₹${(startingPrice / 10000000).toFixed(1)} Cr. Features: ${amenitiesText}.`,
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
    "petsAllowed": stringFeatures.some(f => f.toLowerCase().includes("pet")),
    "yearBuilt": building.age ? new Date().getFullYear() - building.age : undefined,
    "floorSize": {
      "@type": "QuantitativeValue",
      "unitText": "SQFT"
    },
    "amenityFeature": stringFeatures.map(feature => ({
      "@type": "LocationFeatureSpecification",
      "name": feature
    })),
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": startingPrice,
      "validFrom": new Date().toISOString()
    },
    "telephone": "+91-8800000000",
    "url": `https://www.cozydwellsearch.com${canonicalUrl}`
  };

  return <div className="min-h-screen flex flex-col relative">
      <SEO 
        title={`${building.name} | ${building.bhk_types?.join(', ')} BHK in ${building.locality}`} 
        description={`${building.bhk_types?.join(', ')} BHK apartments available in ${building.locality}. Starting at ₹${(startingPrice / 10000000).toFixed(1)} Cr. Features: ${amenitiesText}.`} 
        canonical={canonicalUrl} 
        ogImage={building.images?.[0] || ''} 
        type="article" 
        structuredData={structuredData}
        keywords={keywords}
        publishedTime={building.created_at ? new Date(building.created_at).toISOString() : undefined}
        modifiedTime={building.updated_at ? new Date(building.updated_at).toISOString() : undefined}
      />

      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav buildingName={building.name} locality={building.locality || ''} />
      </div>

      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <BuildingHeader name={building.name} locality={building.locality || ''} googleRating={building.google_rating} isShortlisted={isShortlisted || false} onToggleShortlist={toggleShortlist} startingPrice={startingPrice} onShareClick={handleShare} />
        </div>
      </div>

      <PropertyGallery 
        images={displayImages} 
        videoThumbnail={building.video_thumbnail} 
        streetView={building.street_view} 
        floorPlanImage={selectedListingData?.floor_plan_image || null}
        aiStagedPhotos={selectedListingData?.ai_staged_photos || null}
        mediaContent={mediaContent}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="md:hidden space-y-8 pb-24">
          <ListingVariants listings={listings} buildingId={building.id} buildingName={building.name} isMobile={true} onListingSelect={handleListingSelect} selectedListingId={selectedListing} />
          
          <PropertyDetailsSection totalFloors={building.total_floors} age={building.age?.toString()} pricePsqft={building.price_psqft} water={building.water} bhkTypes={building.bhk_types} totalUnits={building.total_units} />
          
          <motion.div className="space-y-6" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.1
        }}>
            <h2 className="text-2xl font-semibold">Location</h2>
            <LocationTab 
              latitude={building.latitude} 
              longitude={building.longitude} 
              buildingName={building.name}
              nearbyPlaces={building.nearby_places} 
            />
          </motion.div>
          
          <motion.div className="space-y-6" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.2
        }}>
            <h2 className="text-2xl font-semibold">Amenities</h2>
            <AmenitiesGrid features={stringFeatures} />
          </motion.div>
          
          <SimilarProperties 
            currentBuildingId={building.id} 
            bhkTypes={building.bhk_types} 
            locality={building.locality} 
            minPrice={building.min_price} 
          />
        </div>

        <div className="hidden md:grid md:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-12">
            <PropertyDetailsSection totalFloors={building.total_floors} age={building.age?.toString()} pricePsqft={building.price_psqft} water={building.water} bhkTypes={building.bhk_types} totalUnits={building.total_units} />

            <motion.div className="space-y-6" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.1
          }}>
              <h2 className="text-2xl font-semibold">Location</h2>
              <LocationTab 
                latitude={building.latitude} 
                longitude={building.longitude} 
                buildingName={building.name}
                nearbyPlaces={building.nearby_places}
              />
            </motion.div>
            
            <motion.div className="space-y-6" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.2
          }}>
              <h2 className="text-2xl font-semibold">Amenities</h2>
              <AmenitiesGrid features={stringFeatures} />
            </motion.div>
            
            <SimilarProperties 
              currentBuildingId={building.id} 
              bhkTypes={building.bhk_types} 
              locality={building.locality} 
              minPrice={building.min_price} 
            />
          </div>

          <div>
            <div className="md:sticky md:top-28">
              <ListingVariants listings={listings} buildingId={building.id} buildingName={building.name} onListingSelect={handleListingSelect} selectedListingId={selectedListing} />
            </div>
          </div>
        </div>
      </div>
      
      {showBackToTop && <Button onClick={scrollToTop} className="fixed bottom-6 right-6 z-50 size-12 rounded-full shadow-lg p-0" size="icon">
          <ChevronUp className="h-6 w-6" />
        </Button>}
    </div>;
}
