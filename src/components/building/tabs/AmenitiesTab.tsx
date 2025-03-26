
import { Card } from "@/components/ui/card";
import { AmenitiesGrid } from "../AmenitiesGrid";
import { useEffect } from "react";

interface AmenitiesTabProps {
  features: string[];
}

export function AmenitiesTab({ features }: AmenitiesTabProps) {
  // Ensure features is an array and filter out any empty or null values
  const processedFeatures = Array.isArray(features) 
    ? features.filter(Boolean).map(f => String(f)) 
    : [];
  
  useEffect(() => {
    console.log("AmenitiesTab rendered with features:", {
      originalFeatures: features,
      processedFeatures,
      originalLength: features?.length,
      processedLength: processedFeatures.length
    });
  }, [features, processedFeatures]);

  return (
    <div>
      {processedFeatures.length > 0 ? (
        <AmenitiesGrid features={processedFeatures} />
      ) : (
        <p className="text-muted-foreground">No amenities information available</p>
      )}
    </div>
  );
}
