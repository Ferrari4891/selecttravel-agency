import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, MapPin, Clock, Phone, Mail, Star, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-business-centre.jpg";
const BusinessCentre = () => {
  const services = [{
    icon: <Building2 className="h-8 w-8" />,
    title: "Professional Office Spaces",
    description: "Fully equipped offices and meeting rooms available for rent"
  }, {
    icon: <Users className="h-8 w-8" />,
    title: "Virtual Office Solutions",
    description: "Professional business address and mail handling services"
  }, {
    icon: <Phone className="h-8 w-8" />,
    title: "AGENCY",
    description: "Receptionist, administrative, and secretarial support"
  }];
  const amenities = ["High-speed Wi-Fi", "24/7 Access", "Reception Services", "Meeting Rooms", "Video Conferencing", "Printing & Scanning", "Coffee & Refreshments", "Parking Available"];
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url(${heroImage})`
      }} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Business Centre</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            We provide a wide range of rescources to help our business customers.
          </p>
          <Button size="lg" className="bg-white text-black hover:bg-white/90">
            DOWNLOAD BROCHURE <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Services Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive business solutions designed to help your company thrive
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            {services.map((service, index) => <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>)}
          </div>
        </section>

        {/* Amenities Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">AGENT RESCOURCES</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for a productive work environment
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {amenities.map((amenity, index) => <Badge key={index} variant="outline" className="p-3 text-center justify-center rounded-none">
                {amenity}
              </Badge>)}
          </div>
        </section>

        {/* Location & Contact Section */}
        <section className="grid grid-cols-1 gap-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Address</h4>
                <p className="text-muted-foreground">
                  123 Business District<br />
                  Downtown Core, City 12345
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Business Hours
                </h4>
                <div className="text-muted-foreground space-y-1">
                  <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                  <p>Saturday: 9:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-muted-foreground mx-0 py-0">when you apply to become an agent </p>
                </div>
              </div>
              <div className="pt-4">
                <Button className="w-full">
                  DOWNLOAD BROCHURE
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-muted rounded-lg p-12">
          <div className="flex justify-center mb-4">
            <Star className="h-8 w-8 text-yellow-500 fill-current" />
            <Star className="h-8 w-8 text-yellow-500 fill-current" />
            <Star className="h-8 w-8 text-yellow-500 fill-current" />
            <Star className="h-8 w-8 text-yellow-500 fill-current" />
            <Star className="h-8 w-8 text-yellow-500 fill-current" />
          </div>
          <h2 className="text-3xl font-bold mb-4">BECOME AN AGENT </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of successful businesses who have made our centre their professional home
          </p>
          <div className="flex flex-col gap-4 justify-center">
            <Button size="lg">
              Book Your Space Today
            </Button>
            <Button variant="outline" size="lg">
              Download Brochure
            </Button>
          </div>
        </section>
      </div>
    </div>;
};
export default BusinessCentre;