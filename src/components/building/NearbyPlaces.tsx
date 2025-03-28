
import { 
  School, Hospital, Utensils, Building2, 
  LucideIcon
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
  [key: string]: any; // Allow for other place types
}

const placeIconMap: Record<string, LucideIcon> = {
  "school": School,
  "hospital": Hospital,
  "restaurant": Utensils,
  "tech_park": Building2,
};

const categoryDisplayNames: Record<string, string> = {
  "schools": "Schools",
  "hospitals": "Hospitals",
  "restaurants": "Restaurants",
  "tech_parks": "Tech Parks",
};

interface NearbyPlacesProps {
  nearbyPlaces: NearbyPlacesData | null;
}

export function NearbyPlaces({ nearbyPlaces }: NearbyPlacesProps) {
  const [showAll, setShowAll] = useState(false);
  
  if (!nearbyPlaces) {
    return <p className="text-muted-foreground">No nearby places information available</p>;
  }

  // Normalize the data structure to ensure we always have an array of places
  const normalizePlaces = (category: string, places: any): Array<{name: string, category: string, displayCategory: string}> => {
    if (!places) return [];
    
    // Handle single object case (non-array)
    if (!Array.isArray(places)) {
      // If it's a single object with name property
      if (places.name) {
        return [{
          ...places,
          category,
          displayCategory: categoryDisplayNames[category] || category
        }];
      }
      return [];
    }
    
    // Handle array case
    return places.map(place => ({
      ...place,
      category,
      displayCategory: categoryDisplayNames[category] || category
    }));
  };

  // Create a flat array of all places with their category
  const allPlaces = Object.entries(nearbyPlaces).flatMap(([category, places]) => 
    normalizePlaces(category, places)
  );

  const ITEMS_PER_ROW = 4; // For desktop view
  const INITIAL_ROWS = 2;
  const initialItems = ITEMS_PER_ROW * INITIAL_ROWS;
  const displayedPlaces = showAll ? allPlaces : allPlaces.slice(0, initialItems);

  if (allPlaces.length === 0) {
    return <p className="text-muted-foreground">No nearby places information available</p>;
  }

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
