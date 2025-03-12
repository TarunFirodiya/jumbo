import { useState, useEffect } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IndianRupee, Building2, Compass, Car, Armchair, CalendarClock, Ruler, Image } from "lucide-react";
import { VisitRequestModal } from "@/components/VisitRequestModal";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [selectedListing, setSelectedListing] = useState<Tables<'listings'> | null>(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  useEffect(() => {
    if (listings?.length && selectedListingId) {
      const listing = listings.find(l => l.id === selectedListingId);
      if (listing) {
        setSelectedListing(listing);
      }
    } else if (listings?.length) {
      setSelectedListing(listings[0]);
      onListingSelect?.(listings[0].id);
    }
  }, [listings, selectedListingId, onListingSelect]);
  if (!listings?.length) return null;
  const calculateEMI = (price: number) => {
    const loanAmount = price * 0.8;
    const interestRate = 0.085;
    const tenure = 20 * 12;
    const monthlyRate = interestRate / 12;
    const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  };
  const handleListingSelect = (listing: Tables<'listings'>) => {
    setSelectedListing(listing);
    onListingSelect?.(listing.id);
  };
  const formatAvailabilityDate = (date: string | Date | null) => {
    if (!date) return "Immediate";
    try {
      return format(new Date(date), "dd MMM yyyy");
    } catch (e) {
      return "Immediate";
    }
  };
  const getFurnishingStatusText = (status: string | null) => {
    if (!status) return "";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  const ActionButtons = () => <div className="grid grid-cols-2 gap-3">
      <div>
        <Button onClick={() => setShowVisitModal(true)} className="w-full bg-black text-white hover:bg-slate-800">
          Request a Visit
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-1">It's Free. Zero Spam</p>
      </div>
      <div>
        <Button variant="outline" className="w-full">
          Book Now
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-1">100% refundable</p>
      </div>
    </div>;
  return <>
      <Card className="p-6 space-y-6 shadow-lg md:max-w-sm md:sticky md:top-28">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {listings.map(listing => <Button key={listing.id} variant={selectedListing?.id === listing.id ? "default" : "outline"} onClick={() => handleListingSelect(listing)} className="text-sm">
                {listing.bedrooms}BHK - Floor {listing.floor}
              </Button>)}
          </div>

          {selectedListing && <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-6 w-6 text-muted-foreground" />
                  <span className="text-2xl font-semibold">{(selectedListing.price / 10000000).toFixed(1)} Cr</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  EMI starts at ₹{(calculateEMI(selectedListing.price) / 1000).toFixed(1)}k/month*
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedListing.built_up_area} sq.ft</span>
                </div>
                
                {selectedListing.carpet_area && <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedListing.carpet_area} sq.ft carpet</span>
                  </div>}
                
                {selectedListing.facing && <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedListing.facing}</span>
                  </div>}
                
                {selectedListing.balconies !== null && selectedListing.balconies !== undefined && <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedListing.balconies} {selectedListing.balconies === 1 ? 'Balcony' : 'Balconies'}</span>
                  </div>}
                
                {selectedListing.parking_spots !== null && selectedListing.parking_spots !== undefined && <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedListing.parking_spots} {selectedListing.parking_spots === 1 ? 'Parking Spot' : 'Parking Spots'}</span>
                  </div>}
                
                {selectedListing.furnishing_status && <div className="flex items-center gap-2">
                    <Armchair className="h-4 w-4 text-muted-foreground" />
                    <span>{getFurnishingStatusText(selectedListing.furnishing_status)}</span>
                  </div>}
                
                {selectedListing.availability && <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatAvailabilityDate(selectedListing.availability)}</span>
                  </div>}
                
                {selectedListing.status && <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${selectedListing.status === 'available' ? 'bg-green-100 text-green-800' : selectedListing.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedListing.status.charAt(0).toUpperCase() + selectedListing.status.slice(1)}
                    </span>
                  </div>}
              </div>
              
              {selectedListing.floor_plan_image}

              {!isMobile && <ActionButtons />}
            </div>}
        </div>
      </Card>

      {isMobile && selectedListing && <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg z-40">
          <ActionButtons />
        </div>}

      <VisitRequestModal open={showVisitModal} onOpenChange={setShowVisitModal} buildingId={buildingId} buildingName={buildingName} listingId={selectedListing?.id || ""} />
      
      {selectedListing && selectedListing.floor_plan_image && <Dialog open={showFloorPlan} onOpenChange={setShowFloorPlan}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedListing.bedrooms} BHK Floor Plan</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img src={selectedListing.floor_plan_image} alt="Floor Plan" className="max-h-[70vh] object-contain" />
            </div>
          </DialogContent>
        </Dialog>}
    </>;
}