
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search, Heart, Route, Settings, User2, LogOut, Menu, LayoutDashboard, HelpCircle, Home } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authActionType, setAuthActionType] = useState<"shortlist" | "visit" | "notify">("shortlist");
  const isAuthPage = location.pathname === "/auth";
  const isPreferencesPage = location.pathname === "/preferences";
  const [showLogo, setShowLogo] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState(1);

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;

      return {
        ...data,
        role: data.role as 'admin' | 'agent' | 'user'
      } as Profile;
    }
  });

  useEffect(() => {
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
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['buildingScores'] });
        queryClient.invalidateQueries({ queryKey: ['shortlistedBuildings'] });
        navigate("/buildings");
        toast({
          title: "Signed out",
          description: "You have been signed out successfully"
        });
      } else if (event === "SIGNED_IN") {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['buildingScores'] });
        queryClient.invalidateQueries({ queryKey: ['shortlistedBuildings'] });
        refetchProfile();
        setShowAuthModal(false);
        window.dispatchEvent(new CustomEvent('supabase.auth.stateChange', { 
          detail: { event, session } 
        }));
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, toast, queryClient, refetchProfile]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openAuthModal = (actionType: "shortlist" | "visit" | "notify") => {
    setAuthActionType(actionType);
    setShowAuthModal(true);
  };

  const menuItems = [
    {
      name: "Shortlist",
      icon: Heart,
      path: "/shortlist"
    }, 
    {
      name: "Visits",
      icon: Route,
      path: "/visits"
    }, 
    {
      name: "Account",
      icon: Settings,
      path: "/settings"
    },
    {
      name: "Help",
      icon: HelpCircle,
      path: "https://intercom.help/serai-homes/en",
      isExternal: true
    }
  ];

  if (profile && (profile.role === 'admin' || profile.role === 'agent')) {
    menuItems.unshift({
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard"
    });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search term:", searchTerm);
  };

  const getInitials = () => {
    if (!profile || !profile.full_name) return "U";
    const names = profile.full_name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
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
                        <Button 
                          variant="outline" 
                          className="rounded-full pl-2.5 pr-3.5 py-1.5 h-auto border-gray-300 hover:bg-gray-100 shadow-sm flex items-center gap-2" 
                        >
                          <Menu className="h-5 w-5" />
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
                              <AvatarFallback>{getInitials()}</AvatarFallback>
                            </Avatar>
                            {notifications > 0 && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                {notifications}
                              </div>
                            )}
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                        {menuItems.map(item => (
                          <DropdownMenuItem 
                            key={item.name} 
                            onClick={() => {
                              if (item.isExternal) {
                                window.open(item.path, "_blank");
                              } else {
                                navigate(item.path);
                              }
                            }} 
                            className="cursor-pointer flex items-center transition-colors hover:bg-secondary py-2"
                          >
                            <item.icon className="mr-2 h-4 w-4 transition-transform group-hover:rotate-6" />
                            <span>{item.name}</span>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive py-2">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => openAuthModal("shortlist")} 
                      className="rounded-full pl-2.5 pr-3.5 py-1.5 h-auto border-gray-300 hover:bg-gray-100 shadow-sm flex items-center gap-2"
                    >
                      <Menu className="h-5 w-5" />
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
      
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t p-2 flex justify-around items-center">
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center ${location.pathname === '/buildings' ? 'text-primary' : 'text-muted-foreground'}`} 
          onClick={() => navigate('/buildings')}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center ${location.pathname === '/shortlist' ? 'text-primary' : 'text-muted-foreground'}`} 
          onClick={() => profile ? navigate('/shortlist') : openAuthModal('shortlist')}
        >
          <Heart className="h-5 w-5" />
          <span className="text-xs mt-1">Shortlist</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center ${location.pathname === '/visits' ? 'text-primary' : 'text-muted-foreground'}`} 
          onClick={() => profile ? navigate('/visits') : openAuthModal('visit')}
        >
          <Route className="h-5 w-5" />
          <span className="text-xs mt-1">Visits</span>
        </Button>
      </div>
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal} 
        actionType={authActionType} 
      />
    </div>
  );
}
