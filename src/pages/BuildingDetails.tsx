import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, MapPin, Star, List } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ListingCard from "@/components/ListingCard";
import LocationMap from '@/components/LocationMap';
import { useState } from "react";

export default function BuildingDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
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

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ));
  };

  const renderMatchScoreCircle = (score: number, label: string) => (
    <div className="relative flex flex-col items-center">
      <svg className="w-24 h-24 -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="36"
          className="stroke-muted fill-none"
          strokeWidth="6"
        />
        <circle
          cx="48"
          cy="48"
          r="36"
          className="stroke-primary fill-none transition-all duration-1000 ease-out"
          strokeWidth="6"
          strokeDasharray={`${score * 226.2} 226.2`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold">{Math.round(score * 100)}%</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Image Carousel */}
      <div className="w-full aspect-video relative">
        {building.images && building.images.length > 0 && (
          <Carousel
            className="w-full h-full"
            onSelect={(index) => setCurrentSlide(index)}
          >
            <CarouselContent>
              {building.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={image}
                      alt={`${building.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {building.images.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    currentSlide === index ? "bg-white scale-125" : "bg-white/50"
                  )}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </Carousel>
        )}
      </div>

      {/* Header Section */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold">{building.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{building.locality}, {building.sub_locality}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {buildingScore && (
                <button
                  onClick={() => setShowScoreModal(true)}
                  className="relative group"
                >
                  <svg className="w-12 h-12 -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      className="stroke-muted fill-none"
                      strokeWidth="4"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      className="stroke-primary fill-none transition-all duration-1000 ease-out"
                      strokeWidth="4"
                      strokeDasharray={`${(buildingScore.overall_match_score || 0) * 125.6} 125.6`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {Math.round((buildingScore.overall_match_score || 0) * 100)}%
                    </span>
                  </div>
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-popover text-popover-foreground text-xs rounded px-2 py-1">
                    Click to view match details
                  </div>
                </button>
              )}
              {building.google_rating && (
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1">
                    {renderStars(building.google_rating)}
                    <span className="font-semibold ml-1">{building.google_rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">The people's voice!</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleShortlist}
                className={cn(
                  "transition-colors",
                  isShortlisted && "text-red-500 hover:text-red-600"
                )}
              >
                <Heart className={cn("h-5 w-5", isShortlisted && "fill-current")} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Basic Details Card */}
        <Card className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {building.type && (
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{building.type}</p>
              </div>
            )}
            {building.total_floors && (
              <div>
                <p className="text-sm text-muted-foreground">Total Floors</p>
                <p className="font-medium">{building.total_floors}</p>
              </div>
            )}
            {building.age !== null && (
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">{building.age} years</p>
              </div>
            )}
            {building.price_psqft && (
              <div>
                <p className="text-sm text-muted-foreground">Price per sq ft</p>
                <p className="font-medium">₹{building.price_psqft.toLocaleString()}</p>
              </div>
            )}
            {building.min_price && (
              <div>
                <p className="text-sm text-muted-foreground">Price Range</p>
                <p className="font-medium">
                  ₹{(building.min_price/10000000).toFixed(1)} Cr
                  {building.max_price && ` - ₹${(building.max_price/10000000).toFixed(1)} Cr`}
                </p>
              </div>
            )}
          </div>
          <Button 
            className="mt-6 w-full sm:w-auto"
            onClick={() => navigate(`/buildings/${id}/listings`)}
          >
            Find a Home
          </Button>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="w-full">
          {isMobile ? (
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex w-max border-b rounded-none p-0">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="location">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </TabsTrigger>
                <TabsTrigger value="amenities">
                  <List className="h-4 w-4 mr-2" />
                  Amenities
                </TabsTrigger>
                <TabsTrigger value="reviews" disabled={!building.google_rating}>
                  <Star className="h-4 w-4 mr-2" />
                  Reviews
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="location">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </TabsTrigger>
              <TabsTrigger value="amenities">
                <List className="h-4 w-4 mr-2" />
                Amenities
              </TabsTrigger>
              <TabsTrigger value="reviews" disabled={!building.google_rating}>
                <Star className="h-4 w-4 mr-2" />
                Reviews
              </TabsTrigger>
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
              {/* Add amenities content here */}
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

      {/* Match Score Modal */}
      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Match Score Breakdown</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            {buildingScore && (
              <>
                {renderMatchScoreCircle(buildingScore.overall_match_score || 0, "Overall")}
                {renderMatchScoreCircle(buildingScore.location_match_score || 0, "Location")}
                {renderMatchScoreCircle(buildingScore.budget_match_score || 0, "Budget")}
                {renderMatchScoreCircle(buildingScore.lifestyle_match_score || 0, "Lifestyle")}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}