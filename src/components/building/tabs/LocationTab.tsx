
import { Card } from "@/components/ui/card";
import LocationMap from '@/components/LocationMap';

interface LocationTabProps {
  latitude?: number | null;
  longitude?: number | null;
  buildingName: string;
}

export function LocationTab({ latitude, longitude, buildingName }: LocationTabProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Location</h3>
      {latitude && longitude ? (
        <LocationMap
          latitude={latitude}
          longitude={longitude}
          buildingName={buildingName}
        />
      ) : (
        <p className="text-muted-foreground">Location information not available</p>
      )}
    </Card>
  );
}
