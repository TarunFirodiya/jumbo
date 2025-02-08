
import { Card } from "@/components/ui/card";
import LocationMap from '@/components/LocationMap';

interface LocationTabProps {
  latitude?: number | null;
  longitude?: number | null;
  buildingName: string;
}

export function LocationTab({ latitude, longitude, buildingName }: LocationTabProps) {
  return (
    <div>
      {latitude && longitude ? (
        <LocationMap
          latitude={latitude}
          longitude={longitude}
          buildingName={buildingName}
        />
      ) : (
        <p className="text-muted-foreground">Location information not available</p>
      )}
    </div>
  );
}
