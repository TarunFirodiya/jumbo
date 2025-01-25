import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { Home, Heart, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const tabs = [
  { title: "Home", icon: Home, path: "/buildings" },
  { title: "Shortlist", icon: Heart, path: "/shortlist" },
  { title: "Settings", icon: Settings, path: "/settings" },
  { title: "Support", icon: HelpCircle, externalLink: "https://wa.link/i4szqw" },
];

export default function SettingsPage() {
  const { toast } = useToast();

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

  return (
    <div className="container mx-auto px-4">
      <div className="sticky top-0 z-10 bg-background py-4">
        <ExpandableTabs tabs={tabs} />
      </div>
      <div className="mt-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="max-w-md">
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="w-full"
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}