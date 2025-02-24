
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IndianRupee, Building2, Compass } from "lucide-react";
import { VisitRequestModal } from "@/components/VisitRequestModal";
import { RainbowButton } from "@/components/ui/rainbow-button";

interface ListingVariantsProps {
  listings: Tables<'listings'>[] | null;
  buildingId: string;
  buildingName: string;
  isMobile?: boolean;
  onListingSelect?: (listingId: string) => void;
  selectedListingId?: string | null;
}

export function ListingVariants({ 
  listings, 
  buildingId, 
  buildingName, 
  isMobile,
  onListingSelect,
  selectedListingId
}: ListingVariantsProps) {
  const [selectedListing, setSelectedListing] = useState<Tables<'listings'> | null>(
    listings?.find(l => l.id === selectedListingId) || listings?.[0] || null
  );
  const [showVisitModal, setShowVisitModal] = useState(false);

  if (!listings?.length) return null;

  const calculateEMI = (price: number) => {
    const loanAmount = price * 0.8;
    const interestRate = 0.085;
    const tenure = 20 * 12;
    const monthlyRate = interestRate / 12;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  };

  const handleListingSelect = (listing: Tables<'listings'>) => {
    setSelectedListing(listing);
    onListingSelect?.(listing.id);
  };

  const ActionButtons = () => (
    <div className="flex flex-col gap-3">
      <div>
        <RainbowButton 
          className="w-full" 
          onClick={() => setShowVisitModal(true)}
        >
          Request a Visit
        </RainbowButton>
        <p className="text-xs text-center text-muted-foreground mt-1">It's Free. Zero Spam</p>
      </div>
      <div>
        <Button 
          variant="outline" 
          className="w-full"
        >
          Book Now
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-1">100% refundable</p>
      </div>
    </div>
  );

  return (
    <>
      <Card className="p-6 space-y-6 shadow-lg md:max-w-sm md:sticky md:top-28">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {listings.map((listing) => (
              <Button
                key={listing.id}
                variant={selectedListing?.id === listing.id ? "default" : "outline"}
                onClick={() => handleListingSelect(listing)}
                className="text-sm"
              >
                {listing.bedrooms}BHK - Floor {listing.floor}
              </Button>
            ))}
          </div>

          {selectedListing && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-6 w-6 text-muted-foreground" />
                  <span className="text-2xl font-semibold">{(selectedListing.price/10000000).toFixed(1)} Cr</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  EMI starts at ₹{(calculateEMI(selectedListing.price)/1000).toFixed(1)}k/month*
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm">
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
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg">
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
