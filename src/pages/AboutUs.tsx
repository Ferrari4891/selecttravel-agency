import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import AudioPlayer from "@/components/AudioPlayer";
import heroAboutUs from "@/assets/hero-about-us.jpg";
import { useIsMobile } from "@/hooks/use-mobile";

const AboutUs = () => {
  const isMobile = useIsMobile();
  
  return <div className="min-h-screen bg-background">
      {isMobile ? (
        <div className="relative min-h-screen">
          {/* Full-screen hero image for mobile */}
          <div 
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroAboutUs})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Overlaid Navigation for mobile */}
          <div className="relative z-50">
            <Navigation />
          </div>
          
          {/* Hero title overlay for mobile */}
          <div className="relative z-10 flex items-center justify-center h-96">
            <h1 className="text-4xl font-bold text-white text-center">
              ABOUT US
            </h1>
          </div>
          
          {/* Content area for mobile with white background */}
          <div className="relative z-10 bg-white min-h-screen px-4 py-8">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <Link to="/">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>

              <div className="text-center space-y-4">
                <h2 className="font-bold text-black text-2xl">
                  About Smart Guides
                </h2>
                <p className="text-base font-medium text-black">Get what you want or need when you travel in 60 seconds or less with NO typing!!</p>
              </div>

              <div className="grid gap-6">
                <Card className="rounded-none flex flex-col h-full">
                  <CardHeader className="bg-black">
                    <CardTitle className="text-xl text-white font-bold">Our Mission</CardTitle>
                    <CardDescription className="text-base font-semibold text-white">Why we enjoy making Smart Guides</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 justify-between space-y-4">
                    <p className="text-muted-foreground">
      At smartguidebooks.com , we believe that your time is valuable and when you travel should be stress free. Our mission is to help you discover top rated businesses in a variety of categories worldwide.  By combining data from trusted sources like TripAdvisor, Yelp, and Google Reviews to give you the top 20 recommendations in a wide range of cities..</p>
                    <div className="mt-auto">
                      <AudioPlayer src="our-mission.wav" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-none flex flex-col h-full">
                  <CardHeader className="bg-black">
                    <CardTitle className="text-xl text-white font-bold">Our Story</CardTitle>
                    <CardDescription className="text-base font-semibold text-white">Why we created Smart Guides</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 justify-between space-y-4">
                    <p className="text-muted-foreground">
      Founded by seniors for seniors, smartguidebooks.com was born from the frustration of spending hours researching credible businesses when traveling. We wanted to create a simple, reliable way to find the best rated businesses in any location, backed by real reviews from real people and comprehensive data.</p>
                    <div className="mt-auto">
                      <AudioPlayer src="our-story.wav" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-none flex flex-col h-full">
                  <CardHeader className="bg-black">
                    <CardTitle className="text-xl text-white font-bold">The 60 Second Rule!</CardTitle>
                    <CardDescription className="text-base font-semibold text-white">With NO typing to get what you want.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 justify-between space-y-4">
                    <ol className="space-y-2 text-muted-foreground">
                      <li>• Data from multiple trusted review platforms</li>
                      <li>• lists of top 20 businesses in cities worldwide.</li>
                      <li>• Get a business listing in 60 seconds or less!</li>
                      <li>• Easy-to-use interface with intuitive navigation</li>
                      <li>• Daily updates to ensure accuracy and relevance</li>
                    </ol>
                    <div className="mt-auto">
                      <AudioPlayer src="60-second-rule.wav" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-none flex flex-col h-full">
                  <CardHeader className="bg-black">
                    <CardTitle className="text-xl text-white font-bold">Our Team</CardTitle>
                    <CardDescription className="text-base font-semibold text-white">Keeping it fast & simple</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 justify-between space-y-4">
                    <p className="text-muted-foreground">
      Our team consists senior experienced normal people who understand the simple principle of just give me what I asked for and satisfy my requirement that I can trust the source of the information you provide. Make it fast and really easy to use and don't give me too many choices I just want the best and authentic choices..</p>
                    <div className="mt-auto">
                      <AudioPlayer src="our-team.wav" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-none">
                  <CardHeader>
                    <CardTitle className="text-center">Get in Touch</CardTitle>
                    <CardDescription className="text-center">We'd love to hear from you</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">Have questions, suggestions, or want to share your dining experiences? We're always eager to connect with t.</p>
                    <AudioPlayer src="get-in-touch.wav" />
                    <div className="flex justify-center gap-4">
                      <Button variant="outline" className="rounded-none">Contact Us</Button>
                      <Button variant="outline" className="rounded-none">Follow Us</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-4xl mx-auto p-6">
            <Navigation />
          </div>
          
          {/* Hero Section */}
          <div className="relative h-64 md:h-80 overflow-hidden border-8 border-white rounded-none shadow-[0_8px_12px_-4px_rgba(169,169,169,0.4),_-6px_8px_12px_-4px_rgba(169,169,169,0.3),_6px_8px_12px_-4px_rgba(169,169,169,0.3)]">
            <img src={heroAboutUs} alt="About Us Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-4xl font-bold text-white md:text-9xl">
                ABOUT US
              </h1>
            </div>
          </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8 bg-white">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-4">
          <h2 className="font-bold text-black text-3xl md:text-6xl">
            About Smart Guides
          </h2>
          <p className="text-lg font-medium text-black">Get what you want or need when you travel in 60 seconds or less with NO typing!!</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-none flex flex-col h-full">
            <CardHeader className="bg-black">
              <CardTitle className="text-3xl text-white font-bold">Our Mission</CardTitle>
              <CardDescription className="text-lg font-semibold text-white">Why we enjoy making Smart Guides</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 justify-between space-y-4">
              <p className="text-muted-foreground">

