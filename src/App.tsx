import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TranslationProvider } from "@/components/TranslationProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import SiteAuthGuard from "@/components/SiteAuthGuard";
import Index from "./pages/Index";

import AboutUs from "./pages/AboutUs";
import HowTo from "./pages/HowTo";
import Advertise from "./pages/Advertise";
import ROI from "./pages/ROI";
import Toolbox from "./pages/Toolbox";
import VisaInfo from "./pages/VisaInfo";
import Members from "./pages/Members";
import JoinFree from "./pages/JoinFree";
import TVChannel from "./pages/TVChannel";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import Auth from "./pages/Auth";
import Collections from "./pages/Collections";
import SharedCollection from "./pages/SharedCollection";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TranslationProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth route accessible without site authentication */}
              <Route path="/auth" element={<Auth />} />
              
              {/* All other routes require site authentication */}
              <Route path="/*" element={
                <SiteAuthGuard>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    
                    <Route path="/about-us" element={<AboutUs />} />
                    <Route path="/how-to" element={<HowTo />} />
                    <Route path="/advertise" element={<Advertise />} />
                    <Route path="/roi" element={<ROI />} />
                    <Route path="/toolbox" element={<Toolbox />} />
                    <Route path="/visa-info" element={<VisaInfo />} />
                    <Route path="/members" element={<Members />} />
                    <Route path="/join-free" element={<JoinFree />} />
                    <Route path="/tv-channel" element={<TVChannel />} />
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/user-dashboard" 
                      element={
                        <ProtectedRoute>
                          <UserDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/collections" 
                      element={
                        <ProtectedRoute>
                          <Collections />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/shared/:token" element={<SharedCollection />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SiteAuthGuard>
              } />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TranslationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
