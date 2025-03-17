
import { Card } from "@/components/ui/card";
import LocationMap from '@/components/LocationMap';
import { MapPin, Clock, Train, Bus, School, ShoppingBag, Heart, Stethoscope } from "lucide-react";

interface LocationTabProps {
  latitude?: number | null;
  longitude?: number | null;
  buildingName: string;
}

export function LocationTab({ latitude, longitude, buildingName }: LocationTabProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Check exact commute from your office / other landmarks by searching for them below
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
        <h3 className="font-medium text-lg">Commute</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Walk Score</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold">85</span>
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Excellent</span>
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Transit Score</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold">72</span>
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Good</span>
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Bike Score</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold">60</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">Moderate</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
