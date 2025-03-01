
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface SimilarPropertiesProps {
  currentBuildingId: string;
  bhkTypes?: (string | number)[] | null;
  locality?: string;
  minPrice?: number;
  maxPrice?: number;
}

export function SimilarProperties({ 
  currentBuildingId, 
  bhkTypes, 
  locality, 
  minPrice, 
  maxPrice 
}: SimilarPropertiesProps) {
  // Define price range with +/- 20% buffer
  const lowerPrice = minPrice ? minPrice * 0.8 : undefined;
  const upperPrice = maxPrice ? maxPrice * 1.2 : undefined;
  
  const { data: similarProperties, isLoading } = useQuery({
    queryKey: ['similar-properties', currentBuildingId, locality, bhkTypes, lowerPrice, upperPrice],
    queryFn: async () => {
      let query = supabase
        .from('buildings')
        .select('id, name, images, min_price, max_price, locality, bhk_types')
        .neq('id', currentBuildingId)
        .limit(3);
      
      // Add filters when available
      if (locality) {
        query = query.eq('locality', locality);
      }
      
      // Add price range filter if available
      if (lowerPrice && upperPrice) {
        query = query.or(`min_price.gte.${lowerPrice},min_price.lte.${upperPrice}`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Similar Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-[200px] w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (!similarProperties?.length) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Similar Properties</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {similarProperties.map((property) => (
          <Link to={`/buildings/${property.id}`} key={property.id}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
              <div className="relative aspect-[4/3]">
                {property.images?.[0] ? (
                  <img 
                    src={property.images[0]} 
                    alt={property.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Building className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold line-clamp-1">{property.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{property.locality}</p>
                
                <div className="flex items-center gap-2 mt-auto">
                  <span className="text-sm font-medium">
                    {property.bhk_types?.join(', ')} BHK
                  </span>
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                    {property.min_price && `₹${(property.min_price/10000000).toFixed(1)} Cr`}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
