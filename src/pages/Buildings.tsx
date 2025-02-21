
import { useQuery } from "@tanstack/react-query";
import { MapIcon, List, MapPin, CalendarDays, Building2, Home, Star, Search, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BuildingsMap from "@/components/BuildingsMap";
import { Input } from "@/components/ui/input";
import { ImageCarousel } from "@/components/building/ImageCarousel";
import { CollectionsBar } from "@/components/buildings/CollectionsBar";
import { AuthModal } from "@/components/auth/AuthModal";

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
      let query = supabase.from('buildings').select('*');
      
      if (selectedCollections.length > 0) {
        query = query.contains('collections', selectedCollections);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  const filteredBuildings = buildings?.filter(building => 
    building.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleShortlistToggle = async (buildingId: string) => {
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
  };

  const handleCollectionToggle = (collectionId: string) => {
    setSelectedCollections(prev => 
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
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

      {buildingsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-muted animate-pulse" />
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </CardContent>
            </Card>
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
            const isShortlisted = buildingScores?.[building.id]?.shortlisted || false;

            return (
              <Card 
                key={building.id} 
                className="overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/buildings/${building.id}`)}
              >
                <div className="aspect-video relative bg-muted">
                  {building.images && building.images.length > 0 ? (
                    <ImageCarousel images={building.images} />
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
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors z-10"
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
          })}
        </div>
      )}

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        actionType={authAction}
      />
    </div>
  );
}
