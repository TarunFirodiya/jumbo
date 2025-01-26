import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { Home, Heart, Settings, HelpCircle, MapIcon, List, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BuildingsMap from "@/components/BuildingsMap";
import { Progress } from "@/components/ui/progress";

const tabs = [
  { title: "Home", icon: Home, path: "/buildings" },
  { title: "Shortlist", icon: Heart, path: "/shortlist" },
  { title: "Settings", icon: Settings, path: "/settings" },
  { title: "Support", icon: HelpCircle, externalLink: "https://wa.link/i4szqw" },
];

type ToggleShortlistParams = {
  buildingId: string;
};

export default function Buildings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMapView, setIsMapView] = useState(false);
  const navigate = useNavigate();

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

  const { data: buildingScores } = useQuery({
    queryKey: ['buildingScores', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_building_scores')
        .select('building_id, shortlisted, overall_match_score')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.reduce((acc, score) => {
        acc[score.building_id] = {
          shortlisted: score.shortlisted,
          overall_match_score: score.overall_match_score
        };
        return acc;
      }, {} as Record<string, { shortlisted: boolean; overall_match_score: number | null }>);
    },
    enabled: !!user,
  });

  const toggleShortlistMutation = useMutation({
    mutationFn: async ({ buildingId }: ToggleShortlistParams) => {
      if (!user) throw new Error("User not authenticated");

      const currentScore = buildingScores?.[buildingId];
      const isCurrentlyShortlisted = currentScore?.shortlisted || false;

      if (currentScore) {
        const { error } = await supabase
          .from('user_building_scores')
          .update({ shortlisted: !isCurrentlyShortlisted })
          .eq('building_id', buildingId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return { buildingId, shortlisted: !isCurrentlyShortlisted };
      } else {
        const { error } = await supabase
          .from('user_building_scores')
          .insert({
            building_id: buildingId,
            user_id: user.id,
            shortlisted: true,
          });
        
        if (error) throw error;
        return { buildingId, shortlisted: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildingScores'] });
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

    toggleShortlistMutation.mutate({ buildingId });
  };

  return (
    <div className="container mx-auto px-4">
      <div className="sticky top-0 z-10 bg-background py-4">
        <div className="flex justify-between items-center mb-4">
          <ExpandableTabs tabs={tabs} />
          <Button
            variant="outline"
            onClick={() => setIsMapView(!isMapView)}
            className="ml-4"
          >
            {isMapView ? (
              <>
                <List className="mr-2 h-4 w-4" />
                List View
              </>
            ) : (
              <>
                <MapIcon className="mr-2 h-4 w-4" />
                Map View
              </>
            )}
          </Button>
        </div>
      </div>

      {buildingsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full" />
          ))}
        </div>
      ) : !buildings?.length ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No properties available at the moment.
            </p>
          </CardContent>
        </Card>
      ) : isMapView ? (
        <BuildingsMap buildings={buildings} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings?.map((building) => {
            const buildingScore = buildingScores?.[building.id];
            const matchScore = buildingScore?.overall_match_score || 0;
            const isShortlisted = buildingScore?.shortlisted || false;

            return (
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
                      className={isShortlisted ? "fill-red-500 stroke-red-500" : ""}
                    />
                  </button>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{building.name}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {building.locality}
                    {building.sub_locality && `, ${building.sub_locality}`}
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    {building.age && (
                      <div>
                        <div className="font-medium">{building.age} years</div>
                        <div className="text-muted-foreground text-xs">Age</div>
                      </div>
                    )}
                    {building.total_floors && (
                      <div>
                        <div className="font-medium">{building.total_floors}</div>
                        <div className="text-muted-foreground text-xs">Floors</div>
                      </div>
                    )}
                    {building.bhk_types && (
                      <div>
                        <div className="font-medium">{building.bhk_types.join(", ")}</div>
                        <div className="text-muted-foreground text-xs">Types</div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="text-lg font-semibold">
                      {building.min_price && `₹${(building.min_price/10000000).toFixed(1)} Cr`}
                      {building.max_price && ` - ₹${(building.max_price/10000000).toFixed(1)} Cr`}
                    </div>
                    {buildingScore && (
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Match Score</span>
                          <span>{Math.round(matchScore * 100)}%</span>
                        </div>
                        <Progress value={matchScore * 100} className="h-2" />
                      </div>
                    )}
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => navigate(`/buildings/${building.id}`)}
                  >
                    View Details
                  </Button>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}