import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { Home, Heart, Settings, HelpCircle } from "lucide-react";

const tabs = [
  { name: "Home", url: "/buildings", icon: Home },
  { name: "Shortlist", url: "/shortlist", icon: Heart },
  { name: "Settings", url: "/settings", icon: Settings },
  { name: "Support", url: "#", icon: HelpCircle, externalLink: "https://wa.link/i4szqw" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isAuthPage = location.pathname === "/auth";

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
      {!isAuthPage && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
          <div className="container mx-auto">
            <NavBar items={tabs} />
          </div>
        </div>
      )}
    </div>
  );
}