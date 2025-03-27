
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Home, Settings, Users, BarChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";
import { AgentManagement } from "@/components/dashboard/AgentManagement";
import { BuildingManagement } from "@/components/dashboard/BuildingManagement";
import { ListingManagement } from "@/components/dashboard/ListingManagement";
import VisitManagement from "@/components/dashboard/VisitManagement";
import { Profile } from "@/types/profile";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("visits");

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Get user profile with role
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user
  });

  // Get visits
  const { 
    data: visits,
    isLoading: visitsLoading,
    refetch: refetchVisits
  } = useQuery({
    queryKey: ['dashboard-visits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          buildings:building_id(*),
          client:user_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile && profile.role === 'admin'
  });

  // Get building stats
  const { data: buildingStats } = useQuery({
    queryKey: ['building-stats'],
    queryFn: async () => {
      const { data: buildings, error: buildingsError } = await supabase
        .from('buildings')
        .select('id, completion_status');
      
      if (buildingsError) throw buildingsError;
      
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, building_id, status');
        
      if (listingsError) throw listingsError;
      
      const totalBuildings = buildings?.length || 0;
      const totalListings = listings?.length || 0;
      
      // Process building completion status
      const completeBuildings = buildings?.filter(b => {
        if (!b.completion_status) return false;
        // Handle different shapes of completion_status
        let status;
        try {
          status = typeof b.completion_status === 'string' 
            ? JSON.parse(b.completion_status) 
            : b.completion_status;
          
          return Object.values(status).every(Boolean);
        } catch (e) {
          console.error("Error parsing completion status:", e);
          return false;
        }
      }).length || 0;
      
      // Process listing completion status
      const completeListings = 0; // We'll skip this for now since listings don't have completion_status yet
      
      // Process listing statuses
      const availableListings = listings?.filter(l => l.status === 'available').length || 0;
      const reservedListings = listings?.filter(l => l.status === 'reserved').length || 0;
      const soldListings = listings?.filter(l => l.status === 'sold').length || 0;
      
      return {
        totalBuildings,
        totalListings,
        completeBuildings,
        completeListings,
        buildingCompletionRate: totalBuildings ? Math.round((completeBuildings / totalBuildings) * 100) : 0,
        listingCompletionRate: totalListings ? Math.round((completeListings / totalListings) * 100) : 0,
        availableListings,
        reservedListings,
        soldListings
      };
    },
    enabled: !!profile && profile.role === 'admin'
  });

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col space-y-4 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please contact an administrator if you believe you should have access.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO title="Admin Dashboard | Cozy Dwell Search" noindex={true} />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        {/* Dashboard Overview Cards */}
        {activeTab === "visits" && buildingStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Buildings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{buildingStats.totalBuildings}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="text-xs text-muted-foreground">Completion</div>
                  <Progress value={buildingStats.buildingCompletionRate} className="h-2 flex-1" />
                  <div className="text-xs font-medium">{buildingStats.buildingCompletionRate}%</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{buildingStats.totalListings}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="text-xs text-muted-foreground">Completion</div>
                  <Progress value={buildingStats.listingCompletionRate} className="h-2 flex-1" />
                  <div className="text-xs font-medium">{buildingStats.listingCompletionRate}%</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Listing Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs">Available</span>
                  <span className="text-sm font-medium">{buildingStats.availableListings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs">Reserved</span>
                  <span className="text-sm font-medium">{buildingStats.reservedListings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs">Sold</span>
                  <span className="text-sm font-medium">{buildingStats.soldListings}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visits?.length || 0}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  Total scheduled property visits
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="visits" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Visits</span>
            </TabsTrigger>
            <TabsTrigger value="buildings" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Buildings</span>
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Listings</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Agents</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="bg-card border rounded-lg shadow-sm">
            <TabsContent value="visits" className="p-6">
              <VisitManagement 
                visits={visits || []} 
                isLoading={visitsLoading} 
                refetch={refetchVisits} 
              />
            </TabsContent>
            
            <TabsContent value="buildings" className="p-6">
              <BuildingManagement 
                currentUser={profile}
              />
            </TabsContent>
            
            <TabsContent value="listings" className="p-6">
              <ListingManagement 
                currentUser={profile}
              />
            </TabsContent>
            
            <TabsContent value="agents" className="p-6">
              <AgentManagement />
            </TabsContent>
            
            <TabsContent value="analytics" className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
                <p className="text-muted-foreground">
                  Detailed analytics will be implemented in a future update.
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}
