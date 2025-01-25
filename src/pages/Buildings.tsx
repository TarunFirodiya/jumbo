import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { Home, Heart, Settings, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const tabs = [
  { title: "Home", icon: Home, path: "/buildings" },
  { title: "Shortlist", icon: Heart, path: "/shortlist" },
  { title: "Settings", icon: Settings, path: "/settings" },
  { title: "Support", icon: HelpCircle, externalLink: "https://wa.link/i4szqw" },
];

export default function Buildings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: buildings, isLoading: buildingsLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: shortlistedBuildings } = useQuery({
    queryKey: ['shortlistedBuildings'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_building_shortlist')
        .select('building_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map(item => item.building_id);
    },
    enabled: !!user,
  });

  const toggleShortlistMutation = useMutation({
    mutationFn: async ({ buildingId, isShortlisted }: { buildingId: string, isShortlisted: boolean }) => {
      if (!user) throw new Error("User not authenticated");

      if (isShortlisted) {
        const { error } = await supabase
          .from('user_building_shortlist')
          .delete()
          .eq('building_id', buildingId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_building_shortlist')
          .insert({ building_id: buildingId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: (_, { isShortlisted }) => {
      queryClient.invalidateQueries({ queryKey: ['shortlistedBuildings'] });
      toast({
        title: isShortlisted ? "Removed from shortlist" : "Added to shortlist",
        description: isShortlisted ? "Property removed from your shortlist" : "Property added to your shortlist",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleShortlistToggle = (buildingId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to shortlist properties",
        variant: "destructive",
      });
      return;
    }

    const isShortlisted = shortlistedBuildings?.includes(buildingId);
    toggleShortlistMutation.mutate({ buildingId, isShortlisted: !!isShortlisted });
  };

  return (
    <div className="container mx-auto px-4">
      <div className="sticky top-0 z-10 bg-background py-4">
        <ExpandableTabs tabs={tabs} />
      </div>
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildingsLoading ? (
            [1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[300px] w-full" />
            ))
          ) : !buildings?.length ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No properties available at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            buildings?.map((building) => (
              <Card key={building.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  {building.images?.[0] ? (
                    <img
                      src={building.images[0]}
                      alt={building.name}
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
                  <button
                    onClick={() => handleShortlistToggle(building.id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                  >
                    <Heart
                      className={shortlistedBuildings?.includes(building.id) ? "fill-red-500 stroke-red-500" : ""}
                    />
                  </button>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{building.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {building.locality}
                    {building.sub_locality && `, ${building.sub_locality}`}
                  </div>
                  <div className="text-sm font-medium">
                    {building.min_price && `₹${(building.min_price/10000000).toFixed(1)} Cr`}
                    {building.max_price && ` - ₹${(building.max_price/10000000).toFixed(1)} Cr`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {building.total_floors && `${building.total_floors} floors`}
                    {building.age && ` • ${building.age} years old`}
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