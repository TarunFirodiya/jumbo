import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { Home, Heart, Settings, HelpCircle } from "lucide-react";

const tabs = [
  { title: "Home", icon: Home, path: "/buildings" },
  { title: "Shortlist", icon: Heart, path: "/shortlist" },
  { title: "Settings", icon: Settings, path: "/settings" },
  { title: "Support", icon: HelpCircle, externalLink: "https://wa.link/i4szqw" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      if (event === "SIGNED_OUT") {
        navigate("/auth");
        toast({
          title: "Signed out",
          description: "You have been signed out successfully"
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 backdrop-blur-md bg-background/80 border-t">
        <div className="container mx-auto">
          <ExpandableTabs tabs={tabs} />
        </div>
      </div>
    </div>
  );
}