At smartguidebooks.com , we believe that your time is valuable and when you travel should be stress free. Our mission is to help you discover top rated businesses in a variety of categories worldwide.  By combining data from trusted sources like TripAdvisor, Yelp, and Google Reviews to give you the top 20 recommendations in a wide range of cities..</p>
              <div className="mt-auto">
                <AudioPlayer src="our-mission.wav" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none flex flex-col h-full">
            <CardHeader className="bg-black">
              <CardTitle className="text-3xl text-white font-bold">Our Story</CardTitle>
              <CardDescription className="text-lg font-semibold text-white">Why we created Smart Guides</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 justify-between space-y-4">
              <p className="text-muted-foreground">

Founded by seniors for seniors, smartguidebooks.com was born from the frustration of spending hours researching credible businesses when traveling. We wanted to create a simple, reliable way to find the best rated businesses in any location, backed by real reviews from real people and comprehensive data.</p>
              <div className="mt-auto">
                <AudioPlayer src="our-story.wav" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none flex flex-col h-full">
            <CardHeader className="bg-black">
              <CardTitle className="text-3xl text-white font-bold">The 60 Second Rule!</CardTitle>
              <CardDescription className="text-lg font-semibold text-white">With NO typing to get what you want.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 justify-between space-y-4">
              <ol className="space-y-2 text-muted-foreground">
                <li>• Data from multiple trusted review platforms</li>
                <li>• lists of top 20 businesses in cities worldwide.</li>
                <li>• Get a business listing in 60 seconds or less!</li>
                <li>• Easy-to-use interface with intuitive navigation</li>
                <li>• Daily updates to ensure accuracy and relevance</li>
              </ol>
              <div className="mt-auto">
                <AudioPlayer src="60-second-rule.wav" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none flex flex-col h-full">
            <CardHeader className="bg-black">
              <CardTitle className="text-3xl text-white font-bold">Our Team</CardTitle>
              <CardDescription className="text-lg font-semibold text-white">Keeping it fast & simple</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 justify-between space-y-4">
              <p className="text-muted-foreground">

Our team consists senior experienced normal people who understand the simple principle of just give me what I asked for and satisfy my requirement that I can trust the source of the information you provide. Make it fast and really easy to use and don't give me too many choices I just want the best and authentic choices..</p>
              <div className="mt-auto">
                <AudioPlayer src="our-team.wav" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-center">Get in Touch</CardTitle>
            <CardDescription className="text-center">We'd love to hear from you</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">Have questions, suggestions, or want to share your dining experiences? We're always eager to connect with t.</p>
            <AudioPlayer src="get-in-touch.wav" />
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="rounded-none">Contact Us</Button>
              <Button variant="outline" className="rounded-none">Follow Us</Button>
            </div>
          </CardContent>
        </Card>
          </div>
          
          <Footer />
        </>
      )}
    </div>;
};
export default AboutUs;