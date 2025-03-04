
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search, Home, Heart, Route, Settings, User2, LogOut, Menu, LayoutDashboard } from "lucide-react";
import { Footerdemo } from "@/components/ui/footer-section";
import { AuthModal } from "@/components/auth/AuthModal";

export default function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authActionType, setAuthActionType] = useState<"shortlist" | "visit" | "notify">("shortlist");
  const isAuthPage = location.pathname === "/auth";
  const isPreferencesPage = location.pathname === "/preferences";
  const [showLogo, setShowLogo] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;

      // Cast the role to ensure it matches our Profile type
      return {
        ...data,
        role: data.role as 'admin' | 'agent' | 'user'
      } as Profile;
    }
  });
  
  // Listen for auth events and handle modals
  useEffect(() => {
    // Listen for custom auth modal trigger events
    const handleAuthTriggerEvent = (e: CustomEvent<{action: "shortlist" | "visit" | "notify"}>) => {
      setAuthActionType(e.detail.action);
      setShowAuthModal(true);
    };
    
    document.addEventListener('triggerAuthModal', handleAuthTriggerEvent as EventListener);
    
    return () => {
      document.removeEventListener('triggerAuthModal', handleAuthTriggerEvent as EventListener);
    };
  }, []);
  
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowLogo(currentScrollY <= lastScrollY || currentScrollY < 50);
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        // Navigate to buildings page instead of auth page when signing out
        navigate("/buildings");
        toast({
          title: "Signed out",
          description: "You have been signed out successfully"
        });
      } else if (event === "SIGNED_IN") {
        // Close the auth modal if it's open when a user signs in
        setShowAuthModal(false);
        toast({
          title: "Signed in",
          description: "You have been signed in successfully"
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, toast]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Toast notification is handled by the onAuthStateChange listener
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Helper function to open auth modal with specific action type
  const openAuthModal = (actionType: "shortlist" | "visit" | "notify") => {
    setAuthActionType(actionType);
    setShowAuthModal(true);
  };
  
  const menuItems = [...(profile && (profile.role === 'admin' || profile.role === 'agent') ? [{
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard"
  }] : []), {
    name: "Home",
    icon: Home,
    path: "/buildings"
  }, {
    name: "Shortlist",
    icon: Heart,
    path: "/shortlist"
  }, {
    name: "Visits",
    icon: Route,
    path: "/visits"
  }, {
    name: "Settings",
    icon: Settings,
    path: "/settings"
  }];
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search term:", searchTerm);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b ${showLogo ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <img 
              src="/lovable-uploads/aa29ee67-7c22-40ce-b82d-f704e9c92c3a.png" 
              alt="Serai Homes" 
              className="h-9 md:h-10 w-auto cursor-pointer transition-transform duration-300 hover:scale-105" 
              onClick={() => navigate('/buildings')} 
            />
            
            {!isAuthPage && !isPreferencesPage && (
              <>
                <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xl mx-auto">
                  <div className="relative w-full">
                    {/* Search implementation can go here */}
                  </div>
                </form>

                <div className="flex items-center gap-2">
                  {profileLoading ? (
                    <div className="h-10 w-10 rounded-full animate-pulse bg-muted"></div>
                  ) : profile ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full transition-colors hover:bg-secondary">
                          <Menu className="h-5 w-5 md:hidden" />
                          <User2 className="h-5 w-5 hidden md:block" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                        <div className="px-2 py-1.5 text-sm font-medium">
                          {profile.email}
                        </div>
                        <DropdownMenuSeparator />
                        {menuItems.map(item => (
                          <DropdownMenuItem 
                            key={item.path} 
                            onClick={() => navigate(item.path)} 
                            className="cursor-pointer flex items-center transition-colors hover:bg-secondary"
                          >
                            <item.icon className="mr-2 h-4 w-4 transition-transform group-hover:rotate-6" />
                            <span>{item.name}</span>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openAuthModal("shortlist")} 
                      className="rounded-full transition-colors hover:bg-secondary"
                    >
                      <User2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 mt-16 flex-grow animate-fade-in">
        {children}
      </main>
      
      <Footerdemo />
      
      {/* Auth Modal for handling login/signup */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal} 
        actionType={authActionType} 
      />
    </div>
  );
}
