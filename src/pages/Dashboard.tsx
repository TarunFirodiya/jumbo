
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentManagement } from "@/components/dashboard/AgentManagement";
import { ListingManagement } from "@/components/dashboard/ListingManagement";
import { VisitManagement } from "@/components/dashboard/VisitManagement";
import { BuildingManagement } from "@/components/dashboard/BuildingManagement";
import { UserPlus, ListChecks, Calendar, Building } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get user profile with role
  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      // Cast the role to ensure it matches our Profile type
      return {
        ...data,
        role: data.role as 'admin' | 'agent' | 'user'
      } as Profile;
    }
  });

  // Check authentication and role
  useEffect(() => {
    if (!isLoading && !profile) {
      toast({
        title: "Access Denied",
        description: "Please log in to access the dashboard",
        variant: "destructive"
      });
      navigate('/auth');
    }

    if (profile && profile.role === 'user') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the dashboard",
        variant: "destructive"
      });
      navigate('/buildings');
    }
  }, [profile, isLoading, navigate, toast]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {profile?.role === 'admin' && (
        <Tabs defaultValue="buildings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="buildings" className="gap-2">
              <Building className="h-4 w-4" />
              Buildings
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Agent Management
            </TabsTrigger>
            <TabsTrigger value="listings" className="gap-2">
              <ListChecks className="h-4 w-4" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="visits" className="gap-2">
              <Calendar className="h-4 w-4" />
              Visits
            </TabsTrigger>
          </TabsList>
          <TabsContent value="buildings">
            <BuildingManagement currentUser={profile} />
          </TabsContent>
          <TabsContent value="agents">
            <AgentManagement />
          </TabsContent>
          <TabsContent value="listings">
            <ListingManagement currentUser={profile} />
          </TabsContent>
          <TabsContent value="visits">
            <VisitManagement currentUser={profile} />
          </TabsContent>
        </Tabs>
      )}
      {profile?.role === 'agent' && (
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings" className="gap-2">
              <ListChecks className="h-4 w-4" />
              My Listings
            </TabsTrigger>
            <TabsTrigger value="visits" className="gap-2">
              <Calendar className="h-4 w-4" />
              Visits
            </TabsTrigger>
          </TabsList>
          <TabsContent value="listings">
            <ListingManagement currentUser={profile} />
          </TabsContent>
          <TabsContent value="visits">
            <VisitManagement currentUser={profile} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
