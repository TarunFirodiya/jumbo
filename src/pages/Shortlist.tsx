import { useQuery } from "@tanstack/react-query";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { Home, Heart, Settings, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const tabs = [
  { title: "Home", icon: Home, path: "/buildings" },
  { title: "Shortlist", icon: Heart, path: "/shortlist" },
  { title: "Settings", icon: Settings, path: "/settings" },
  { title: "Support", icon: HelpCircle, externalLink: "https://wa.link/i4szqw" },
];

export default function Shortlist() {
  const { data: shortlistedBuildings, isLoading } = useQuery({
    queryKey: ['shortlistedBuildings'],
    queryFn: async () => {
      const { data: shortlist, error } = await supabase
        .from('user_building_shortlist')
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
            images
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return shortlist;
    },
  });

  return (
    <div className="container mx-auto px-4">
      <div className="sticky top-0 z-10 bg-background py-4">
        <ExpandableTabs tabs={tabs} />
      </div>
      <div className="mt-8">
        <h1 className="text-2xl font-bold mb-6">Your Shortlisted Properties</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[300px] w-full" />
            ))}
          </div>
        ) : shortlistedBuildings?.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                You haven't shortlisted any properties yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shortlistedBuildings?.map((item) => (
              <Card key={item.building_id} className="overflow-hidden">
                <div className="aspect-video relative">
                  {item.buildings.images?.[0] ? (
                    <img
                      src={item.buildings.images[0]}
                      alt={item.buildings.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      No image available
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{item.buildings.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {item.buildings.locality}, {item.buildings.sub_locality}
                  </div>
                  <div className="text-sm font-medium">
                    ₹{item.buildings.min_price?.toLocaleString()} - ₹{item.buildings.max_price?.toLocaleString()}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}