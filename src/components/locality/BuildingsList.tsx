
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { BuildingCard } from "@/components/buildings/BuildingCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BuildingsListProps {
  filteredBuildings: Tables<"buildings">[];
  buildingScores: Record<string, any> | null;
  handleShortlistToggle: (buildingId: string) => void;
  navigateToBuilding: (path: string) => void;
}

export function BuildingsList({
  filteredBuildings,
  buildingScores,
  handleShortlistToggle,
  navigateToBuilding
}: BuildingsListProps) {
  // Fetch all available listings for the filtered buildings
  const { data: availableListings } = useQuery({
    queryKey: ['available-listings', filteredBuildings.map(b => b.id)],
    queryFn: async () => {
      if (!filteredBuildings.length) return [];
      
      const buildingIds = filteredBuildings.map(building => building.id);
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .in('building_id', buildingIds)
        .eq('status', 'available');
      
      if (error) {
        console.error('Error fetching listings:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: filteredBuildings.length > 0
  });

  // Group listings by building for easier rendering
  const listingsByBuilding = (availableListings || []).reduce((acc, listing) => {
    if (!listing.building_id) return acc;
    
    if (!acc[listing.building_id]) {
      acc[listing.building_id] = [];
    }
    
    acc[listing.building_id].push(listing);
    return acc;
  }, {} as Record<string, Tables<"listings">[]>);

  if (!filteredBuildings?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No properties found matching your criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredBuildings.map((building) => {
        const isShortlisted = buildingScores?.[building.id]?.shortlisted || false;
        const buildingListings = listingsByBuilding[building.id] || [];
        
        // If there are listings for this building, render one card per listing
        if (buildingListings.length > 0) {
          return buildingListings.map(listing => (
            <BuildingCard
              key={`${building.id}-${listing.id}`}
              building={building}
              listing={listing}
              onNavigate={navigateToBuilding}
              onShortlist={handleShortlistToggle}
              isShortlisted={isShortlisted}
            />
          ));
        }
        
        // If no listings, render the building card without listing details
        return (
          <BuildingCard
            key={building.id}
            building={building}
            onNavigate={navigateToBuilding}
            onShortlist={handleShortlistToggle}
            isShortlisted={isShortlisted}
          />
        );
      })}
    </div>
  );
}
