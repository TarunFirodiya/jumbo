
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Crown, 
  Home, 
  Baby, 
  Expand, 
  DollarSign,
  Shield,
  Construction,
  Compass
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Collection {
  id: string;
  name: string;
  icon: JSX.Element;
  description?: string;
}

const collections: Collection[] = [
  {
    id: "affordable",
    name: "Affordable",
    icon: <DollarSign className="h-6 w-6" />,
    description: "Budget-friendly homes"
  },
  {
    id: "gated-apartment",
    name: "Gated",
    icon: <Shield className="h-6 w-6" />,
    description: "Secure gated communities"
  },
  {
    id: "new-construction",
    name: "New",
    icon: <Construction className="h-6 w-6" />,
    description: "Newly constructed"
  },
  {
    id: "child-friendly",
    name: "Kids Friendly",
    icon: <Baby className="h-6 w-6" />,
    description: "Great for families"
  },
  {
    id: "luxury",
    name: "Luxury",
    icon: <Crown className="h-6 w-6" />,
    description: "Premium properties"
  },
  {
    id: "spacious",
    name: "Spacious",
    icon: <Expand className="h-6 w-6" />,
    description: "Large living spaces"
  },
  {
    id: "vastu",
    name: "Vastu",
    icon: <Compass className="h-6 w-6" />,
    description: "Vastu compliant"
  }
];

interface CollectionsBarProps {
  selectedCollections: string[];
  onCollectionToggle: (collectionId: string) => void;
}

export function CollectionsBar({ selectedCollections, onCollectionToggle }: CollectionsBarProps) {
  console.log('Selected collections:', selectedCollections); // Debug log

  return (
    <ScrollArea className="w-full">
      <div className="flex space-x-4 pb-4">
        {collections.map((collection) => (
          <Button
            key={collection.id}
            variant="ghost"
            className={cn(
              "flex flex-col items-center justify-center h-auto py-2 px-4 hover:bg-accent space-y-2",
              "transition-all duration-200 min-w-[80px]",
              selectedCollections.includes(collection.id) && 
              "bg-accent text-accent-foreground"
            )}
            onClick={() => onCollectionToggle(collection.id)}
          >
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              selectedCollections.includes(collection.id) 
                ? "text-primary" 
                : "text-muted-foreground"
            )}>
              {collection.icon}
            </div>
            <span className="text-xs font-medium">{collection.name}</span>
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
