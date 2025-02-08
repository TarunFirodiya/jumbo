
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { Home, Heart, Route, Settings } from "lucide-react";

const tabs = [
  { name: "Home", url: "/buildings", icon: Home },
  { name: "Shortlist", url: "/shortlist", icon: Heart },
  { name: "Visits", url: "/visits", icon: Route },
  { name: "Settings", url: "/settings", icon: Settings },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isAuthPage = location.pathname === "/auth";
  const isPreferencesPage = location.pathname === "/preferences";
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowLogo(currentScrollY <= lastScrollY || currentScrollY < 50);
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <div 
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
          showLogo ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <img 
            src="/lovable-uploads/aa29ee67-7c22-40ce-b82d-f704e9c92c3a.png" 
            alt="Serai Homes" 
            className="h-8 md:h-10 w-auto"
          />
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 mt-16">
        {children}
      </main>

      {!isAuthPage && !isPreferencesPage && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
          <div className="container mx-auto">
            <NavBar items={tabs} />
          </div>
        </div>
      )}
    </div>
  );
}
