import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Footer from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { LanguageSelector } from "@/components/LanguageSelector";

const JoinFree = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    gender: "",
    age: "",
    country: ""
  });

  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission here
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 shadow-lg">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Join Free</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                  Gender
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="13"
                  max="120"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                  Country
                </Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="fr">France</SelectItem>
                    <SelectItem value="es">Spain</SelectItem>
                    <SelectItem value="it">Italy</SelectItem>
                    <SelectItem value="jp">Japan</SelectItem>
                    <SelectItem value="kr">South Korea</SelectItem>
                    <SelectItem value="cn">China</SelectItem>
                    <SelectItem value="in">India</SelectItem>
                    <SelectItem value="br">Brazil</SelectItem>
                    <SelectItem value="mx">Mexico</SelectItem>
                    <SelectItem value="ar">Argentina</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-blue-400 hover:bg-blue-500 text-white font-medium py-3 px-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  JOIN FREE!
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer 
        onLanguageClick={() => setShowLanguageSelector(true)}
      />
      
      {showLanguageSelector && (
        <LanguageSelector onClose={() => setShowLanguageSelector(false)} />
      )}
    </div>
  );
};

export default JoinFree;