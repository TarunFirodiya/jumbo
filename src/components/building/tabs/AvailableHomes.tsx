
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
      <div className="space-y-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </Card>
  );
}
