import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TranslationProvider } from "@/components/TranslationProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import GuideSelection from "./pages/GuideSelection";
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
import Auth from "./pages/Auth";
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
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about-us" element={
                <ProtectedRoute>
                  <AboutUs />
                </ProtectedRoute>
              } />
              <Route path="/how-to" element={
                <ProtectedRoute>
                  <HowTo />
                </ProtectedRoute>
              } />
              <Route path="/advertise" element={
                <ProtectedRoute>
                  <Advertise />
                </ProtectedRoute>
              } />
              <Route path="/roi" element={
                <ProtectedRoute>
                  <ROI />
                </ProtectedRoute>
              } />
              <Route path="/toolbox" element={
                <ProtectedRoute>
                  <Toolbox />
                </ProtectedRoute>
              } />
              <Route path="/visa-info" element={
                <ProtectedRoute>
                  <VisaInfo />
                </ProtectedRoute>
              } />
              <Route path="/members" element={
                <ProtectedRoute>
                  <Members />
                </ProtectedRoute>
              } />
              <Route path="/join-free" element={
                <ProtectedRoute>
                  <JoinFree />
                </ProtectedRoute>
              } />
              <Route path="/tv-channel" element={
                <ProtectedRoute>
                  <TVChannel />
                </ProtectedRoute>
              } />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TranslationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
