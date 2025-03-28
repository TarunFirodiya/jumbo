
import { useQuery } from "@tanstack/react-query";
import { MapIcon, List, MapPin, CalendarDays, Building2, Home, Star, Heart, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { ListingCardCarousel } from "@/components/building/ListingCardCarousel";
import { CollectionsBar } from "@/components/buildings/CollectionsBar";
import { AuthModal } from "@/components/auth/AuthModal";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { Action } from "@/components/ui/action-search-bar";
import { BUDGET_RANGES } from "@/components/ui/filters";
import { AnimatedHero } from "@/components/ui/animated-hero";
import { BuildingCard } from "@/components/buildings/BuildingCard";

interface Filter {
  type: string;
  value: string[];
}

const BuildingsMap = lazy(() => import("@/components/BuildingsMap"));

export default function Buildings() {
  const {
    toast
  } = useToast();
  const [isMapView, setIsMapView] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<"shortlist" | "visit" | "notify">("shortlist");
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);

  const {
    data: user
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      return user;
    }
  });
  const {
    data: buildingScores,
    refetch: refetchBuildingScores
  } = useQuery({
    queryKey: ['buildingScores', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const {
        data,
        error
      } = await supabase.from('user_building_scores').select('*').eq('user_id', user.id);
      if (error) {
        console.error('Error fetching building scores:', error);
        throw error;
      }
      return data.reduce((acc, score) => {
        acc[score.building_id] = {
          shortlisted: score.shortlisted
        };
        return acc;
      }, {} as Record<string, any>);
    },
    enabled: !!user
  });
  const {
    data: buildings,
    isLoading: buildingsLoading
  } = useQuery({
    queryKey: ['buildings', selectedCollections],
    queryFn: async () => {
      let query = supabase.from('buildings').select('*');
      if (selectedCollections.length > 0) {
        query = query.contains('collections', selectedCollections);
      }
      const {
        data,
        error
      } = await query;
      if (error) {
        console.error('Error fetching buildings:', error);
        throw error;
      }
      return data;
    }
  });
  const localityActions = useMemo(() => {
    if (!buildings) return [];
    const localitySet = new Set<string>();
    buildings.forEach(building => {
      if (building.locality) localitySet.add(building.locality);
    });
    return Array.from(localitySet).map((locality, index) => ({
      id: `locality-${index}`,
      label: locality,
      icon: <MapPin className="h-4 w-4 text-blue-500" />,
      description: "Locality",
      value: locality
    }));
  }, [buildings]);
  const filteredBuildings = useMemo(() => {
    let filtered = buildings || [];

    if (searchTerm) {
      filtered = filtered.filter(building => 
        building.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (building.locality && building.locality.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCollections.length > 0) {
      filtered = filtered.filter(building => 
        selectedCollections.every(collection => 
          building.collections?.includes(collection)
        )
      );
    }

    activeFilters.forEach(filter => {
      switch (filter.type) {
        case "Locality":
          filtered = filtered.filter(building => 
            filter.value.includes(building.locality)
          );
          break;
        case "BHK":
          filtered = filtered.filter(building => 
            filter.value.some(bhk => 
              building.bhk_types?.includes(parseInt(bhk))
            )
          );
          break;
        case "Budget":
          filtered = filtered.filter(building => {
            const price = building.min_price;
            return filter.value.some(range => {
              const { min, max } = BUDGET_RANGES[range];
              return price >= min && price < max;
            });
          });
          break;
      }
    });

    return filtered;
  }, [buildings, searchTerm, selectedCollections, activeFilters]);

  const displayedBuildings = useMemo(() => {
    return filteredBuildings.slice(0, visibleCount);
  }, [filteredBuildings, visibleCount]);

  const handleShortlistToggle = useCallback(async (buildingId: string) => {
    if (!user) {
      setAuthAction("shortlist");
      setShowAuthModal(true);
      return;
    }
    try {
      const currentShortlistStatus = buildingScores?.[buildingId]?.shortlisted || false;
      const {
        error
      } = await supabase.from('user_building_scores').upsert({
        user_id: user.id,
        building_id: buildingId,
        shortlisted: !currentShortlistStatus
      }, {
        onConflict: 'user_id,building_id'
      });
      if (error) throw error;
      
      await refetchBuildingScores();
      
      toast({
        title: currentShortlistStatus ? "Removed from shortlist" : "Added to shortlist",
        description: currentShortlistStatus ? "Building has been removed from your shortlist" : "Building has been added to your shortlist"
      });
    } catch (error) {
      console.error('Error toggling shortlist:', error);
      toast({
        title: "Error",
        description: "Could not update shortlist",
        variant: "destructive"
      });
    }
  }, [user, buildingScores, toast, supabase, refetchBuildingScores]);
  const handleCollectionToggle = useCallback((collectionId: string) => {
    setSelectedCollections(prev => prev.includes(collectionId) ? prev.filter(id => id !== collectionId) : [...prev, collectionId]);
  }, []);
  const navigateToBuilding = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);
  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query);
  }, []);
  const handleLocalitySelect = useCallback((action: Action) => {
    setSearchTerm(action.value || action.label);
    if (action.value) {
      navigate(`/buildings/locality/${encodeURIComponent(action.value)}`);
    }
  }, [navigate]);
  const getSEODescription = () => {
    let description = "Browse apartments, villas, and houses in popular locations. ";
    if (selectedCollections.length) {
      description += `Explore properties in ${selectedCollections.join(', ')}. `;
    }
    description += "Find your perfect home with detailed listings, amenities, and pricing information.";
    return description;
  };
  const localities = useMemo(() => {
    if (!buildings) return [];
    const localitySet = new Set<string>();
    buildings.forEach(building => {
      if (building.locality) localitySet.add(building.locality);
    });
    return Array.from(localitySet);
  }, [buildings]);
  const handleLocalityClick = useCallback((locality: string) => {
    navigate(`/buildings/locality/${encodeURIComponent(locality)}`);
  }, [navigate]);

  const handleShowMore = useCallback(() => {
    setVisibleCount(prev => prev + 20);
  }, []);

  if (buildingsLoading) {
    return <>
        <SEO title="Loading Properties | Jumbo" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
      </>;
  }
  return <div className="min-h-screen pb-20">
      <SEO title={selectedCollections.length ? `Properties in ${selectedCollections.join(', ')} | Jumbo` : 'Ready-to-Move Homes | Lowest Price Guarantee'} description={getSEODescription()} canonical="/buildings" structuredData={{
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "Jumbo",
      "description": getSEODescription(),
      "url": "https://www.jumbohomes.com/buildings",
      "areaServed": selectedCollections.length ? selectedCollections : ["All Areas"],
      "numberOfItems": filteredBuildings.length
    }} />
      
      <AnimatedHero 
        subtitle="Search, visit & buy ready-to-move homes at fixed prices"
        localityActions={localityActions}
        onSearch={handleSearch}
        onLocalitySelect={handleLocalitySelect}
      />
      
      <div className="container mx-auto px-4 mt-8">
        <CollectionsBar 
          selectedCollections={selectedCollections} 
          onCollectionToggle={handleCollectionToggle}
          onFiltersChange={setActiveFilters}
          buildings={buildings || []}
        />

        <div className="sticky top-0 z-10 bg-background py-4 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              {filteredBuildings.length} {filteredBuildings.length === 1 ? 'home' : 'homes'} found
            </p>
          </div>
        </div>

        {!filteredBuildings?.length ? <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No properties found matching your criteria.
              </p>
            </CardContent>
          </Card> : isMapView ? <Suspense fallback={<div className="h-[60vh] flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-4 border-t-primary animate-spin"></div>
          </div>}>
            <BuildingsMap 
              buildings={displayedBuildings} 
              onShortlist={handleShortlistToggle}
              buildingScores={buildingScores}
            />
          </Suspense> : <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {displayedBuildings.map(building => {
                const isShortlisted = buildingScores?.[building.id]?.shortlisted || false;
                return (
                  <BuildingCard
                    key={building.id}
                    building={building}
                    onNavigate={navigateToBuilding}
                    onShortlist={handleShortlistToggle}
                    isShortlisted={isShortlisted}
                  />
                );
              })}
            </div>

            {visibleCount < filteredBuildings.length && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handleShowMore}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  Show More
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>}
      </div>

      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <Button variant="default" onClick={() => setIsMapView(!isMapView)} className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
          {isMapView ? <>
              <List className="h-4 w-4" />
              Show list
            </> : <>
              <MapIcon className="h-4 w-4" />
              Show map
            </>}
        </Button>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} actionType={authAction} />
    </div>;
}
