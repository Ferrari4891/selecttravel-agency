import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import VoiceInteraction from '@/components/VoiceInteraction';
import { EnhancedCityInput } from '@/components/EnhancedCityInput';
import { Star, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroEat from '@/assets/hero-eat.jpg';
import heroDrink from '@/assets/hero-drink.jpg';
import heroStay from '@/assets/hero-stay.jpg';
import heroPlay from '@/assets/hero-play.jpg';

const categories = [
  { value: 'eat', label: 'Eat' },
  { value: 'stay', label: 'Stay' },
  { value: 'drink', label: 'Drink' },
  { value: 'play', label: 'Play' },
  { value: 'shop', label: 'Shop' }
];

const resultOptions = [
  { value: '5', label: '5 Results' },
  { value: '10', label: '10 Results' },
  { value: '15', label: '15 Results' },
  { value: '20', label: '20 Results' },
  { value: '25', label: '25 Results' },
  { value: '30', label: '30 Results' },
  { value: '50', label: '50 Results' }
];

const GuideSelection = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedResults, setSelectedResults] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const carouselImages = [
    { src: heroEat, alt: "Eat" },
    { src: heroStay, alt: "Stay" },
    { src: heroDrink, alt: "Drink" },
    { src: heroPlay, alt: "Play" }
  ];

  const handleGetNow = async () => {
    if (!selectedCategory || !selectedCity || !selectedResults) {
      toast.error('Please select all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Found ${selectedResults} ${selectedCategory} options in ${selectedCity} with 3+ star ratings!`);
      console.log(`Searching for: ${selectedCategory} in ${selectedCity}, ${selectedResults} results with 3+ stars`);
      
      // Here you would typically navigate to results or update the UI with results
    } catch (error) {
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSearchComplete = (city: string, activity: string, resultCount: number) => {
    setSelectedCity(city);
    setSelectedCategory(activity);
    setSelectedResults(resultCount.toString());
    console.log(`Voice search completed: ${activity} in ${city}, ${resultCount} results`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Carousel Section */}
      <section className="py-8">
        <div className="relative overflow-hidden border-8 border-white shadow-[0_8px_16px_rgba(0,0,0,0.3)] bg-background aspect-[16/9] mb-8">
          <div className="absolute inset-0">
            <Carousel 
              className="w-full h-full"
              plugins={[
                Autoplay({
                  delay: 4000,
                })
              ]}
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="h-full -ml-0">
                {carouselImages.map((image, index) => (
                  <CarouselItem key={index} className="h-full pl-0 basis-full">
                    <div className="w-full h-full">
                      <img 
                        src={image.src} 
                        alt={image.alt} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="relative z-10 h-full flex items-center justify-center px-4">
            <div className="text-center">
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
                CHOOSE YOUR SMART GUIDE
              </h1>
              <p className="text-sm sm:text-xl text-white mb-4 max-w-3xl mx-auto">Find Expert Local Guides!</p>
              <p className="text-lg sm:text-2xl font-semibold text-white">www.smartguidebooks.com</p>
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Choose Your Smart Guide</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find expert local guides with 3+ star ratings to enhance your travel experience
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Search className="w-6 h-6" />
              Find Your Perfect Guide
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 1: Select Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-base font-semibold">
                1. Select Category
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="What do you want to do?" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: Select City */}
            <EnhancedCityInput
              value={selectedCity}
              onChange={setSelectedCity}
              placeholder="Enter or select a city"
            />

            {/* Step 3: Select Results */}
            <div className="space-y-2">
              <Label htmlFor="results" className="text-base font-semibold flex items-center gap-1">
                3. Select Results
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-normal text-muted-foreground">(3+ Star Minimum)</span>
              </Label>
              <Select value={selectedResults} onValueChange={setSelectedResults}>
                <SelectTrigger id="results">
                  <SelectValue placeholder="How many results?" />
                </SelectTrigger>
                <SelectContent>
                  {resultOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* GET NOW Button */}
            <Button 
              onClick={handleGetNow}
              disabled={isLoading || !selectedCategory || !selectedCity || !selectedResults}
              className="w-full h-12 text-lg font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </div>
              ) : (
                'GET NOW!'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Footer />
      <VoiceInteraction onSearchComplete={handleVoiceSearchComplete} />
    </div>
  );
};

export default GuideSelection;