import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MapIcon, List, MapPin, CalendarDays, Building2, Home, Star, Search, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BuildingsMap from "@/components/BuildingsMap";
import { Progress } from "@/components/ui/progress";
import { MatchScoreModal } from "@/components/building/MatchScoreModal";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

export default function Buildings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMapView, setIsMapView] = useState(false);
  const [selectedBuildingScore, setSelectedBuildingScore] = useState<any>(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedBHK, setSelectedBHK] = useState<string[]>([]);
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: calculatedScores } = useQuery({
    queryKey: ['calculateScores', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase.functions.invoke('calculate-building-scores', {
        body: { user_id: user.id }
      });
      
      if (error) {
        console.error('Error calculating scores:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
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

  const { data: buildingScores } = useQuery({
    queryKey: ['buildingScores', user?.id, calculatedScores],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_building_scores')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching building scores:', error);
        throw error;
      }
      console.log('Building scores:', data);
      return data.reduce((acc, score) => {
        acc[score.building_id] = {
          shortlisted: score.shortlisted,
          overall_match_score: score.overall_match_score,
          location_match_score: score.location_match_score,
          budget_match_score: score.budget_match_score,
          lifestyle_match_score: score.lifestyle_match_score,
        };
        return acc;
      }, {} as Record<string, any>);
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

  const filteredBuildings = useMemo(() => {
    if (!buildings || !buildingScores) return [];
    
    // First filter buildings based on match scores > 50%
    const matchScoreFiltered = buildings.filter(building => {
      const scores = buildingScores[building.id];
      if (!scores) return false;
      
      return (
        scores.location_match_score > 0.5 &&
        scores.budget_match_score > 0.5 &&
        scores.lifestyle_match_score > 0.5
      );
    });
    
    // Then apply user filters
    const filtered = matchScoreFiltered.filter(building => {
      const matchesSearch = building.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = building.min_price >= priceRange[0] * 10000000 && 
                          building.min_price <= priceRange[1] * 10000000;
      const matchesBHK = selectedBHK.length === 0 || 
                        building.bhk_types?.some(bhk => selectedBHK.includes(String(bhk)));
      const matchesLocality = selectedLocalities.length === 0 || 
                            selectedLocalities.includes(building.locality);

      return matchesSearch && matchesPrice && matchesBHK && matchesLocality;
    });

    // Sort by overall match score
    return filtered.sort((a, b) => {
      const scoreA = buildingScores[a.id]?.overall_match_score || 0;
      const scoreB = buildingScores[b.id]?.overall_match_score || 0;
      return scoreB - scoreA;
    });
  }, [buildings, searchTerm, priceRange, selectedBHK, selectedLocalities, buildingScores]);

  const localities = useMemo(() => {
    if (!buildings) return [];
    const uniqueLocalities = new Set(buildings.map(b => b.locality).filter(Boolean));
    return Array.from(uniqueLocalities);
  }, [buildings]);

  const bhkTypes = ["2bhk", "3bhk", "4bhk", "4bhk_plus"];

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

  const handleScoreClick = (buildingScore: any) => {
    setSelectedBuildingScore(buildingScore);
  };

  const handleShortlistToggle = async (buildingId: string) => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to shortlist buildings",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentShortlistStatus = buildingScores?.[buildingId]?.shortlisted || false;
      const { error } = await supabase
        .from('user_building_scores')
        .upsert({
          user_id: user.id,
          building_id: buildingId,
          shortlisted: !currentShortlistStatus,
        }, {
          onConflict: 'user_id,building_id',
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['buildingScores'] });
      
      toast({
        title: currentShortlistStatus ? "Removed from shortlist" : "Added to shortlist",
        description: currentShortlistStatus 
          ? "Building has been removed from your shortlist"
          : "Building has been added to your shortlist",
      });
    } catch (error) {
      console.error('Error toggling shortlist:', error);
      toast({
        title: "Error",
        description: "Could not update shortlist",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="sticky top-0 z-10 bg-background py-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search buildings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-4">
                  <Label>Price Range (Cr)</Label>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={priceRange}
                    onValueChange={setPriceRange}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>₹{priceRange[0]} Cr</span>
                    <span>₹{priceRange[1]} Cr</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>BHK Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {bhkTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={selectedBHK.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedBHK([...selectedBHK, type]);
                            } else {
                              setSelectedBHK(selectedBHK.filter(t => t !== type));
                            }
                          }}
                        />
                        <label
                          htmlFor={type}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {type.toUpperCase()}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Locality</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
                    {localities.map((locality) => (
                      <div key={locality} className="flex items-center space-x-2">
                        <Checkbox
                          id={locality}
                          checked={selectedLocalities.includes(locality)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLocalities([...selectedLocalities, locality]);
                            } else {
                              setSelectedLocalities(selectedLocalities.filter(l => l !== locality));
                            }
                          }}
                        />
                        <label
                          htmlFor={locality}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {locality}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button
            variant="outline"
            onClick={() => setIsMapView(!isMapView)}
            className="flex items-center gap-2"
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
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {filteredBuildings.length} {filteredBuildings.length === 1 ? 'home' : 'homes'} found
          </p>
        </div>
      </div>

      {buildingsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full" />
          ))}
        </div>
      ) : !filteredBuildings?.length ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No properties found matching your criteria.
            </p>
          </CardContent>
        </Card>
      ) : isMapView ? (
        <BuildingsMap buildings={filteredBuildings} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuildings?.map((building) => {
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
                    <div 
                      className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScoreClick(buildingScore);
                      }}
                    >
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
                  {building.images && building.images.length > 0 && building.images[0] !== "No photo available" ? (
                    <img
                      src={building.images[0]}
                      alt={building.name || "Building"}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const placeholders = [
                          'https://images.unsplash.com/photo-1487958449943-2429e8be8625',
                          'https://images.unsplash.com/photo-1524230572899-a752b3835840',
                          'https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a',
                          'https://images.unsplash.com/photo-1496307653780-42ee777d4833'
                        ];
                        target.src = placeholders[Math.floor(Math.random() * placeholders.length)];
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1487958449943-2429e8be8625"
                        alt="Building placeholder"
                        className="object-cover w-full h-full"
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

      <MatchScoreModal
        open={!!selectedBuildingScore}
        onOpenChange={(open) => !open && setSelectedBuildingScore(null)}
        scores={selectedBuildingScore || {
          overall_match_score: 0,
          location_match_score: 0,
          budget_match_score: 0,
          lifestyle_match_score: 0,
        }}
      />
    </div>
  );
}
