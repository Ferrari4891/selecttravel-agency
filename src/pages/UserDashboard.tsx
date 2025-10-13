import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyInvitations } from "@/components/MyInvitations";
import { MemberCard } from "@/components/MemberCard";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import MobileContainer from "@/components/MobileContainer";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
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
  const { showLanguagePopup } = useLanguage();
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
    <MobileContainer>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Hero Section - Mobile Optimized */}
        <div className="relative w-full h-48 md:h-64 mb-4">
          <img 
            src={heroImage} 
            alt="Members Dashboard" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">My Dashboard</h1>
              <p className="text-sm md:text-lg">Welcome back</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 pb-8 space-y-4">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>

          <Tabs defaultValue="card" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="card" className="text-sm md:text-base py-2">
                My Card
              </TabsTrigger>
              <TabsTrigger value="preferences" className="text-sm md:text-base py-2">
                Preferences
              </TabsTrigger>
              <TabsTrigger value="invitations" className="text-sm md:text-base py-2">
                Invitations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="card" className="space-y-4">
              <MemberCard />
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader className="bg-background p-4">
                  <CardTitle className="text-center border-b border-border pb-2 text-xl md:text-2xl font-bold">
                    Your Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm md:text-base text-center mb-6 text-muted-foreground">
                    Customize your restaurant recommendations
                  </p>
                  
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                        <Checkbox 
                          id="wheelchair_access" 
                          checked={preferences.wheelchair_access} 
                          onCheckedChange={checked => handlePreferenceChange('wheelchair_access', checked as boolean)}
                          className="h-5 w-5"
                        />
                        <label htmlFor="wheelchair_access" className="text-sm md:text-base font-medium cursor-pointer flex-1">
                          ♿ Wheelchair Access
                        </label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                        <Checkbox 
                          id="senior_discounts" 
                          checked={preferences.senior_discounts} 
                          onCheckedChange={checked => handlePreferenceChange('senior_discounts', checked as boolean)}
                          className="h-5 w-5"
                        />
                        <label htmlFor="senior_discounts" className="text-sm md:text-base font-medium cursor-pointer flex-1">
                          💰 Senior Discounts
                        </label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                        <Checkbox 
                          id="extended_hours" 
                          checked={preferences.extended_hours} 
                          onCheckedChange={checked => handlePreferenceChange('extended_hours', checked as boolean)}
                          className="h-5 w-5"
                        />
                        <label htmlFor="extended_hours" className="text-sm md:text-base font-medium cursor-pointer flex-1">
                          🕐 Extended Hours
                        </label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                        <Checkbox 
                          id="low_noise" 
                          checked={preferences.low_noise} 
                          onCheckedChange={checked => handlePreferenceChange('low_noise', checked as boolean)}
                          className="h-5 w-5"
                        />
                        <label htmlFor="low_noise" className="text-sm md:text-base font-medium cursor-pointer flex-1">
                          🔇 Quiet Environment
                        </label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                        <Checkbox 
                          id="public_transport" 
                          checked={preferences.public_transport} 
                          onCheckedChange={checked => handlePreferenceChange('public_transport', checked as boolean)}
                          className="h-5 w-5"
                        />
                        <label htmlFor="public_transport" className="text-sm md:text-base font-medium cursor-pointer flex-1">
                          🚌 Public Transport
                        </label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                        <Checkbox 
                          id="air_conditioned" 
                          checked={preferences.air_conditioned} 
                          onCheckedChange={checked => handlePreferenceChange('air_conditioned', checked as boolean)}
                          className="h-5 w-5"
                        />
                        <label htmlFor="air_conditioned" className="text-sm md:text-base font-medium cursor-pointer flex-1">
                          ❄️ Air Conditioned
                        </label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                        <Checkbox 
                          id="outdoor_seating" 
                          checked={preferences.outdoor_seating} 
                          onCheckedChange={checked => handlePreferenceChange('outdoor_seating', checked as boolean)}
                          className="h-5 w-5"
                        />
                        <label htmlFor="outdoor_seating" className="text-sm md:text-base font-medium cursor-pointer flex-1">
                          🌳 Outdoor Seating
                        </label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                        <Checkbox 
                          id="gluten_free" 
                          checked={preferences.gluten_free} 
                          onCheckedChange={checked => handlePreferenceChange('gluten_free', checked as boolean)}
                          className="h-5 w-5"
                        />
                        <label htmlFor="gluten_free" className="text-sm md:text-base font-medium cursor-pointer flex-1">
                          🌾 Gluten-Free Options
                        </label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                        <Checkbox 
                          id="pet_friendly" 
                          checked={preferences.pet_friendly} 
                          onCheckedChange={checked => handlePreferenceChange('pet_friendly', checked as boolean)}
                          className="h-5 w-5"
                        />
                        <label htmlFor="pet_friendly" className="text-sm md:text-base font-medium cursor-pointer flex-1">
                          🐕 Pet-Friendly
                        </label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 border rounded bg-muted/30">
                        <Checkbox 
                          id="online_booking" 
                          checked={preferences.online_booking} 
                          onCheckedChange={checked => handlePreferenceChange('online_booking', checked as boolean)}
                          className="h-5 w-5"
                        />
                        <label htmlFor="online_booking" className="text-sm md:text-base font-medium cursor-pointer flex-1">
                          💻 Online Booking
                        </label>
                      </div>

                      <div className="p-3 border rounded bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm md:text-base font-medium">🌍 Language</span>
                          <Button variant="outline" size="sm" onClick={showLanguagePopup}>
                            Change
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <Button 
                        onClick={handleSavePreferences}
                        disabled={saving}
                        className="w-full md:w-auto px-8 py-3 text-sm md:text-base"
                      >
                        {saving ? 'SAVING...' : 'SAVE PREFERENCES'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invitations" className="space-y-4">
              <MyInvitations />
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
      </div>
    </MobileContainer>
  );
};

export default UserDashboard;