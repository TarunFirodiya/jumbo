
import { Card } from "@/components/ui/card";
import { AmenitiesGrid } from "../AmenitiesGrid";
import { Json } from "@/integrations/supabase/types";

interface AmenitiesTabProps {
  features: Json | null;
}

export function AmenitiesTab({ features }: AmenitiesTabProps) {
  return (
    <div>
      {features && Array.isArray(features) ? (
        <AmenitiesGrid features={features.map(f => String(f))} />
      ) : (
        <p className="text-muted-foreground">No amenities information available</p>
      )}
    </div>
  );
}
