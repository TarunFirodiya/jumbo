import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Buildings() {
  const navigate = useNavigate();

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
        .select("id, name, locality, age, min_price, max_price, images");
      
      if (error) throw error;
      return data;
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
            <div className="aspect-video overflow-hidden">
              <img
                src={building.images?.[0] || "https://images.unsplash.com/photo-1487958449943-2429e8be8625"}
                alt={building.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{building.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Location: {building.locality || "Location not specified"}
                </p>
                {building.age && (
                  <p className="text-sm text-gray-600">
                    Age: {building.age} years
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  Price Range: {building.min_price ? `₹${building.min_price.toLocaleString()}` : 'N/A'} 
                  {building.max_price ? ` - ₹${building.max_price.toLocaleString()}` : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}