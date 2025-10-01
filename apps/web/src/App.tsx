import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AjouterAppelOffre from "./pages/AjouterAppelOffre";

import AppelsOffres from "./pages/AppelsOffres";


import ProfilEntreprise from "./pages/ProfilEntreprise";
import AppelOffreDetails from "./pages/AppelOffreDetails";
import MarcheDetails from "./pages/MarcheDetails";
import MarcheEnvoyerDevis from "./pages/MarcheEnvoyerDevis";
import DevisRecus from "./pages/DevisRecus";
import DevisRecuDetail from "./pages/DevisRecuDetail";
import DevisDetails from "./pages/DevisDetails";
import SelectionReseau from "./pages/SelectionReseau";
import CarnetContacts from "./pages/CarnetContacts";

const queryClient = new QueryClient();

// Get sidebar state from cookie, default to closed
const getSidebarDefaultOpen = () => {
  if (typeof document === 'undefined') return false;
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('sidebar:state='));
  return cookie ? cookie.split('=')[1] === 'true' : false;
};

const App = () => {
  const sidebarDefaultOpen = getSidebarDefaultOpen();
  
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <SidebarProvider defaultOpen={sidebarDefaultOpen}>
              <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Navigate to="/appels-offres" replace />} />
                <Route path="/ajouter-appel-offre" element={<AjouterAppelOffre />} />
                
                <Route path="/marches/:id" element={<MarcheDetails />} />
                <Route path="/marches/:id/devis" element={<MarcheEnvoyerDevis />} />
                <Route path="/appels-offres" element={<AppelsOffres />} />
                <Route path="/appels-offres/:id" element={<AppelOffreDetails />} />
                <Route path="/appels-offres/:id/devis" element={<DevisRecus />} />
                <Route path="/appels-offres/:id/devis/:devisId" element={<DevisRecuDetail />} />
                <Route path="/devis/:id" element={<DevisDetails />} />
                
                
                <Route path="/company-profile" element={<ProfilEntreprise />} />
                <Route path="/selection-reseau" element={<SelectionReseau />} />
                <Route path="/carnet-contacts" element={<CarnetContacts />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </SidebarProvider>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
