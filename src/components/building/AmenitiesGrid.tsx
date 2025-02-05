
import { 
  Car, Wifi, Dumbbell, Building2, Gamepad2, 
  Building, Trees, Home, Shield, Droplet, 
  ShoppingBag, Ghost, Sun, Video, Trees as Garden,
  Users, Footprints, Check, LucideIcon
} from "lucide-react";

// Map amenities to icons using available Lucide icons
const amenityIconMap: Record<string, LucideIcon> = {
  "Visitor Parking": Car,
  "Swimming pool": Droplet,
  "Gym": Dumbbell,
  "Basketball Court": Gamepad2,
  "Tennis Court": Gamepad2,
  "Kids Play Area": Ghost,
  "Lift": Building2,
  "Open/Green space": Trees,
  "Club house": Home,
  "Security": Shield,
  "Water treatment plant": Droplet,
  "Shops": ShoppingBag,
  "Pool Table": Gamepad2,
  "Solar Water Heater": Sun,
  "Auditorium": Video,
  "Cricket/Hockey Ground": Garden,
  "Maintenance staff": Users,
  "Jogging Track": Footprints,
};

const DEFAULT_ICON = Check;

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
