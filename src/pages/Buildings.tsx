
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
import { SEO } from "@/components/seo/SEO";

export default function Buildings() {
  const { toast } = useToast();
  const [isMapView, setIsMapView] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<"shortlist" | "visit" | "notify">("shortlist");
  const [activeCarouselIndex, setActiveCarouselIndex] = useState<Record<string, number>>({});

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: buildings } = useQuery({
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

  // Generate SEO description based on current filters
  const getSEODescription = () => {
    const locationText = selectedCollections.length ? 
      `in ${selectedCollections.join(', ')}` : 
      'across prime locations';
    const countText = filteredBuildings.length ? 
      `${filteredBuildings.length} properties` : 
      'Exclusive properties';
    return `${countText} available ${locationText}. Find your dream home with detailed information about prices, amenities, and location.`;
  };

  return (
    <div className="min-h-screen pb-20">
      <SEO
        title={selectedCollections.length ? 
          `Properties in ${selectedCollections.join(', ')} | Your Domain` : 
          'Find Your Dream Home | Your Domain'
        }
        description={getSEODescription()}
        canonical="/buildings"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          "name": "Your Domain",
          "description": getSEODescription(),
          "url": "https://yourdomain.com/buildings",
          "areaServed": selectedCollections.length ? selectedCollections : ["All Areas"],
          "numberOfItems": filteredBuildings.length
        }}
      />
      
      {/* List/Map View Toggle */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setIsMapView(!isMapView)}
              className="relative"
            >
              {isMapView ? (
                <>
                  <List className="h-4 w-4 mr-2" />
                  List View
                </>
              ) : (
                <>
                  <MapIcon className="h-4 w-4 mr-2" />
                  Map View
                </>
              )}
            </Button>
          </div>

          {/* Search and Collections */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by building name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <CollectionsBar
              selectedCollections={selectedCollections}
              onCollectionSelect={setSelectedCollections}
            />
          </div>

          {/* Buildings Grid/Map View */}
          {isMapView ? (
            <BuildingsMap buildings={filteredBuildings} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBuildings.map((building) => (
                <Card 
                  key={building.id}
                  className="cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => navigate(`/buildings/${building.id}`)}
                >
                  <CardHeader className="p-0">
                    <ImageCarousel 
                      images={building.images || []}
                      onImageClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{building.name}</CardTitle>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {building.locality}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          {building.total_floors} Floors
                        </div>
                        <div className="flex items-center">
                          <Home className="h-4 w-4 mr-1" />
                          {building.bhk_types?.join(', ')} BHK
                        </div>
                        {building.google_rating && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-400" />
                            {building.google_rating}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-lg font-semibold">
                          ₹{(building.min_price/10000000).toFixed(1)} Cr
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!user) {
                              setAuthAction("shortlist");
                              setShowAuthModal(true);
                              return;
                            }
                            // Handle shortlist action
                          }}
                        >
                          <Heart className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        action={authAction}
      />
    </div>
  );
}
