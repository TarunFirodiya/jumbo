
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeIndianRupee, Bath, ArrowRight, Square, Compass, Layers } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";

type ListingCardProps = {
  listing: Tables<"listings">;
};

export default function ListingCard({ listing }: ListingCardProps) {
  const { toast } = useToast();

  const handleRequestVisit = () => {
    toast({
      title: "Visit Requested",
      description: "We'll contact you shortly to schedule a visit.",
    });
  };

  return (
    <Card className="overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <BadgeIndianRupee className="h-5 w-5 text-muted-foreground" />
          <span>{listing.price?.toLocaleString()}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4 text-muted-foreground" />
            <span>{listing.built_up_area} sq.ft</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4 text-muted-foreground" />
            <span>{listing.bathrooms} Bath</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span>Floor {listing.floor}</span>
          </div>

          {listing.facing && (
            <div className="flex items-center gap-1">
              <Compass className="h-4 w-4 text-muted-foreground" />
              <span>{listing.facing}</span>
            </div>
          )}
        </div>

        {listing.maintenance && (
          <div className="text-sm text-muted-foreground">
            Maintenance: ₹{listing.maintenance}/month
          </div>
        )}

        <Button onClick={handleRequestVisit} className="w-full">
          Request a Visit
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
}
