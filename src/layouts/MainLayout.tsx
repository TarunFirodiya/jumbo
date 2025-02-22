
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

export default function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isAuthPage = location.pathname === "/auth";
  const isPreferencesPage = location.pathname === "/preferences";
  const [showLogo, setShowLogo] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

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

  const menuItems = [
    ...(profile && (profile.role === 'admin' || profile.role === 'agent') ? [{
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard"
    }] : []),
    {
      name: "Home",
      icon: Home,
      path: "/buildings"
    },
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
      name: "Settings",
      icon: Settings,
      path: "/settings"
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search term:", searchTerm);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${showLogo ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <img src="/lovable-uploads/aa29ee67-7c22-40ce-b82d-f704e9c92c3a.png" alt="Serai Homes" className="h-8 md:h-10 w-auto cursor-pointer" onClick={() => navigate('/buildings')} />
            
            {!isAuthPage && !isPreferencesPage && (
              <>
                <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xl mx-auto">
                  <div className="relative w-full">
                    <Input
                      type="search"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </form>

                <div className="flex items-center gap-2">
                  {profile ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Menu className="h-5 w-5 md:hidden" />
                          <User2 className="h-5 w-5 hidden md:block" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <div className="px-2 py-1.5 text-sm font-medium">
                          {profile.email}
                        </div>
                        <DropdownMenuSeparator />
                        {menuItems.map(item => (
                          <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)} className="cursor-pointer">
                            <item.icon className="mr-2 h-4 w-4" />
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
                    <Button variant="ghost" size="icon" onClick={() => navigate('/auth')} className="rounded-full">
                      <User2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 mt-16">
        {children}
      </main>
    </div>
  );
}
