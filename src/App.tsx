import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TranslationProvider } from "@/components/TranslationProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import SiteAuthGuard from "@/components/SiteAuthGuard";
import MobileContainer from "@/components/MobileContainer";
import Index from "./pages/Index";

import AboutUs from "./pages/AboutUs";
import HowTo from "./pages/HowTo";
import Advertise from "./pages/Advertise";
import ROI from "./pages/ROI";
import Toolbox from "./pages/Toolbox";
import VisaInfo from "./pages/VisaInfo";
import Dashboard from "./pages/Dashboard";
import JoinFree from "./pages/JoinFree";
import TVChannel from "./pages/TVChannel";
import BusinessDashboard from "./pages/BusinessDashboard";
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
                    {/* Selection page without MobileContainer */}
                    <Route path="/" element={<Index />} />
                    
                    {/* Menu pages with MobileContainer */}
                    <Route path="/about-us" element={<MobileContainer><AboutUs /></MobileContainer>} />
                    <Route path="/how-to" element={<MobileContainer><HowTo /></MobileContainer>} />
                    <Route path="/advertise" element={<MobileContainer><Advertise /></MobileContainer>} />
                    <Route path="/roi" element={<MobileContainer><ROI /></MobileContainer>} />
                    <Route path="/toolbox" element={<MobileContainer><Toolbox /></MobileContainer>} />
                    <Route path="/visa-info" element={<MobileContainer><VisaInfo /></MobileContainer>} />
                    <Route path="/dashboard" element={<MobileContainer><Dashboard /></MobileContainer>} />
                    <Route path="/join-free" element={<MobileContainer><JoinFree /></MobileContainer>} />
                    <Route path="/tv-channel" element={<MobileContainer><TVChannel /></MobileContainer>} />
                    <Route 
                      path="/business-dashboard" 
                      element={
                        <MobileContainer>
                          <ProtectedRoute>
                            <BusinessDashboard />
                          </ProtectedRoute>
                        </MobileContainer>
                      } 
                    />
                    <Route 
                      path="/user-dashboard" 
                      element={
                        <MobileContainer>
                          <ProtectedRoute>
                            <UserDashboard />
                          </ProtectedRoute>
                        </MobileContainer>
                      } 
                    />
                    <Route 
                      path="/collections" 
                      element={
                        <MobileContainer>
                          <ProtectedRoute>
                            <Collections />
                          </ProtectedRoute>
                        </MobileContainer>
                      } 
                    />
                    <Route path="/shared/:token" element={<MobileContainer><SharedCollection /></MobileContainer>} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<MobileContainer><NotFound /></MobileContainer>} />
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
