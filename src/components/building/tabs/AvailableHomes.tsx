
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/ListingCard";
import { Tables } from "@/integrations/supabase/types";
import { Bell } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ListingWithMedia } from "@/types/mediaTypes";

interface AvailableHomesProps {
  listings: Tables<'listings'>[] | null;
}

export function AvailableHomes({ listings }: AvailableHomesProps) {
  const { toast } = useToast();

  const handleNotifyMe = () => {
    toast({
      title: "Notification Set",
      description: "We'll notify you when a home becomes available in this building.",
    });
  };

  // Filter out sold or churned listings
  const availableListings = listings?.filter(listing => 
    listing.status !== 'sold' && listing.status !== 'churned'
  ) || [];

  if (!availableListings.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Button onClick={handleNotifyMe} variant="outline" className="gap-2">
          <Bell className="h-4 w-4" />
          Notify Me
        </Button>
        <p className="text-sm text-muted-foreground">
          When a home is available in this building
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {availableListings.map((listing) => (
        <ListingCard key={listing.id} listing={listing as unknown as ListingWithMedia} />
      ))}
    </div>
  );
}
