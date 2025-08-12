import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
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
import MemberDashboard from "./pages/MemberDashboard";
import JoinFree from "./pages/JoinFree";
import TVChannel from "./pages/TVChannel";
import BusinessDashboard from "./pages/BusinessDashboard";
import UserDashboard from "./pages/UserDashboard";
import Auth from "./pages/Auth";
import BusinessAuth from "./pages/BusinessAuth";
import Collections from "./pages/Collections";
import SharedCollection from "./pages/SharedCollection";
import { RSVP } from "./pages/RSVP";
import AdminDashboard from "./pages/AdminDashboard";
import BusinessCentre from "./pages/BusinessCentre";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <MobileContainer>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/how-to" element={<HowTo />} />
                <Route path="/advertise" element={<Advertise />} />
                <Route path="/roi" element={<ROI />} />
                <Route path="/toolbox" element={<Toolbox />} />
                <Route path="/visa-info" element={<VisaInfo />} />
                <Route path="/join-free" element={<JoinFree />} />
                <Route path="/tv-channel" element={<TVChannel />} />
                <Route path="/business-centre" element={<BusinessCentre />} />
                <Route path="/shared/:token" element={<SharedCollection />} />
                <Route path="/rsvp/:token" element={<RSVP />} />
                
                {/* Auth routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/business-auth" element={<BusinessAuth />} />
                
                {/* Protected routes requiring Supabase authentication */}
                <Route path="/dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
                <Route 
                  path="/business-dashboard" 
                  element={
                    <ProtectedRoute>
                      <BusinessDashboard />
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
                <Route 
                  path="/admin-dashboard" 
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </MobileContainer>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
