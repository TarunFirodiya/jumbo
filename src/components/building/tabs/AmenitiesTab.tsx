
import { Card } from "@/components/ui/card";
import { AmenitiesGrid } from "../AmenitiesGrid";
import { Json } from "@/integrations/supabase/types";

interface AmenitiesTabProps {
  features: Json | null;
}

export function AmenitiesTab({ features }: AmenitiesTabProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Amenities</h3>
      {features && Array.isArray(features) ? (
        <AmenitiesGrid features={features.map(f => String(f))} />
      ) : (
        <p className="text-muted-foreground">No amenities information available</p>
      )}
    </Card>
  );
}
