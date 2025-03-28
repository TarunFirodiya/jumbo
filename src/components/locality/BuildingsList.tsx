
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { BuildingCard } from "@/components/buildings/BuildingCard";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredBuildings.map((building) => {
        const isShortlisted = buildingScores?.[building.id]?.shortlisted || false;
        
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
