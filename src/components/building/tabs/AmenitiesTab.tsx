
import { Card } from "@/components/ui/card";
import { AmenitiesGrid } from "../AmenitiesGrid";
import { useEffect } from "react";

interface AmenitiesTabProps {
  features: string[];
}

export function AmenitiesTab({ features }: AmenitiesTabProps) {
  useEffect(() => {
    console.log("AmenitiesTab rendered with features:", features?.length);
  }, [features]);

  return (
    <div>
      {features && features.length > 0 ? (
        <AmenitiesGrid features={features} />
      ) : (
        <p className="text-muted-foreground">No amenities information available</p>
      )}
    </div>
  );
}
