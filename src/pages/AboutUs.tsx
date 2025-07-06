import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import heroAboutUs from "@/assets/hero-about-us.jpg";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img 
          src={heroAboutUs} 
          alt="About Us Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
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
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            About smartguidebooks.com
          </h2>
          <p className="text-muted-foreground text-lg">
            Your trusted companion for discovering exceptional dining experiences
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>What drives us every day</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                At smartguidebooks.com, we believe that great food brings people together. Our mission is to help you discover the most exceptional restaurants in any area, combining data from trusted sources like TripAdvisor, Yelp, and Google Reviews to give you the most comprehensive dining recommendations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Story</CardTitle>
              <CardDescription>How it all began</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <p Made by Seniors for Seniors! We don't want massive lists of choices when we travel we want value and to get value we understand the best source of truth is a variety of many people opinions. That's how we grade our curated lists by aggregating reviwers from three of the worlds leading review websites - Google Reviews, Yelp and Trip Advisor.</p>
            </CardContent></p>
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
                Our team consists of experienced food critics, travel writers, data analysts, and software developers who share a common passion for exceptional dining experiences. We work tirelessly to ensure that every recommendation meets our high standards for quality and authenticity.
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
    </div>
  );
};

export default AboutUs;