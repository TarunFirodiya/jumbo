
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Home, Settings, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";
import { AgentManagement } from "@/components/dashboard/AgentManagement";
import { BuildingManagement } from "@/components/dashboard/BuildingManagement";
import { ListingManagement } from "@/components/dashboard/ListingManagement";
import VisitManagement from "@/components/dashboard/VisitManagement";
import { Profile } from "@/types/profile";

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
      <SEO title="Admin Dashboard | Jumbo" noindex={true} />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
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
          </div>
        </Tabs>
      </div>
    </>
  );
}
