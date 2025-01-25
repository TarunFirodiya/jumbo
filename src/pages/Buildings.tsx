import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  Building,
  Heart, 
  HeartSolid,
  InfoCircle,
  Map,
  Cube, 
  Camera
} from "iconoir-react";

export default function Buildings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch buildings data
  const { data: buildings, isLoading } = useQuery({
    queryKey: ["buildings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("buildings")
        .select("id, name, locality, age, total_floors, min_price, max_price, images");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch shortlisted buildings
  const { data: shortlistedBuildings } = useQuery({
    queryKey: ["shortlisted"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_building_shortlist")
        .select("id");
      
      if (error) throw error;
      return data.map(item => item.id);
    },
  });

  // Shortlist mutation
  const shortlistMutation = useMutation({
    mutationFn: async (buildingId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_building_shortlist")
        .insert({ id: buildingId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shortlisted"] });
      toast({
        title: "Success",
        description: "Building has been shortlisted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to shortlist building",
        variant: "destructive",
      });
      console.error("Shortlist error:", error);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading buildings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Buildings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildings?.map((building) => (
          <Card key={building.id} className="overflow-hidden">
            <div className="relative">
              <div className="aspect-video overflow-hidden">
                <img
                  src={building.images?.[0] || "/lovable-uploads/f82e009e-6ea1-464e-899f-2af5b617ef52.png"}
                  alt={building.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                  onClick={() => shortlistMutation.mutate(building.id)}
                >
                  {shortlistedBuildings?.includes(building.id) ? (
                    <HeartSolid className="w-5 h-5 text-red-500" />
                  ) : (
                    <Heart className="w-5 h-5" />
                  )}
                </button>
                <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">
                  <Camera className="w-5 h-5" />
                </button>
                <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">
                  <Map className="w-5 h-5" />
                </button>
                <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">
                  <Cube className="w-5 h-5" />
                </button>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{building.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Map className="w-4 h-4" />
                    {building.locality || "Location not specified"}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                  92% Match
                </div>
              </div>
              <div className="flex gap-4 my-4">
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    {building.age || "?"} years
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <InfoCircle className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    {building.total_floors || "?"} floors
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">Price Range</p>
                <p className="text-lg font-semibold">
                  {building.min_price ? `₹${(building.min_price/10000000).toFixed(1)} Cr` : 'N/A'} 
                  {building.max_price ? ` - ₹${(building.max_price/10000000).toFixed(1)} Cr` : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
