import { Building, Clock, BadgeIndianRupee, Droplets, Building2, Ruler, Compass, Home } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
interface PropertyDetailsSectionProps {
  totalFloors?: number;
  age?: string | null;
  pricePsqft?: number;
  minPrice?: number;
  maxPrice?: number;
  water?: string[] | null;
  bank?: string[] | null;
  bhkTypes?: (string | number)[] | null;
  minArea?: number;
  maxArea?: number;
}
export function PropertyDetailsSection({
  totalFloors,
  age,
  pricePsqft,
  minPrice,
  maxPrice,
  water,
  bank,
  bhkTypes,
  minArea,
  maxArea
}: PropertyDetailsSectionProps) {
  // Calculate median price for the price distribution
  const medianPrice = minPrice && maxPrice ? (minPrice + maxPrice) / 2 : minPrice;
  const priceRange = minPrice && maxPrice ? maxPrice - minPrice : 0;
  const pricePosition = medianPrice && priceRange ? (medianPrice - minPrice) / priceRange * 100 : 50;
  return <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Property Details</h2>
      
      {/* Key details card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {totalFloors && <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Building className="h-4 w-4" />
                Total Floors
              </p>
              <p className="font-medium">{totalFloors}</p>
            </div>}
          {age !== null && <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Age
              </p>
              <p className="font-medium">{age}</p>
            </div>}
          {pricePsqft && <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <BadgeIndianRupee className="h-4 w-4" />
                Price per sq ft
              </p>
              <p className="font-medium">₹{pricePsqft.toLocaleString()}</p>
            </div>}
          {minPrice && <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <BadgeIndianRupee className="h-4 w-4" />
                Price
              </p>
              <p className="font-medium">
                ₹{(minPrice / 10000000).toFixed(1)} Cr
                {maxPrice && ` - ₹${(maxPrice / 10000000).toFixed(1)} Cr`}
              </p>
            </div>}
          {minArea && <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Area
              </p>
              <p className="font-medium">
                {minArea} sq.ft
                {maxArea && maxArea !== minArea && ` - ${maxArea} sq.ft`}
              </p>
            </div>}
          {bhkTypes && bhkTypes.length > 0 && <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Home className="h-4 w-4" />
                Configuration
              </p>
              <p className="font-medium">
                {Array.isArray(bhkTypes) ? bhkTypes.join(', ') : bhkTypes} BHK
              </p>
            </div>}
          {water?.length ? <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Water
              </p>
              <p className="font-medium">{water.join(", ")}</p>
            </div> : null}
          {bank?.length ? <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Bank
              </p>
              <p className="font-medium">{bank.join(", ")}</p>
            </div> : null}
        </div>
      </Card>
      
      {/* Price distribution */}
      {minPrice && maxPrice}
    </div>;
}