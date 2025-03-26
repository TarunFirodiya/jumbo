
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CollectionsBar } from "@/components/buildings/CollectionsBar";
import { Tables } from "@/integrations/supabase/types";
import { Filter } from "@/components/ui/filters";

interface SearchHeaderProps {
  localityDisplayName: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCollections: string[];
  handleCollectionToggle: (collectionId: string) => void;
  handleFiltersChange: (filters: Filter[]) => void;
  buildings: Tables<"buildings">[];
  filteredBuildingsCount: number;
}

export function SearchHeader({
  localityDisplayName,
  searchTerm,
  setSearchTerm,
  selectedCollections,
  handleCollectionToggle,
  handleFiltersChange,
  buildings,
  filteredBuildingsCount
}: SearchHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background py-4 space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Properties in {localityDisplayName}</h1>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search buildings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <CollectionsBar
        selectedCollections={selectedCollections}
        onCollectionToggle={handleCollectionToggle}
        onFiltersChange={handleFiltersChange}
        buildings={buildings}
      />

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          {filteredBuildingsCount} {filteredBuildingsCount === 1 ? 'home' : 'homes'} found
        </p>
      </div>
    </div>
  );
}
