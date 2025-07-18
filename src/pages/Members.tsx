import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-members.jpg";
const Members = () => {
  const [preferences, setPreferences] = useState({
    wheelchairAccess: false,
    openHours: false,
    glutenFree: false,
    lowNoise: false,
    publicTransport: false,
    preference1: false,
    preference2: false,
    preference3: false
  });
  const handlePreferenceChange = (key: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: checked
    }));
  };
  return <div className="min-h-screen bg-blue-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative w-full h-96 mb-8">
        <div className="w-full h-full bg-cover bg-center relative" style={{
        backgroundImage: `url(${heroImage})`,
        border: '8px solid white',
        boxShadow: '0 8px 12px -4px rgba(169, 169, 169, 0.4)'
      }}>
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-white text-4xl font-bold text-center md:text-9xl">
              Members
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="bg-blue-200">
              <CardTitle className="text-center border-b-2 border-black pb-2 text-3xl text-blue-400 font-extrabold">GET THE BEST PLACES TO EAT DRINK STAY & SHOP!</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg text-center mb-8 text-gray-700">
                Getting the best places to eat, drink, stay and shop is absolutely free! 
                Help us personalize your experience by selecting your preferences below.
              </p>
              
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Please tick any of the checkboxes below to record your preferences:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="wheelchairAccess" checked={preferences.wheelchairAccess} onCheckedChange={checked => handlePreferenceChange('wheelchairAccess', checked as boolean)} />
                    <label htmlFor="wheelchairAccess" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Wheelchair Access
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox id="openHours" checked={preferences.openHours} onCheckedChange={checked => handlePreferenceChange('openHours', checked as boolean)} />
                    <label htmlFor="openHours" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Extended Open Hours
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox id="glutenFree" checked={preferences.glutenFree} onCheckedChange={checked => handlePreferenceChange('glutenFree', checked as boolean)} />
                    <label htmlFor="glutenFree" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Gluten Free Options
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox id="lowNoise" checked={preferences.lowNoise} onCheckedChange={checked => handlePreferenceChange('lowNoise', checked as boolean)} />
                    <label htmlFor="lowNoise" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Low Noise Environment
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox id="publicTransport" checked={preferences.publicTransport} onCheckedChange={checked => handlePreferenceChange('publicTransport', checked as boolean)} />
                    <label htmlFor="publicTransport" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Public Transport Access
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox id="preference1" checked={preferences.preference1} onCheckedChange={checked => handlePreferenceChange('preference1', checked as boolean)} />
                    <label htmlFor="preference1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Pet Friendly Venues
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox id="preference2" checked={preferences.preference2} onCheckedChange={checked => handlePreferenceChange('preference2', checked as boolean)} />
                    <label htmlFor="preference2" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Outdoor Seating Available
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox id="preference3" checked={preferences.preference3} onCheckedChange={checked => handlePreferenceChange('preference3', checked as boolean)} />
                    <label htmlFor="preference3" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Senior Discounts Available
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-center mt-8">
                  <button className="bg-primary hover:bg-primary/90 h-10 px-8 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-blue-400">
                    SAVE PREFERENCES
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>;
};
export default Members;