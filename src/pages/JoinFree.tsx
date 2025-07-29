import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { RestaurantDiscoveryForm } from "@/components/RestaurantDiscoveryForm";
import { MobileRestaurantForm } from "@/components/MobileRestaurantForm";
import { useIsMobile } from "@/hooks/use-mobile";

const JoinFree = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      navigate('/user-dashboard');
    }
  }, [user, navigate]);

  if (isMobile) {
    return <MobileRestaurantForm />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <RestaurantDiscoveryForm />
      <Footer />
    </div>
  );
};
export default JoinFree;