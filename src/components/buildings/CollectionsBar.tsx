
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Collection {
  id: string;
  name: string;
  iconUrl: string;
  description?: string;
}

const collections: Collection[] = [
  {
    id: "affordable",
    name: "Affordable",
    iconUrl: "/lovable-uploads/546490ac-c727-4cd4-87a8-b467d49f6438.png",
    description: "Budget-friendly homes"
  },
  {
    id: "gated-apartment",
    name: "Gated",
    iconUrl: "/lovable-uploads/4f137503-5396-4dc6-b8c3-9825a77225ab.png",
    description: "Secure gated communities"
  },
  {
    id: "new-construction",
    name: "New",
    iconUrl: "/lovable-uploads/98d92f31-19ac-4916-838d-51550da202e5.png",
    description: "Newly constructed"
  },
  {
    id: "child-friendly",
    name: "Kids Friendly",
    iconUrl: "/lovable-uploads/b519014d-fdf4-4afd-a56d-1d8d050749a8.png",
    description: "Great for families"
  },
  {
    id: "top 5 builder",
    name: "Top Builder",
    iconUrl: "/lovable-uploads/4ef453e4-4ad6-4e6a-a976-da5d90d5381a.png",
    description: "Premium builders"
  },
  {
    id: "spacious",
    name: "Spacious",
    iconUrl: "/lovable-uploads/5108ee7d-075e-48fa-8f15-cc6bcb951f57.png",
    description: "Large living spaces"
  },
  {
    id: "high-rise",
    name: "High Rise",
    iconUrl: "/lovable-uploads/3a57f04c-05ce-4905-bc15-5e538e77a618.png",
    description: "High rise buildings"
  },
  {
    id: "villa",
    name: "Villa",
    iconUrl: "/lovable-uploads/ed56d2f2-3075-4c81-8869-690f26958f23.png",
    description: "Luxury villas"
  },
  {
    id: "metro",
    name: "Metro",
    iconUrl: "/lovable-uploads/d1672d7d-12f3-4119-9b83-952524bc9ddb.png",
    description: "Near metro stations"
  }
];

interface CollectionsBarProps {
  selectedCollections: string[];
  onCollectionToggle: (collectionId: string) => void;
}

export function CollectionsBar({ selectedCollections, onCollectionToggle }: CollectionsBarProps) {
  console.log('Selected collections:', selectedCollections);

  return (
    <div className="border-b">
      <ScrollArea className="w-full pb-4">
        <div className="flex space-x-8 px-4">
          {collections.map((collection) => (
            <Button
              key={collection.id}
              variant="ghost"
              className={cn(
                "flex flex-col items-center justify-center h-auto py-2 space-y-2 rounded-none",
                "transition-all duration-200 min-w-[72px] hover:bg-transparent relative",
                selectedCollections.includes(collection.id) && "after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
              )}
              onClick={() => onCollectionToggle(collection.id)}
            >
              <div className={cn(
                "transition-colors w-6 h-6",
                selectedCollections.includes(collection.id) 
                  ? "opacity-100" 
                  : "opacity-60"
              )}>
                <img 
                  src={collection.iconUrl} 
                  alt={collection.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className={cn(
                "text-xs font-medium",
                selectedCollections.includes(collection.id)
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}>
                {collection.name}
              </span>
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
