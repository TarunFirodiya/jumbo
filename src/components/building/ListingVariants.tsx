
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BadgeIndianRupee, Building2, Compass } from "lucide-react";
import { VisitRequestModal } from "@/components/VisitRequestModal";

interface ListingVariantsProps {
  listings: Tables<'listings'>[] | null;
  buildingId: string;
  buildingName: string;
  isMobile?: boolean;
}

export function ListingVariants({ listings, buildingId, buildingName, isMobile }: ListingVariantsProps) {
  const [selectedListing, setSelectedListing] = useState<Tables<'listings'> | null>(
    listings?.[0] || null
  );
  const [showVisitModal, setShowVisitModal] = useState(false);

  if (!listings?.length) return null;

  const ActionButtons = () => (
    <div className="grid grid-cols-2 gap-3">
      <Button 
        className="w-full" 
        onClick={() => setShowVisitModal(true)}
      >
        Request a Visit
      </Button>
      <Button 
        variant="outline" 
        className="w-full"
      >
        Book Now
      </Button>
    </div>
  );

  return (
    <>
      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {listings.map((listing) => (
              <Button
                key={listing.id}
                variant={selectedListing?.id === listing.id ? "default" : "outline"}
                onClick={() => setSelectedListing(listing)}
              >
                {listing.bedrooms}BHK - Floor {listing.floor}
              </Button>
            ))}
          </div>

          {selectedListing && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-2xl font-semibold">
                <BadgeIndianRupee className="h-6 w-6" />
                <span>{selectedListing.price?.toLocaleString()}</span>
                <span className="text-base font-normal text-muted-foreground">
                  (₹{Math.round(selectedListing.price / selectedListing.built_up_area).toLocaleString()} per sq.ft)
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedListing.built_up_area} sq.ft</span>
                </div>
                
                {selectedListing.facing && (
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedListing.facing}</span>
                  </div>
                )}
              </div>

              {!isMobile && <ActionButtons />}
            </div>
          )}
        </div>
      </Card>

      {isMobile && selectedListing && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <ActionButtons />
        </div>
      )}

      <VisitRequestModal
        open={showVisitModal}
        onOpenChange={setShowVisitModal}
        buildingId={buildingId}
        buildingName={buildingName}
        listingId={selectedListing?.id || ""}
      />
    </>
  );
}
