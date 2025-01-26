import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Auth from "./pages/Auth";
import Preferences from "./pages/Preferences";
import Buildings from "./pages/Buildings";
import BuildingDetails from "./pages/BuildingDetails";
import Shortlist from "./pages/Shortlist";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/buildings" element={<Buildings />} />
            <Route path="/buildings/:id" element={<BuildingDetails />} />
            <Route path="/shortlist" element={<Shortlist />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Navigate to="/auth" replace />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;