
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ListingCard from "@/components/ListingCard";
import LocationMap from '@/components/LocationMap';
import { useState } from "react";
import { ImageCarousel } from "@/components/building/ImageCarousel";
import { BuildingHeader } from "@/components/building/BuildingHeader";
import { BasicDetails } from "@/components/building/BasicDetails";
import { MatchScoreModal } from "@/components/building/MatchScoreModal";
import { AmenitiesGrid } from "@/components/building/AmenitiesGrid";

export default function BuildingDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: building, isLoading } = useQuery({
    queryKey: ['building', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: listings } = useQuery({
    queryKey: ['listings', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('building_id', id);

      if (error) throw error;
      return data;
    },
  });

  const { data: buildingScore } = useQuery({
    queryKey: ['buildingScore', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_building_scores')
        .select('*')
        .eq('building_id', id)
        .eq('user_id', user.id)
        .single();

      if (error) return null;
      return data;
    },
  });

  const { data: isShortlisted, refetch: refetchShortlist } = useQuery({
    queryKey: ['shortlist', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_building_scores')
        .select('shortlisted')
        .eq('building_id', id)
        .eq('user_id', user.id)
        .single();

      if (error) return false;
      return data?.shortlisted || false;
    },
  });

  const toggleShortlist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to shortlist buildings",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_building_scores')
        .upsert({
          user_id: user.id,
          building_id: id,
          shortlisted: !isShortlisted,
        }, {
          onConflict: 'user_id,building_id',
        });

      if (error) throw error;

      await refetchShortlist();
      toast({
        title: isShortlisted ? "Removed from shortlist" : "Added to shortlist",
        description: `${building?.name} has been ${isShortlisted ? 'removed from' : 'added to'} your shortlist`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update shortlist",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!building) {
    return <div className="container mx-auto px-4 py-8">Building not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ImageCarousel images={building.images || []} />

      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <BuildingHeader
            name={building.name}
            locality={building.locality || ''}
            subLocality={building.sub_locality}
            googleRating={building.google_rating}
            isShortlisted={isShortlisted || false}
            onToggleShortlist={toggleShortlist}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <BasicDetails
          type={building.type}
          totalFloors={building.total_floors}
          age={building.age}
          pricePsqft={building.price_psqft}
          minPrice={building.min_price}
          maxPrice={building.max_price}
          onFindHome={() => navigate(`/buildings/${id}/listings`)}
        />

        <Tabs defaultValue="overview" className="w-full">
          {isMobile ? (
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex w-max border-b rounded-none p-0">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="reviews" disabled={!building.google_rating}>Reviews</TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="reviews" disabled={!building.google_rating}>Reviews</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="overview" className="space-y-6">
            {listings && listings.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Available Homes</h3>
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="location">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              {building.latitude && building.longitude ? (
                <LocationMap
                  latitude={building.latitude}
                  longitude={building.longitude}
                  buildingName={building.name}
                />
              ) : (
                <p className="text-muted-foreground">Location information not available</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="amenities">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Amenities</h3>
              {building.features && Array.isArray(building.features) ? (
                <AmenitiesGrid features={building.features} />
              ) : (
                <p className="text-muted-foreground">No amenities information available</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Reviews</h3>
              {/* Add reviews content here */}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {buildingScore && (
        <MatchScoreModal
          open={showScoreModal}
          onOpenChange={setShowScoreModal}
          scores={buildingScore}
        />
      )}
    </div>
  );
}
