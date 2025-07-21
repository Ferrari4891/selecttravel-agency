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
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/how-to" element={<HowTo />} />
              <Route path="/advertise" element={<Advertise />} />
              <Route path="/roi" element={<ROI />} />
              <Route path="/toolbox" element={<Toolbox />} />
              <Route path="/visa-info" element={<VisaInfo />} />
              <Route path="/members" element={<Members />} />
              <Route path="/join-free" element={<JoinFree />} />
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
