import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { ListingWithMedia } from "@/types/mediaTypes";

interface ListingVariantsProps {
  listings: ListingWithMedia[] | null;
  buildingId: string;
  buildingName: string;
  isMobile?: boolean;
  onListingSelect?: (id: string) => void;
  selectedListingId?: string | null;
}

export function ListingVariants({ 
  listings, 
  buildingId, 
  buildingName, 
  isMobile = false,
  onListingSelect,
  selectedListingId
}: ListingVariantsProps) {
  const { toast } = useToast();

  const handleListingSelect = (id: string) => {
    if (onListingSelect) {
      onListingSelect(id);
    }
  };

  // Filter out sold and churned listings
  const availableListings = listings?.filter(
    (listing) => listing.status !== "sold" && listing.status !== "churned"
  ) || [];

  return (
    <Card className={isMobile ? "border-0 shadow-none" : ""}>
      <CardContent className="p-0">
        <div className="flex flex-col">
          {availableListings.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No available homes in this building
            </div>
          ) : (
            availableListings.map((listing) => (
              <div
                key={listing.id}
                className="group cursor-pointer transition-colors hover:bg-secondary"
              >
                <Button
                  variant="ghost"
                  className="flex w-full justify-between py-4 px-6 text-left text-base hover:bg-secondary hover:no-underline"
                  onClick={() => handleListingSelect(listing.id)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        ₹{formatPrice(listing.price || 0)}
                      </span>
                      <Badge variant="secondary">
                        {listing.bedrooms} BHK Apartment
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {listing.built_up_area} sq.ft.
                    </p>
                  </div>
                  {selectedListingId === listing.id && (
                    <span className="text-primary group-hover:text-primary-foreground">
                      Selected
                    </span>
                  )}
                </Button>
                {!isMobile && <Separator />}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
