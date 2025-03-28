
import { Building, Clock, BadgeIndianRupee, Droplets } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BasicDetailsProps {
  totalFloors?: number;
  age?: string | null;
  pricePsqft?: number;
  minPrice?: number;
  water?: string[] | null;
}

export function BasicDetails({
  totalFloors,
  age,
  pricePsqft,
  minPrice,
  water,
}: BasicDetailsProps) {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {totalFloors && (
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Building className="h-4 w-4" />
              Total Floors
            </div>
            <div className="font-medium">{totalFloors}</div>
          </div>
        )}
        {age !== null && age !== undefined && (
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Age
            </div>
            <div className="font-medium">{age}</div>
          </div>
        )}
        {pricePsqft && (
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <BadgeIndianRupee className="h-4 w-4" />
              Price per sq ft
              <span className="text-xs">(Jumbo Fair Price Estimate)</span>
            </div>
            <div className="font-medium">₹{pricePsqft.toLocaleString()}</div>
          </div>
        )}
        {minPrice && (
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <BadgeIndianRupee className="h-4 w-4" />
              Price
            </div>
            <div className="font-medium">
              ₹{(minPrice/10000000).toFixed(1)} Cr
            </div>
          </div>
        )}
        {water?.length ? (
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Water
            </div>
            <div className="font-medium">{water.join(", ")}</div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
