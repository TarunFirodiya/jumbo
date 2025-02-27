import { useQuery } from "@tanstack/react-query";
import { MapIcon, List, MapPin, CalendarDays, Building2, Home, Star, Search, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { ImageCarousel } from "@/components/building/ImageCarousel";
import { CollectionsBar } from "@/components/buildings/CollectionsBar";
import { AuthModal } from "@/components/auth/AuthModal";
import { SEO } from "@/components/SEO";

// Lazy load the map component since it's heavy
const BuildingsMap = lazy(() => import("@/components/BuildingsMap"));

// Building Card component to reduce re-renders
const BuildingCard = ({ building, onNavigate, onShortlist, isShortlisted }) => {
  return (
    <Card 
      key={building.id} 
      className="overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
      onClick={() => onNavigate(`/buildings/${building.id}`)}
    >
      <div className="aspect-video relative bg-muted">
        {building.images && building.images.length > 0 ? (
          <ImageCarousel 
            images={building.images} 
            onImageClick={(e) => {
              e.stopPropagation();
              onNavigate(`/buildings/${building.id}`);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img 
              src="/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png"
              alt="Building placeholder"
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShortlist(building.id);
          }}
          className="absolute top-2 right-2 p-2 z-10 hover:scale-110 transition-transform"
        >
          <Heart
            className={`h-6 w-6 ${isShortlisted ? "fill-red-500 stroke-red-500" : "stroke-white fill-black/20"}`}
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
                <span className="font-medium">{building.age} years</span>
              </div>
            )}
            {building.total_floors && (
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{building.total_floors} floors</span>
              </div>
            )}
            {building.bhk_types && (
              <div className="flex items-center gap-1">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{building.bhk_types.join(", ")} BHK</span>
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
};

export default function Buildings() {
  const { toast } = useToast();
  const [isMapView, setIsMapView] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<"shortlist" | "visit" | "notify">("shortlist");

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: buildingScores } = useQuery({
    queryKey: ['buildingScores', user?.id],
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
      return data.reduce((acc, score) => {
        acc[score.building_id] = {
          shortlisted: score.shortlisted
        };
        return acc;
      }, {} as Record<string, any>);
    },
    enabled: !!user,
  });

  const { data: buildings, isLoading: buildingsLoading } = useQuery({
    queryKey: ['buildings', selectedCollections],
    queryFn: async () => {
      let query = supabase
        .from('buildings')
        .select('*');
      
      if (selectedCollections.length > 0) {
        query = query.contains('collections', selectedCollections);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching buildings:', error);
        throw error;
      }
      
      return data;
    },
  });

  const filteredBuildings = useMemo(() => 
    buildings?.filter(building => 
      building.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [], 
    [buildings, searchTerm]
  );

  const handleShortlistToggle = useCallback(async (buildingId: string) => {
    if (!user) {
      setAuthAction("shortlist");
      setShowAuthModal(true);
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
  }, [user, buildingScores, toast, supabase]);

  const handleCollectionToggle = useCallback((collectionId: string) => {
    setSelectedCollections(prev => 
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  }, []);

  const navigateToBuilding = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const getSEODescription = () => {
    let description = "Browse apartments, villas, and houses in popular locations. ";
    if (selectedCollections.length) {
      description += `Explore properties in ${selectedCollections.join(', ')}. `;
    }
    description += "Find your perfect home with detailed listings, amenities, and pricing information.";
    return description;
  };

  if (buildingsLoading) {
    return (
      <>
        <SEO title="Loading Properties | Cozy Dwell Search" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <SEO
        title={selectedCollections.length ? 
          `Properties in ${selectedCollections.join(', ')} | Cozy Dwell Search` : 
          'Find Your Perfect Home | Cozy Dwell Search'
        }
        description={getSEODescription()}
        canonical="/buildings"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          "name": "Cozy Dwell Search",
          "description": getSEODescription(),
          "url": "https://www.cozydwellsearch.com/buildings",
          "areaServed": selectedCollections.length ? selectedCollections : ["All Areas"],
          "numberOfItems": filteredBuildings.length
        }}
      />
      
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
        </div>
        
        <CollectionsBar
          selectedCollections={selectedCollections}
          onCollectionToggle={handleCollectionToggle}
        />

        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {filteredBuildings.length} {filteredBuildings.length === 1 ? 'home' : 'homes'} found
          </p>
        </div>
      </div>

      {!filteredBuildings?.length ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No properties found matching your criteria.
            </p>
          </CardContent>
        </Card>
      ) : isMapView ? (
        <Suspense fallback={<div className="h-[60vh] flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>}>
          <BuildingsMap buildings={filteredBuildings} />
        </Suspense>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuildings.map((building) => {
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
      )}

      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <Button
          variant="default"
          onClick={() => setIsMapView(!isMapView)}
          className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
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

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        actionType={authAction}
      />
    </div>
  );
}
