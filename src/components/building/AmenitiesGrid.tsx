
import { 
  Car, Wifi, Pool, Dumbbell, Basketball, Tennis, Play, 
  Elevator, Park, Home, Shield, Droplets, ShoppingBag,
  Waves, Sun, MonitorPlay, TreePine, Users, Footprints,
  BadgeCheck, IconProps
} from "lucide-react";

// Map amenities to icons
const amenityIconMap: Record<string, React.ComponentType<IconProps>> = {
  "Visitor Parking": Car,
  "Swimming pool": Pool,
  "Gym": Dumbbell,
  "Basketball Court": Basketball,
  "Tennis Court": Tennis,
  "Kids Play Area": Play,
  "Lift": Elevator,
  "Open/Green space": Park,
  "Club house": Home,
  "Security": Shield,
  "Water treatment plant": Droplets,
  "Shops": ShoppingBag,
  "Pool Table": Waves,
  "Solar Water Heater": Sun,
  "Auditorium": MonitorPlay,
  "Cricket/Hockey Ground": TreePine,
  "Maintenance staff": Users,
  "Jogging Track": Footprints,
};

const DEFAULT_ICON = BadgeCheck;

interface AmenitiesGridProps {
  features: string[];
}

export function AmenitiesGrid({ features }: AmenitiesGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {features.map((feature) => {
        const Icon = amenityIconMap[feature] || DEFAULT_ICON;
        return (
          <div 
            key={feature} 
            className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
          >
            <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="text-sm">{feature}</span>
          </div>
        );
      })}
    </div>
  );
}
