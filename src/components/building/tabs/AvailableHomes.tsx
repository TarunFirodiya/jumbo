
import { Card } from "@/components/ui/card";
import ListingCard from "@/components/ListingCard";
import { Tables } from "@/integrations/supabase/types";

interface AvailableHomesProps {
  listings: Tables<'listings'>[] | null;
}

export function AvailableHomes({ listings }: AvailableHomesProps) {
  if (!listings?.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
