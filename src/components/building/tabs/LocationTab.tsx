
import { Card } from "@/components/ui/card";
import LocationMap from '@/components/LocationMap';
import { NearbyPlaces } from '../NearbyPlaces';

interface LocationTabProps {
  latitude?: number | null;
  longitude?: number | null;
  buildingName: string;
  nearbyPlaces?: any | null;
}

export function LocationTab({ latitude, longitude, buildingName, nearbyPlaces }: LocationTabProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Check exact location of the property and nearby amenities
      </p>
      
      {latitude && longitude ? (
        <div className="rounded-lg overflow-hidden border h-[500px] relative">
          <LocationMap
            latitude={latitude}
            longitude={longitude}
            buildingName={buildingName}
          />
        </div>
      ) : (
        <p className="text-muted-foreground">Location information not available</p>
      )}

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Nearby Places</h3>
        <NearbyPlaces nearbyPlaces={nearbyPlaces} />
      </div>
    </div>
  );
}
