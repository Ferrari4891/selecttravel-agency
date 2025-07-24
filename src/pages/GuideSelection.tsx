import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import { MapPin, Star, Clock, Users } from 'lucide-react';

const guides = [
  {
    id: 1,
    name: "Alex Thompson",
    location: "New York City",
    rating: 4.9,
    reviews: 234,
    specialties: ["Architecture", "Food Tours", "Nightlife"],
    image: "/placeholder-image-coming-soon.jpg",
    price: "$45/hour",
    availability: "Available Today"
  },
  {
    id: 2,
    name: "Maria Garcia",
    location: "Barcelona",
    rating: 4.8,
    reviews: 189,
    specialties: ["Art & Culture", "History", "Local Markets"],
    image: "/placeholder-image-coming-soon.jpg",
    price: "$35/hour",
    availability: "Available Tomorrow"
  },
  {
    id: 3,
    name: "David Chen",
    location: "Tokyo",
    rating: 5.0,
    reviews: 156,
    specialties: ["Traditional Culture", "Technology", "Cuisine"],
    image: "/placeholder-image-coming-soon.jpg",
    price: "$50/hour",
    availability: "Available Today"
  },
  {
    id: 4,
    name: "Sophie Martin",
    location: "Paris",
    rating: 4.7,
    reviews: 201,
    specialties: ["Art Museums", "Fashion", "Wine Tasting"],
    image: "/placeholder-image-coming-soon.jpg",
    price: "$40/hour",
    availability: "Available Today"
  }
];

const GuideSelection = () => {
  const handleSelectGuide = (guideId: number) => {
    console.log(`Selected guide with ID: ${guideId}`);
    // Add guide selection logic here
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Choose Your Smart Guide</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select from our network of expert local guides to enhance your travel experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {guides.map((guide) => (
            <Card key={guide.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{guide.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {guide.location}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-semibold">{guide.rating}</span>
                      <span className="text-sm text-muted-foreground ml-1">({guide.reviews})</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Specialties:</h4>
                    <div className="flex flex-wrap gap-2">
                      {guide.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      {guide.availability}
                    </div>
                    <div className="font-semibold text-primary">
                      {guide.price}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleSelectGuide(guide.id)}
                    className="w-full"
                  >
                    Select This Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Can't find the perfect guide? We'll help you find one!
          </p>
          <Button variant="outline">
            Request Custom Guide
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GuideSelection;