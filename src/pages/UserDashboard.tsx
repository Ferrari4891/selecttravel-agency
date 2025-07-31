import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import heroImage from "@/assets/hero-members.jpg";

interface UserPreferences {
  wheelchair_access: boolean;
  extended_hours: boolean;
  gluten_free: boolean;
  low_noise: boolean;
  public_transport: boolean;
  pet_friendly: boolean;
  outdoor_seating: boolean;
  senior_discounts: boolean;
  online_booking: boolean;
  air_conditioned: boolean;
  preferred_language: string;
}

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    wheelchair_access: false,
    extended_hours: false,
    gluten_free: false,
    low_noise: false,
    public_transport: false,
    pet_friendly: false,
    outdoor_seating: false,
    senior_discounts: false,
    online_booking: false,
    air_conditioned: false,
    preferred_language: 'en'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        toast.error('Failed to load preferences');
        return;
      }

      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof UserPreferences, checked: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        });

      if (error) {
        console.error('Error saving preferences:', error);
        toast.error('Failed to save preferences');
        return;
      }

      toast.success('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative w-full h-96 mb-8">
        <div className="w-full h-full bg-background relative" style={{
          border: '8px solid white',
          boxShadow: '0 8px 12px -4px rgba(169, 169, 169, 0.4)'
        }}>
          <img src={heroImage} alt="Members Dashboard" className="w-full h-full object-cover" />
          
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4 md:text-9xl">My Preferences</h1>
              <p className="text-lg">Welcome back, {user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Manage Your Preferences</h2>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>

          <Card className="mb-8">
            <CardHeader className="bg-background">
              <CardTitle className="text-center border-b-2 border-black pb-2 text-3xl text-foreground font-extrabold">
                YOUR SAVED PREFERENCES
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg text-center mb-8 text-gray-700">
                Update your preferences below to personalize your restaurant recommendations.
              </p>
              
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Select your preferences:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="wheelchair_access" 
                      checked={preferences.wheelchair_access} 
                      onCheckedChange={checked => handlePreferenceChange('wheelchair_access', checked as boolean)} 
                    />
                    <label htmlFor="wheelchair_access" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Wheelchair Access
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="extended_hours" 
                      checked={preferences.extended_hours} 
                      onCheckedChange={checked => handlePreferenceChange('extended_hours', checked as boolean)} 
                    />
                    <label htmlFor="extended_hours" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Extended Open Hours
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="gluten_free" 
                      checked={preferences.gluten_free} 
                      onCheckedChange={checked => handlePreferenceChange('gluten_free', checked as boolean)} 
                    />
                    <label htmlFor="gluten_free" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Gluten Free Options
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="low_noise" 
                      checked={preferences.low_noise} 
                      onCheckedChange={checked => handlePreferenceChange('low_noise', checked as boolean)} 
                    />
                    <label htmlFor="low_noise" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Low Noise Environment
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="public_transport" 
                      checked={preferences.public_transport} 
                      onCheckedChange={checked => handlePreferenceChange('public_transport', checked as boolean)} 
                    />
                    <label htmlFor="public_transport" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Public Transport Access
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="pet_friendly" 
                      checked={preferences.pet_friendly} 
                      onCheckedChange={checked => handlePreferenceChange('pet_friendly', checked as boolean)} 
                    />
                    <label htmlFor="pet_friendly" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Pet Friendly Venues
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="outdoor_seating" 
                      checked={preferences.outdoor_seating} 
                      onCheckedChange={checked => handlePreferenceChange('outdoor_seating', checked as boolean)} 
                    />
                    <label htmlFor="outdoor_seating" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Outdoor Seating Available
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="senior_discounts" 
                      checked={preferences.senior_discounts} 
                      onCheckedChange={checked => handlePreferenceChange('senior_discounts', checked as boolean)} 
                    />
                    <label htmlFor="senior_discounts" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Senior Discounts Available
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="online_booking" 
                      checked={preferences.online_booking} 
                      onCheckedChange={checked => handlePreferenceChange('online_booking', checked as boolean)} 
                    />
                    <label htmlFor="online_booking" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Online Booking Available
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="air_conditioned" 
                      checked={preferences.air_conditioned} 
                      onCheckedChange={checked => handlePreferenceChange('air_conditioned', checked as boolean)} 
                    />
                    <label htmlFor="air_conditioned" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Air Conditioned
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium leading-none">Preferred Language:</span>
                      <LanguageSelector />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={handleSavePreferences}
                    disabled={saving}
                    className="px-8"
                  >
                    {saving ? 'SAVING...' : 'SAVE PREFERENCES'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserDashboard;