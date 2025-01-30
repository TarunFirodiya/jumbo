import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PreferencesForm } from "@/components/PreferencesForm";

export default function SettingsPage() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view preferences",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setPreferences(data);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      toast({
        title: "Error",
        description: "Failed to load preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePreferences = async (formData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update preferences",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          ...formData,
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your preferences have been updated",
      });

      // Refresh preferences
      fetchUserPreferences();
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        {loading ? (
          <div>Loading preferences...</div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Preferences</h2>
              <PreferencesForm
                initialData={preferences}
                onSubmit={handleUpdatePreferences}
                mode="edit"
              />
            </div>

            <div className="pt-8 border-t">
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="w-full md:w-auto"
              >
                Log Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}