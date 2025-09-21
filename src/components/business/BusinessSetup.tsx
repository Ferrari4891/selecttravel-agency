import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/Navigation';
import { GiftCardSettings } from './GiftCardSettings';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const BusinessSetup = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [registrationData, setRegistrationData] = useState<any>(null);

  // Load registration data from localStorage or location state
  useEffect(() => {
    const tempData = localStorage.getItem('tempBusinessRegistration');
    const stateData = location.state;
    
    if (stateData) {
      setRegistrationData(stateData);
    } else if (tempData) {
      const parsed = JSON.parse(tempData);
      // Check if data is not too old (1 hour)
      if (Date.now() - parsed.timestamp < 3600000) {
        setRegistrationData(parsed);
      } else {
        localStorage.removeItem('tempBusinessRegistration');
        navigate('/business-register');
      }
    } else {
      navigate('/business-register');
    }
  }, [location.state, navigate]);

  // Redirect if already fully authenticated
  useEffect(() => {
    if (user && registrationData) {
      navigate('/business-dashboard');
    }
  }, [user, registrationData, navigate]);

  if (!registrationData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create business account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registrationData.email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/business-dashboard`,
          data: {
            business_name: registrationData.businessName,
            user_type: 'business'
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Create business profile in businesses table
        const { error: businessError } = await supabase
          .from('businesses')
          .insert({
            user_id: authData.user.id,
            business_name: registrationData.businessName,
            email: registrationData.email,
            business_type: 'Pending', // Will be updated when they complete the profile
            status: 'setup_required'
          });

        if (businessError) {
          console.error('Business creation error:', businessError);
          // Continue anyway - they can create business profile later
        }

        // Clean up temporary registration data
        localStorage.removeItem('tempBusinessRegistration');

        toast({
          title: "Account Created Successfully!",
          description: "You can now access your business dashboard!",
        });

        navigate('/business-dashboard');
      }

    } catch (error: any) {
      console.error('Setup error:', error);
      toast({
        title: "Setup Failed",
        description: error.message || "An error occurred during setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Complete Business Setup</CardTitle>
              <CardDescription>
                Set up your password for "{registrationData.businessName}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business-email">Business Email</Label>
                  <Input
                    id="business-email"
                    type="email"
                    value={registrationData.email}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Create Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Complete Setup'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessSetup;