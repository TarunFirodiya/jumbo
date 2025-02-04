import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BasicDetailsProps {
  type?: string;
  totalFloors?: number;
  age?: string | null;
  pricePsqft?: number;
  minPrice?: number;
  maxPrice?: number;
  onFindHome: () => void;
}

export function BasicDetails({
  type,
  totalFloors,
  age,
  pricePsqft,
  minPrice,
  maxPrice,
  onFindHome,
}: BasicDetailsProps) {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {type && (
          <div>
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium">{type}</p>
          </div>
        )}
        {totalFloors && (
          <div>
            <p className="text-sm text-muted-foreground">Total Floors</p>
            <p className="font-medium">{totalFloors}</p>
          </div>
        )}
        {age !== null && (
          <div>
            <p className="text-sm text-muted-foreground">Age</p>
            <p className="font-medium">{age} years</p>
          </div>
        )}
        {pricePsqft && (
          <div>
            <p className="text-sm text-muted-foreground">Price per sq ft</p>
            <p className="font-medium">₹{pricePsqft.toLocaleString()}</p>
          </div>
        )}
        {minPrice && (
          <div>
            <p className="text-sm text-muted-foreground">Price Range</p>
            <p className="font-medium">
              ₹{(minPrice/10000000).toFixed(1)} Cr
              {maxPrice && ` - ₹${(maxPrice/10000000).toFixed(1)} Cr`}
            </p>
          </div>
        )}
      </div>
      <Button 
        className="mt-6 w-full sm:w-auto"
        onClick={onFindHome}
      >
        Find a Home
      </Button>
    </Card>
  );
}