
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Building2, Crown, Home, Baby, Expand, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface Collection {
  id: string;
  name: string;
  icon: JSX.Element;
}

const collections: Collection[] = [
  {
    id: "gated-apartment",
    name: "Gated Apartment",
    icon: <Building2 className="h-4 w-4" />
  },
  {
    id: "luxury-apartments",
    name: "Luxury Apartments",
    icon: <Crown className="h-4 w-4" />
  },
  {
    id: "gated-villa",
    name: "Gated Villa",
    icon: <Home className="h-4 w-4" />
  },
  {
    id: "child-friendly",
    name: "Child-Friendly",
    icon: <Baby className="h-4 w-4" />
  },
  {
    id: "spacious-layout",
    name: "Spacious Layout",
    icon: <Expand className="h-4 w-4" />
  },
  {
    id: "affordable-homes",
    name: "Affordable Homes",
    icon: <DollarSign className="h-4 w-4" />
  }
];

interface CollectionsBarProps {
  selectedCollections: string[];
  onCollectionToggle: (collectionId: string) => void;
}

export function CollectionsBar({ selectedCollections, onCollectionToggle }: CollectionsBarProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex space-x-2 pb-4">
        {collections.map((collection) => (
          <Button
            key={collection.id}
            variant="outline"
            className={cn(
              "flex items-center gap-2",
              selectedCollections.includes(collection.id) && "bg-primary text-primary-foreground"
            )}
            onClick={() => onCollectionToggle(collection.id)}
          >
            {collection.icon}
            <span>{collection.name}</span>
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
