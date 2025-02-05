
import { Card } from "@/components/ui/card";
import ListingCard from "@/components/ListingCard";
import { Tables } from "@/integrations/supabase/types";

interface AvailableHomesProps {
  listings: Tables<'listings'>[] | null;
}

export function AvailableHomes({ listings }: AvailableHomesProps) {
  if (!listings?.length) return null;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Available Homes</h3>
      <div className="space-y-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </Card>
  );
}
