import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import ModernAuth from "@/components/ModernAuth";
import { useAuth } from "@/contexts/AuthContext";
const JoinFree = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/user-dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ModernAuth mode="signup" />
      <Footer />
    </div>
  );
};
export default JoinFree;