
import { 
  Car, Wifi, Dumbbell, Building2, Gamepad2, 
  Building, Trees, Home, Shield, Droplet, 
  ShoppingBag, Bot, Sun, Video, Trees as Garden,
  Users, Footprints, Check, LucideIcon, Bath,
  Sofa, Bike, CookingPot, Coffee, Fridge,
  Gym, Key, Microwave, Plant, Pool,
  ShowerHead, Utensils, Baby, Park, Basketball,
  HeartPulse, School, Bus, Bird, Scale
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Enhanced amenity icon mapping with more specific icons
const amenityIconMap: Record<string, LucideIcon> = {
  "Visitor Parking": Car,
  "Swimming Pool": Pool,
  "Gym": Dumbbell,
  "Basketball Court": Basketball,
  "Tennis Court": Gamepad2,
  "Kids Play Area": Baby,
  "Lift": Building2,
  "Open/Green Space": Trees,
  "Club House": Home,
  "Security": Shield,
  "Water Treatment Plant": Droplet,
  "Shops": ShoppingBag,
  "Pool Table": Gamepad2,
  "Solar Water Heater": Sun,
  "Auditorium": Video,
  "Cricket/Hockey Ground": Garden,
  "Maintenance Staff": Users,
  "Jogging Track": Footprints,
  "Garden": Plant,
  "Park": Park,
  "Spa": Bath,
  "Cafe": Coffee,
  "Yoga Center": HeartPulse,
  "School": School,
  "Bus Stop": Bus,
  "Bird Sanctuary": Bird,
  "Fitness Center": Gym,
  "Weight Area": Scale,
  "Indoor Games": Gamepad2,
  "Multipurpose Hall": Home,
  "Power Backup": Key,
  "CCTV": Shield,
  "Kitchen Garden": CookingPot,
  "Dining Area": Utensils,
  "Community Hall": Users,
};

const DEFAULT_ICON = Check;
const ITEMS_PER_ROW = 4; // For desktop view
const INITIAL_ROWS = 3;

interface AmenitiesGridProps {
  features: string[];
}

export function AmenitiesGrid({ features }: AmenitiesGridProps) {
  const [showAll, setShowAll] = useState(false);
  const initialItems = ITEMS_PER_ROW * INITIAL_ROWS;
  const displayedFeatures = showAll ? features : features.slice(0, initialItems);

  return (
    <div className="space-y-4">
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
      >
        {displayedFeatures.map((feature) => {
          const Icon = amenityIconMap[feature] || DEFAULT_ICON;
          return (
            <motion.div
              key={feature}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="text-sm">{feature}</span>
            </motion.div>
          );
        })}
      </motion.div>

      {features.length > initialItems && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="text-sm"
          >
            {showAll ? 'Show Less' : `Show All ${features.length} Amenities`}
          </Button>
        </div>
      )}
    </div>
  );
}
