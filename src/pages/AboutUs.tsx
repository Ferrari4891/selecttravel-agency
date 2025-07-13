import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import heroAboutUs from "@/assets/hero-about-us.jpg";
const AboutUs = () => {
  return <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <Navigation />
      </div>
      
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden border-8 border-white rounded-none shadow-[0_8px_12px_-4px_rgba(169,169,169,0.4),_-6px_8px_12px_-4px_rgba(169,169,169,0.3),_6px_8px_12px_-4px_rgba(169,169,169,0.3)]">
        <img src={heroAboutUs} alt="About Us Hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            ABOUT US
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-4">
          <h2 className="font-bold bg-gradient-primary bg-clip-text text-sky-500 text-6xl">
            About smartguides.live
          </h2>
          <p className="text-lg font-medium text-blue-400">
            Get what you want or need when you travel!!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-sky-400">Our Mission</CardTitle>
              <CardDescription>What drives us every day</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">At smartguides.live , we believe that your time is valuable and when you travel shoud be stress free. Our mission is to help you discover the most exceptional restaurants in any area, combining data from trusted sources like TripAdvisor, Yelp, and Google Reviews to give you the most comprehensive dining recommendations.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-sky-400">Our Story</CardTitle>
              <CardDescription>How it all began</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Founded by seniors for seniors, smartguides.live was born from the frustration of spending hours researching restaurants when traveling. We wanted to create a simple, reliable way to find the top dining spots in any location, backed by real reviews and comprehensive data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What Makes Us Different</CardTitle>
              <CardDescription>Our unique approach</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Comprehensive data from multiple trusted review platforms</li>
                <li>• Curated lists of the top 40 restaurants in each area</li>
                <li>• Complete contact information and social media links</li>
                <li>• Easy-to-use interface with intuitive navigation</li>
                <li>• Regular updates to ensure accuracy and relevance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Team</CardTitle>
              <CardDescription>The people behind the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our team consists senior experienced normal people who understand te simple principe of just give me what I asked for and satisfy my requirement that I can trust the source of the infomation you provide. Make it fast and really easy to use and don't give me too many choices I just want the best and authentic choices..
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Get in Touch</CardTitle>
            <CardDescription className="text-center">We'd love to hear from you</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Have questions, suggestions, or want to share your dining experiences? 
              We're always eager to connect with fellow food enthusiasts.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline">Contact Us</Button>
              <Button variant="outline">Follow Us</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>;
};
export default AboutUs;