
import { Card } from "@/components/ui/card";
import LocationMap from '@/components/LocationMap';
import { MapPin, Clock, Train, Bus, School, ShoppingBag, Heart, Stethoscope } from "lucide-react";

interface LocationTabProps {
  latitude?: number | null;
  longitude?: number | null;
  buildingName: string;
}

export function LocationTab({ latitude, longitude, buildingName }: LocationTabProps) {
  // Simulated data for nearby places
  const nearbyPlaces = [
    { type: 'train', name: 'Metro Station', distance: '1.2 km', time: '15 min' },
    { type: 'bus', name: 'Bus Station', distance: '0.8 km', time: '10 min' },
    { type: 'school', name: 'International School', distance: '2.1 km', time: '18 min' },
    { type: 'shopping', name: 'Shopping Mall', distance: '1.5 km', time: '13 min' },
    { type: 'park', name: 'Central Park', distance: '0.6 km', time: '8 min' },
    { type: 'hospital', name: 'Multi-Specialty Hospital', distance: '2.8 km', time: '22 min' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'train': return <Train className="h-4 w-4" />;
      case 'bus': return <Bus className="h-4 w-4" />;
      case 'school': return <School className="h-4 w-4" />;
      case 'shopping': return <ShoppingBag className="h-4 w-4" />;
      case 'park': return <Heart className="h-4 w-4" />;
      case 'hospital': return <Stethoscope className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {latitude && longitude ? (
        <div className="rounded-lg overflow-hidden border h-[350px]">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nearbyPlaces.map((place, index) => (
            <Card key={index} className="p-4 flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
                {getIcon(place.type)}
              </div>
              <div>
                <p className="font-medium">{place.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{place.distance}</span>
                  <span className="text-xs">•</span>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{place.time} walk</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

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
