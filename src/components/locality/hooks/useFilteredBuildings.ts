
import { useState, useMemo } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Filter } from "@/components/ui/filters";

export function useFilteredBuildings(
  buildings: Tables<"buildings">[] | undefined,
  selectedCollections: string[],
  activeFilters: Filter[],
  searchTerm: string
) {
  return useMemo(() => {
    if (!buildings) return [];
    
    let filtered = buildings.filter(building => 
      building.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (activeFilters.length > 0) {
      filtered = filtered.filter(building => {
        return activeFilters.every(filter => {
          switch (filter.type) {
            case 'Locality':
              return filter.value.includes(building.locality);
            case 'BHK':
              const bhkValues = filter.value.map(v => parseInt(v.split(' ')[0]));
              return building.bhk_types?.some(bhk => bhkValues.includes(bhk));
            case 'Budget':
              const { min_price } = building;
              return filter.value.some(range => {
                const ranges = {
                  "Under 50L": { min: 0, max: 5000000 },
                  "50L - 1Cr": { min: 5000000, max: 10000000 },
                  "1Cr - 1.5Cr": { min: 10000000, max: 15000000 },
                  "1.5Cr - 2Cr": { min: 15000000, max: 20000000 },
                  "2Cr - 3Cr": { min: 20000000, max: 30000000 },
                  "Above 3Cr": { min: 30000000, max: Infinity },
                };
                const { min, max } = ranges[range];
                return min_price >= min && min_price < max;
              });
            default:
              return true;
          }
        });
      });
    }
    
    return filtered;
  }, [buildings, searchTerm, activeFilters, selectedCollections]);
}
