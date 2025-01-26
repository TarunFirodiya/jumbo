import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Star, Video, DollarSign, LayoutDashboard, List, MessageSquare } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function BuildingDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
      const { data, error } = await supabase
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
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold truncate">{building.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{building.locality}, {building.sub_locality}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {building.google_rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{building.google_rating}</span>
                </div>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleShortlist}
                className={cn(
                  "transition-colors",
                  isShortlisted && "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-500"
                )}
              >
                <Heart className={cn("h-5 w-5", isShortlisted && "fill-current")} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8 flex-1">
        {building.images && building.images.length > 0 && (
          <Card className="p-6">
            <Carousel className="w-full">
              <CarouselContent>
                {building.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video w-full overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`${building.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </Card>
        )}

        <Tabs defaultValue="overview" className="w-full">
          {isMobile ? (
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex w-max border-b rounded-none p-0">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="videos" disabled={!building.video_thumbnail}>
                  <Video className="h-4 w-4 mr-2" />
                  Videos
                </TabsTrigger>
                <TabsTrigger value="location">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </TabsTrigger>
                <TabsTrigger value="price">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Price
                </TabsTrigger>
                <TabsTrigger value="layout">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Layout
                </TabsTrigger>
                <TabsTrigger value="homes">
                  <List className="h-4 w-4 mr-2" />
                  Available Homes
                </TabsTrigger>
                <TabsTrigger value="amenities">
                  <List className="h-4 w-4 mr-2" />
                  Amenities
                </TabsTrigger>
                <TabsTrigger value="reviews" disabled={!building.google_rating}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Reviews
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="videos" disabled={!building.video_thumbnail}>
                <Video className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="location">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </TabsTrigger>
              <TabsTrigger value="price">
                <DollarSign className="h-4 w-4 mr-2" />
                Price
              </TabsTrigger>
              <TabsTrigger value="layout">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="homes">
                <List className="h-4 w-4 mr-2" />
                Available Homes
              </TabsTrigger>
              <TabsTrigger value="amenities">
                <List className="h-4 w-4 mr-2" />
                Amenities
              </TabsTrigger>
              <TabsTrigger value="reviews" disabled={!building.google_rating}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Reviews
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="price" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Price Range</h3>
              {building.min_price && building.max_price && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Price Range</p>
                  <p className="font-medium">
                    ₹{building.min_price.toLocaleString()} - ₹{building.max_price.toLocaleString()}
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Location Details</h3>
              <div className="space-y-4">
                {building.locality && (
                  <div>
                    <p className="text-sm text-muted-foreground">Locality</p>
                    <p className="font-medium">{building.locality}</p>
                  </div>
                )}
                {building.sub_locality && (
                  <div>
                    <p className="text-sm text-muted-foreground">Sub Locality</p>
                    <p className="font-medium">{building.sub_locality}</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Other tab contents would be implemented similarly */}
        </Tabs>
      </div>
    </div>
  );
}
