
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/profile";

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Agent Management</h2>
            <p className="text-muted-foreground">Manage agent accounts and assignments</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Listing Overview</h2>
            <p className="text-muted-foreground">Monitor all property listings</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <p className="text-muted-foreground">View performance metrics</p>
          </div>
        </div>
      )}
      {profile?.role === 'agent' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">My Listings</h2>
            <p className="text-muted-foreground">Manage your property listings</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Visits</h2>
            <p className="text-muted-foreground">Schedule and manage property visits</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">My Performance</h2>
            <p className="text-muted-foreground">View your activity metrics</p>
          </div>
        </div>
      )}
    </div>
  );
}
