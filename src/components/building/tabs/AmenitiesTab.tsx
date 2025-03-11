
import { Card } from "@/components/ui/card";
import { AmenitiesGrid } from "../AmenitiesGrid";
import { Json } from "@/integrations/supabase/types";

interface AmenitiesTabProps {
  features: string[];
}

export function AmenitiesTab({ features }: AmenitiesTabProps) {
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
