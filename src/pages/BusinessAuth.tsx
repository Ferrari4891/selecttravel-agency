import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import ModernAuth from '@/components/ModernAuth';

const BusinessAuth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/business-dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Business Owner Sign Up</h1>
            <p className="text-muted-foreground">Join our business network and start showcasing your establishment to travelers worldwide.</p>
          </div>
          <ModernAuth mode="signup" />
        </div>
      </div>
    </div>
  );
};

export default BusinessAuth;