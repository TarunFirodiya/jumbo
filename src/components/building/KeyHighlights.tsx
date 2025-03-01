
import { BadgeIndianRupee, Building, MapPin, Calendar, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KeyHighlightsProps {
  bhkTypes: (string | number)[] | null;
  locality: string;
  possession?: string;
  minPrice?: number;
  age?: number | string;
  verified?: boolean;
}

export function KeyHighlights({ bhkTypes, locality, possession, minPrice, age, verified = true }: KeyHighlightsProps) {
  return (
    <div className="flex flex-wrap gap-3 my-4">
      {bhkTypes && bhkTypes.length > 0 && (
        <Badge variant="outline" className="flex items-center gap-1 py-1 px-3 text-xs">
          <Building className="h-3.5 w-3.5" />
          <span>{Array.isArray(bhkTypes) ? bhkTypes.join(', ') : bhkTypes} BHK</span>
        </Badge>
      )}
      
      {locality && (
        <Badge variant="outline" className="flex items-center gap-1 py-1 px-3 text-xs">
          <MapPin className="h-3.5 w-3.5" />
          <span>{locality}</span>
        </Badge>
      )}
      
      {possession && (
        <Badge variant="outline" className="flex items-center gap-1 py-1 px-3 text-xs">
          <Calendar className="h-3.5 w-3.5" />
          <span>{possession}</span>
        </Badge>
      )}
      
      {minPrice && (
        <Badge variant="outline" className="flex items-center gap-1 py-1 px-3 text-xs">
          <BadgeIndianRupee className="h-3.5 w-3.5" />
          <span>₹{(minPrice/10000000).toFixed(1)} Cr onwards</span>
        </Badge>
      )}
      
      {age && (
        <Badge variant="outline" className="flex items-center gap-1 py-1 px-3 text-xs">
          <Calendar className="h-3.5 w-3.5" />
          <span>{typeof age === 'number' ? `${age} years old` : age}</span>
        </Badge>
      )}
      
      {verified && (
        <Badge variant="outline" className="flex items-center gap-1 py-1 px-3 text-xs bg-green-50 text-green-700 border-green-200">
          <Check className="h-3.5 w-3.5" />
          <span>Verified</span>
        </Badge>
      )}
    </div>
  );
}
