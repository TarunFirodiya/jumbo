import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { SEO } from "@/components/seo/SEO";
import { ImageCarousel } from "@/components/building/ImageCarousel";
import { BuildingFeatures } from "@/components/building/BuildingFeatures";
import { BuildingPricing } from "@/components/building/BuildingPricing";
import { BuildingLocation } from "@/components/building/BuildingLocation";
import { BuildingOverview } from "@/components/building/BuildingOverview";
import { BuildingAmenities } from "@/components/building/BuildingAmenities";
import { BuildingGallery } from "@/components/building/BuildingGallery";
import { BuildingContact } from "@/components/building/BuildingContact";
import { ChevronLeft } from "lucide-react";

export default function BuildingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { data: building, isLoading } = useQuery({
    queryKey: ['building', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!building) {
    return <div className="container mx-auto px-4 py-8">Building not found</div>;
  }

  const startingPrice = building.min_price || 0;
  const features = Array.isArray(building.features) ? building.features : [];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    "name": building.name,
    "description": `${building.bhk_types?.join(', ')} BHK apartments available in ${building.locality}. Starting at ₹${(startingPrice/10000000).toFixed(1)} Cr.`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": building.locality,
      "addressRegion": building.sub_locality
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": building.latitude,
      "longitude": building.longitude
    },
    "image": building.images?.[0],
    "amenities": features,
    "numberOfRooms": building.bhk_types?.[0],
    "priceRange": `₹${(building.min_price/10000000).toFixed(1)} Cr - ₹${(building.max_price/10000000).toFixed(1)} Cr`
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`${building.name} | ${building.bhk_types?.join(', ')} BHK in ${building.locality} | Your Domain`}
        description={`${building.bhk_types?.join(', ')} BHK apartments available in ${building.locality}. Starting at ₹${(startingPrice/10000000).toFixed(1)} Cr. ${features.slice(0, 3).join(', ')} and more amenities.`}
        canonical={`/buildings/${building.id}`}
        ogImage={building.images?.[0]}
        type="article"
        structuredData={structuredData}
      />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ImageCarousel images={building.images || []} />
          </div>

          <div className="space-y-8">
            <BuildingOverview building={building} />
            <BuildingPricing building={building} />
            <BuildingFeatures building={building} />
          </div>
        </div>

        <div className="mt-12 space-y-12">
          <BuildingAmenities building={building} />
          <BuildingLocation building={building} />
          <BuildingGallery building={building} />
          <BuildingContact building={building} />
        </div>
      </div>
    </div>
  );
}
