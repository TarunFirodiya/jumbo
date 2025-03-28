
import { 
  School, Hospital, Utensils, Building2, 
  ShoppingCart, Train, LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Define structure for nearby places
interface Place {
  name: string;
}

interface NearbyPlacesData {
  schools?: Place[] | Place;
  hospitals?: Place[] | Place;
  restaurants?: Place[] | Place;
  tech_parks?: Place[] | Place;
  malls?: Place[] | Place;
  metro?: Place[] | Place;
  [key: string]: any; // Allow for other place types
}

const placeIconMap: Record<string, LucideIcon> = {
  "school": School,
  "hospital": Hospital,
  "restaurant": Utensils,
  "tech_park": Building2,
  "mall": ShoppingCart,
  "metro": Train,
};

const categoryDisplayNames: Record<string, string> = {
  "schools": "Schools",
  "hospitals": "Hospitals",
  "restaurants": "Restaurants",
  "tech_parks": "Tech Parks",
  "malls": "Malls",
  "metro": "Metro Stations",
};

interface NearbyPlacesProps {
  nearbyPlaces: NearbyPlacesData | null;
}

export function NearbyPlaces({ nearbyPlaces }: NearbyPlacesProps) {
  const [showAll, setShowAll] = useState(false);
  
  if (!nearbyPlaces) {
    return <div className="text-muted-foreground">No nearby places information available</div>;
  }

  // Safely extract all places from the data structure
  const extractPlaces = () => {
    try {
      // Create a flat array of all places with their category
      return Object.entries(nearbyPlaces).flatMap(([category, places]) => {
        // Skip if places is null/undefined
        if (!places) return [];
        
        // Handle different potential formats
        if (Array.isArray(places)) {
          // If it's already an array, map each place
          return places.map(place => ({
            name: place.name || 'Unknown',
            category,
            displayCategory: categoryDisplayNames[category] || category
          }));
        } 
        else if (typeof places === 'object' && places !== null) {
          // If it's a single object (not array), convert to array item
          return [{
            name: places.name || 'Unknown',
            category,
            displayCategory: categoryDisplayNames[category] || category
          }];
        }
        
        // Return empty array for any other type
        return [];
      });
    } catch (error) {
      console.error("Error extracting nearby places:", error);
      return [];
    }
  };

  const allPlaces = extractPlaces();

  if (allPlaces.length === 0) {
    return <div className="text-muted-foreground">No nearby places information available</div>;
  }

  const ITEMS_PER_ROW = 4; // For desktop view
  const INITIAL_ROWS = 2;
  const initialItems = ITEMS_PER_ROW * INITIAL_ROWS;
  const displayedPlaces = showAll ? allPlaces : allPlaces.slice(0, initialItems);

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
        {displayedPlaces.map((place, index) => {
          const categoryKey = place.category.endsWith('s') 
            ? place.category.slice(0, -1) 
            : place.category;
          const Icon = placeIconMap[categoryKey] || Building2;
          
          return (
            <motion.div
              key={`${place.name}-${index}`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="text-sm">{place.name}</span>
            </motion.div>
          );
        })}
      </motion.div>

      {allPlaces.length > initialItems && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="text-sm"
          >
            {showAll ? 'Show Less' : `Show All ${allPlaces.length} Places`}
          </Button>
        </div>
      )}
    </div>
  );
}
