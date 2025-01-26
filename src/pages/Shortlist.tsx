import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Shortlist() {
  const { data: shortlistedBuildings, isLoading } = useQuery({
    queryKey: ['shortlistedBuildings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('user_building_scores')
        .select(`
          building_id,
          buildings (
            id,
            name,
            type,
            locality,
            sub_locality,
            min_price,
            max_price,
            images,
            total_floors,
            age
          )
        `)
        .eq('user_id', user.id)
        .eq('shortlisted', true)
        .order('calculated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4">
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[300px] w-full" />
            ))
          ) : !shortlistedBuildings?.length ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  You haven't shortlisted any properties yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            shortlistedBuildings?.map((item) => (
              <Card key={item.building_id} className="overflow-hidden">
                <div className="aspect-video relative">
                  {item.buildings?.images?.[0] ? (
                    <img
                      src={item.buildings.images[0]}
                      alt={item.buildings.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <img 
                        src="/placeholder.svg" 
                        alt="Placeholder" 
                        className="w-16 h-16 opacity-50"
                      />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{item.buildings?.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {item.buildings?.locality}
                    {item.buildings?.sub_locality && `, ${item.buildings.sub_locality}`}
                  </div>
                  <div className="text-sm font-medium">
                    {item.buildings?.min_price && `₹${(item.buildings.min_price/10000000).toFixed(1)} Cr`}
                    {item.buildings?.max_price && ` - ₹${(item.buildings.max_price/10000000).toFixed(1)} Cr`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.buildings?.total_floors && `${item.buildings.total_floors} floors`}
                    {item.buildings?.age && ` • ${item.buildings.age} years old`}
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}