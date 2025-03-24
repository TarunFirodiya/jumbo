
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigationType } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import { HelmetProvider } from 'react-helmet-async';
import { trackPageView } from "./utils/analytics";

// Lazy load components
const Buildings = lazy(() => import("./pages/Buildings"));
const BuildingDetails = lazy(() => import("./pages/BuildingDetails"));
const LocalityBuildings = lazy(() => import("./pages/LocalityBuildings"));
const Shortlist = lazy(() => import("./pages/Shortlist"));
const Settings = lazy(() => import("./pages/Settings"));
const Visits = lazy(() => import("./pages/Visits"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Create a loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="h-12 w-12 rounded-full border-4 border-t-primary animate-spin"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - previously cacheTime
    },
  },
});

// Analytics wrapper component to track route changes
const AnalyticsWrapper = ({ children }) => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Don't track initial page load (it's already tracked in main.tsx)
    if (navigationType !== 'POP') {
      trackPageView(location.pathname);
    }
  }, [location.pathname, navigationType]);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <HelmetProvider>
        <TooltipProvider>
          <AnalyticsWrapper>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/buildings" replace />} />
                  <Route path="/buildings" element={<Buildings />} />
                  <Route path="/buildings/locality/:locality" element={<LocalityBuildings />} />
                  <Route path="/buildings/:id" element={<BuildingDetails />} />
                  <Route path="/shortlist" element={<Shortlist />} />
                  <Route path="/visits" element={<Visits />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </MainLayout>
          </AnalyticsWrapper>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </HelmetProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
