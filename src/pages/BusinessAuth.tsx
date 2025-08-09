import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { BusinessProfile } from '@/components/business/BusinessProfile';
import { useToast } from '@/hooks/use-toast';
const BusinessAuth = () => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (user) {
      navigate('/business-dashboard');
    }
  }, [user, navigate]);
  const handleBusinessCreated = (business: any) => {
    toast({
      title: "Success",
      description: "Business profile created successfully! Please log in to access your dashboard."
    });
    // Don't auto-navigate since user needs to authenticate first
  };
  return <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">ADD YOUR BUSINESS</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create your comprehensive business profile and start connecting with travelers worldwide. 
              Showcase your establishment, manage your information, and grow your customer base.
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <BusinessProfile onBusinessCreated={handleBusinessCreated} />
          </div>
        </div>
      </div>
    </div>;
};
export default BusinessAuth;