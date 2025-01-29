import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MapIcon, List, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
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

  // Changed to use maybeSingle() instead of single()
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
        .select('*')
        .order('created_at', { ascending: false });

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

  // Effect to check if preferences exist and redirect if not
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

  // Effect to trigger score calculation when needed
  useEffect(() => {
    const calculateScores = async () => {
      if (user && userPreferences && buildings?.length > 0) {
        try {
          const response = await fetch('https://qmeyqhreseuvkrdowzfe.supabase.co/functions/v1/calculate-building-scores', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify({
              user_id: user.id,
              building_ids: buildings.map(b => b.id)
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error calculating scores:', errorData);
            return;
          }

          const result = await response.json();
          console.log('Score calculation result:', result);
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

  return (
    <div className="container mx-auto px-4">
      <div className="sticky top-0 z-10 bg-background py-4">
        <Button
          variant="outline"
          onClick={() => setIsMapView(!isMapView)}
          className="ml-auto block"
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
              <Card 
                key={building.id} 
                className="overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/buildings/${building.id}`)}
              >
                <div className="aspect-video relative bg-muted">
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
                      e.stopPropagation(); // Prevent card click when clicking heart
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
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{building.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {building.locality}
                        {building.sub_locality && `, ${building.sub_locality}`}
                      </div>
                    </div>
                    {buildingScore && (
                      <div className="relative w-14 h-14 flex-shrink-0">
                        <svg className="w-full h-full -rotate-90">
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            className="stroke-muted fill-none"
                            strokeWidth="6"
                          />
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            className="stroke-primary fill-none"
                            strokeWidth="6"
                            strokeDasharray={`${matchScore * 150.8} 150.8`}
                            style={{
                              transition: "stroke-dasharray 0.6s ease",
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                          {Math.round(matchScore * 100)}%
                        </div>
                      </div>
                    )}
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