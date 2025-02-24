import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "@/layouts/MainLayout";
import { HelmetProvider } from 'react-helmet-async';
import Home from "@/pages/Home";
import Buildings from "@/pages/Buildings";
import BuildingDetails from "@/pages/BuildingDetails";
import Account from "@/pages/Account";

export default function App() {
  return (
    <HelmetProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buildings" element={<Buildings />} />
          <Route path="/buildings/:id" element={<BuildingDetails />} />
          <Route path="/account" element={<Account />} />
        </Routes>
        <Toaster />
      </MainLayout>
    </HelmetProvider>
  );
}
