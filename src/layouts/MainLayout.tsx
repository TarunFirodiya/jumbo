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
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authActionType, setAuthActionType] = useState<"shortlist" | "visit" | "notify">("shortlist");
  const isAuthPage = location.pathname === "/auth";
  const isPreferencesPage = location.pathname === "/preferences";
  const [showLogo, setShowLogo] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState(1);
  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile
  } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return null;
      const {
        data,
        error
      } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      return {
        ...data,
        role: data.role as 'admin' | 'agent' | 'user'
      } as Profile;
    }
  });
  useEffect(() => {
    const handleAuthTriggerEvent = (e: CustomEvent<{
      action: "shortlist" | "visit" | "notify";
    }>) => {
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
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        queryClient.invalidateQueries({
          queryKey: ['profile']
        });
        queryClient.invalidateQueries({
          queryKey: ['buildingScores']
        });
        queryClient.invalidateQueries({
          queryKey: ['shortlistedBuildings']
        });
        navigate("/buildings");
        toast({
          title: "Signed out",
          description: "You have been signed out successfully"
        });
      } else if (event === "SIGNED_IN") {
        queryClient.invalidateQueries({
          queryKey: ['profile']
        });
        queryClient.invalidateQueries({
          queryKey: ['buildingScores']
        });
        queryClient.invalidateQueries({
          queryKey: ['shortlistedBuildings']
        });
        refetchProfile();
        setShowAuthModal(false);
        window.dispatchEvent(new CustomEvent('supabase.auth.stateChange', {
          detail: {
            event,
            session
          }
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
  const menuItems = [{
    name: "Shortlist",
    icon: Heart,
    path: "/shortlist"
  }, {
    name: "Visits",
    icon: Route,
    path: "/visits"
  }, {
    name: "Account",
    icon: Settings,
    path: "/settings"
  }, {
    name: "Help",
    icon: HelpCircle,
    path: "https://intercom.help/serai-homes/en",
    isExternal: true
  }];
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
  return <div className="min-h-screen bg-background flex flex-col">
      <div className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b ${showLogo ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <img src="/lovable-uploads/aa29ee67-7c22-40ce-b82d-f704e9c92c3a.png" alt="Serai Homes" className="h-9 md:h-10 w-auto cursor-pointer transition-transform duration-300 hover:scale-105" onClick={() => navigate('/buildings')} />
            
            {!isAuthPage && !isPreferencesPage && <>
                <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xl mx-auto">
                  <div className="relative w-full">
                    {/* Search implementation can go here */}
                  </div>
                </form>

                <div className="flex items-center gap-2">
                  {profileLoading ? <div className="h-10 w-10 rounded-full animate-pulse bg-muted"></div> : profile ? <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="rounded-full pl-2.5 pr-3.5 py-1.5 h-auto border-gray-300 hover:bg-gray-100 shadow-sm flex items-center gap-2">
                          <Menu className="h-5 w-5" />
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
                              <AvatarFallback>{getInitials()}</AvatarFallback>
                            </Avatar>
                            {notifications > 0 && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                {notifications}
                              </div>}
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                        {menuItems.map(item => <DropdownMenuItem key={item.name} onClick={() => {
                    if (item.isExternal) {
                      window.open(item.path, "_blank");
                    } else {
                      navigate(item.path);
                    }
                  }} className="cursor-pointer flex items-center transition-colors hover:bg-secondary py-2">
                            <item.icon className="mr-2 h-4 w-4 transition-transform group-hover:rotate-6" />
                            <span>{item.name}</span>
                          </DropdownMenuItem>)}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive py-2">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu> : <Button variant="outline" size="icon" onClick={() => openAuthModal("shortlist")} className="rounded-full pl-2.5 pr-3.5 py-1.5 h-auto border-gray-300 hover:bg-gray-100 shadow-sm flex items-center gap-2">
                      <Menu className="h-5 w-5" />
                      <User2 className="h-5 w-5" />
                    </Button>}
                </div>
              </>}
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 mt-16 flex-grow animate-fade-in">
        {children}
      </main>
      
      <footer className="bg-gray-100 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img src="/lovable-uploads/aa29ee67-7c22-40ce-b82d-f704e9c92c3a.png" alt="Serai Homes" className="h-10 w-auto mb-4" />
              <p className="text-sm text-gray-600">
                Making home search simpler and more personalized for everyone.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary">About Us</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary">Careers</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary">Partners</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Contact</h3>
              <address className="not-italic text-sm text-gray-600">
                <p>761 Urban Vault</p>
                <p>Mumbai, Maharashtra 400001</p>
                <p className="mt-2">support@seraihomes.com</p>
                <p>+91 9876543210</p>
              </address>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">© 2024 Serai Homes. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.045-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} actionType={authActionType} />
    </div>;
}