import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MapIcon, List, MapPin, CalendarDays, Building2, Home, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BuildingsMap from "@/components/BuildingsMap";
import { Progress } from "@/components/ui/progress";

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

  const { data: userPreferences } = useQuery({
    queryKey: ['userPreferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }
      console.log('User preferences:', data);
      return data;
    },
    enabled: !!user,
  });

  const { data: buildings, isLoading: buildingsLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('*');

      if (error) throw error;
      console.log('Buildings data:', data);
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

      if (error) {
        console.error('Error fetching building scores:', error);
        throw error;
      }
      console.log('Building scores:', data);
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

  useEffect(() => {
    if (user && userPreferences === null) {
      toast({
        title: "Set Your Preferences",
        description: "Please set your preferences to see personalized matches",
        variant: "default",
      });
      navigate('/preferences');
    }
  }, [user, userPreferences, navigate, toast]);

  useEffect(() => {
    const calculateScores = async () => {
      if (user && userPreferences && buildings?.length > 0) {
        try {
          const { data, error } = await supabase.functions.invoke('calculate-building-scores', {
            body: {
              user_id: user.id,
              building_ids: buildings.map(b => b.id)
            }
          });

          if (error) {
            console.error('Error calculating scores:', error);
            return;
          }

          console.log('Score calculation result:', data);
          queryClient.invalidateQueries({ queryKey: ['buildingScores'] });
        } catch (error) {
          console.error('Error calculating building scores:', error);
        }
      }
    };

    calculateScores();
  }, [user, userPreferences, buildings, queryClient]);

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

  const sortedBuildings = useMemo(() => {
    if (!buildings || !buildingScores) return buildings;

    return [...buildings].sort((a, b) => {
      const scoreA = buildingScores[a.id]?.overall_match_score || 0;
      const scoreB = buildingScores[b.id]?.overall_match_score || 0;
      return scoreB - scoreA; // Sort in descending order
    });
  }, [buildings, buildingScores]);

  return (
    <div className="container mx-auto px-4">
      <div className="sticky top-0 z-10 bg-background py-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">1000+ Ready To Move Homes in Bangalore</p>
          <Button
            variant="outline"
            onClick={() => setIsMapView(!isMapView)}
            className="ml-auto flex items-center gap-2 rounded-full px-4 py-2 h-auto bg-[#F3F4F6] hover:bg-[#E5E7EB] text-black border-none"
          >
            {isMapView ? (
              <>
                <List className="h-4 w-4" />
                Show list
              </>
            ) : (
              <>
                <MapIcon className="h-4 w-4" />
                Show map
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
        <BuildingsMap buildings={sortedBuildings} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBuildings?.map((building) => {
            const buildingScore = buildingScores?.[building.id];
            const matchScore = buildingScore?.overall_match_score || 0;
            const isShortlisted = buildingScore?.shortlisted || false;

            return (
              <Card 
                key={building.id} 
                className="overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/buildings/${building.id}`)}
              >
                <div className="aspect-video relative bg-muted">
                  {buildingScore && (
                    <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
                      <div className="relative w-8 h-8">
                        <svg className="w-full h-full -rotate-90">
                          <circle
                            cx="16"
                            cy="16"
                            r="14"
                            className="stroke-muted/25 fill-none"
                            strokeWidth="4"
                          />
                          <circle
                            cx="16"
                            cy="16"
                            r="14"
                            className="stroke-primary fill-none"
                            strokeWidth="4"
                            strokeDasharray={`${matchScore * 87.96} 87.96`}
                            style={{
                              transition: "stroke-dasharray 0.6s ease",
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium">
                          {Math.round(matchScore * 100)}%
                        </div>
                      </div>
                    </div>
                  )}
                  {building.images && building.images.length > 0 ? (
                    <img
                      src={building.images[0]}
                      alt={building.name}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                        target.className = "w-16 h-16 opacity-50 m-auto";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img 
                        src="/placeholder.svg" 
                        alt="Placeholder" 
                        className="w-16 h-16 opacity-50"
                      />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShortlistToggle(building.id);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                  >
                    <Heart
                      className={isShortlisted ? "fill-red-500 stroke-red-500" : ""}
                    />
                  </button>
                </div>
                <CardHeader>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{building.name}</CardTitle>
                      {building.google_rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                          <span className="font-medium">{building.google_rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{building.locality}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {building.age && (
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{building.age}</span>
                        </div>
                      )}
                      {building.total_floors && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{building.total_floors}</span>
                        </div>
                      )}
                      {building.bhk_types && (
                        <div className="flex items-center gap-1">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{building.bhk_types.join(", ")}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-xs text-muted-foreground mr-1">Starting at</span>
                      <span className="text-lg font-semibold">
                        ₹{(building.min_price/10000000).toFixed(1)} Cr
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
