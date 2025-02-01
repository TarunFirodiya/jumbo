import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BedDouble, DollarSign, Square, ArrowUp } from "lucide-react";
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
    <Card className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span>₹{listing.price?.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-muted-foreground" />
            <span>{listing.bedrooms} Bedrooms</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Square className="h-4 w-4 text-muted-foreground" />
            <span>{listing.built_up_area} sq.ft</span>
          </div>
          {listing.facing && (
            <div className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-muted-foreground" />
              <span>{listing.facing} Facing</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          Floor {listing.floor} • {listing.bathrooms} Bathrooms
        </div>
        {listing.maintenance && (
          <div className="text-sm text-muted-foreground">
            Maintenance: ₹{listing.maintenance}/month
          </div>
        )}
      </div>

      <Button onClick={handleRequestVisit} className="w-full">
        Request a Visit
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Card>
  );
}