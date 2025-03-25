
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Building, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { generateBuildingSlug } from "@/utils/slugUtils";

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
        .select('id, name, images, min_price, max_price, locality, bhk_types, google_rating')
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
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center">
          <Building className="mr-2 h-5 w-5 text-primary" />
          Similar Properties
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-[200px] w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
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
      <h2 className="text-2xl font-semibold flex items-center">
        <Building className="mr-2 h-5 w-5 text-primary" />
        Similar Properties
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {similarProperties.map((property) => {
          // Generate SEO-friendly URL slug
          const slug = generateBuildingSlug(
            property.name,
            property.locality,
            property.bhk_types,
            property.id
          );
          
          return (
            <Link to={`/property/${slug}`} key={property.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col group">
                <div className="relative aspect-[4/3]">
                  {property.images?.[0] ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Building className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {property.google_rating && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center">
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-xs font-medium">{property.google_rating}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">{property.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{property.locality}</p>
                  
                  <div className="flex items-center gap-2 mt-auto">
                    <span className="text-sm font-medium">
                      {property.bhk_types?.join(', ')} BHK
                    </span>
                    {property.min_price && (
                      <Badge variant="outline" className="bg-primary/5">
                        ₹{(property.min_price/10000000).toFixed(1)} Cr
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">View Details</span>
                    <Button size="sm" variant="ghost" className="h-8 px-2">
                      Compare
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
