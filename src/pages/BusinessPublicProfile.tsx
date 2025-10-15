import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, Phone, Mail, Globe, Facebook, Instagram, 
  Twitter, Linkedin, Clock, ExternalLink, Ticket, Gift
} from "lucide-react";

interface Business {
  id: string;
  business_name: string;
  business_type: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  image_1_url: string | null;
  image_2_url: string | null;
  image_3_url: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
  business_hours: any;
  subscription_tier: string | null;
}

export default function BusinessPublicProfile() {
  const { id } = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [voucherCount, setVoucherCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadBusiness();
      loadVoucherCount();
    }
  }, [id]);

  const loadBusiness = async () => {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", id)
        .eq("status", "approved")
        .single();

      if (error) throw error;
      
      setBusiness(data);
      document.title = `${data.business_name} | 55plus`;
    } catch (error) {
      console.error("Error loading business:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadVoucherCount = async () => {
    try {
      const { count, error } = await supabase
        .from("business_vouchers")
        .select("*", { count: 'exact', head: true })
        .eq("business_id", id)
        .eq("is_active", true)
        .gt("end_date", new Date().toISOString());

      if (error) throw error;
      setVoucherCount(count || 0);
    } catch (error) {
      console.error("Error loading voucher count:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-lg">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
          <Link to="/vouchers">
            <Button>Browse Vouchers</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const fullAddress = [
    business.address,
    business.city,
    business.state,
    business.country,
    business.postal_code
  ].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header with Logo */}
        <div className="mb-6">
          <div className="flex items-start gap-4 mb-4">
            {business.logo_url && (
              <img 
                src={business.logo_url} 
                alt={business.business_name}
                className="w-24 h-24 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{business.business_name}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge>{business.business_type}</Badge>
                {business.subscription_tier && (
                  <Badge variant="secondary">{business.subscription_tier}</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Vouchers CTA */}
          {voucherCount > 0 && (
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gift className="h-8 w-8 text-emerald-600" />
                    <div>
                      <div className="font-bold text-lg">
                        {voucherCount} Active {voucherCount === 1 ? 'Voucher' : 'Vouchers'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Special discounts available now
                      </div>
                    </div>
                  </div>
                  <Link to={`/business/${business.id}/vouchers`}>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Ticket className="h-4 w-4 mr-2" />
                      View Vouchers
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {(business.image_1_url || business.image_2_url || business.image_3_url) && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {business.image_1_url && (
                      <img src={business.image_1_url} alt="Business" className="w-full h-48 object-cover rounded" />
                    )}
                    {business.image_2_url && (
                      <img src={business.image_2_url} alt="Business" className="w-full h-48 object-cover rounded" />
                    )}
                    {business.image_3_url && (
                      <img src={business.image_3_url} alt="Business" className="w-full h-48 object-cover rounded" />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {business.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{business.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Business Hours */}
            {business.business_hours && Object.keys(business.business_hours).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Hours of Operation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(business.business_hours).map(([day, hours]: [string, any]) => (
                      <div key={day} className="flex justify-between py-2 border-b last:border-0">
                        <span className="font-medium capitalize">{day}</span>
                        <span className="text-muted-foreground">
                          {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {fullAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{fullAddress}</span>
                  </div>
                )}
                
                {business.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <a href={`tel:${business.phone}`} className="text-sm hover:underline">
                      {business.phone}
                    </a>
                  </div>
                )}
                
                {business.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${business.email}`} className="text-sm hover:underline">
                      {business.email}
                    </a>
                  </div>
                )}
                
                {business.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <a 
                      href={business.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm hover:underline flex items-center gap-1"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Media */}
            {(business.facebook || business.instagram || business.twitter || business.linkedin) && (
              <Card>
                <CardHeader>
                  <CardTitle>Follow Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {business.facebook && (
                    <a 
                      href={business.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:text-primary"
                    >
                      <Facebook className="h-5 w-5" />
                      <span className="text-sm">Facebook</span>
                    </a>
                  )}
                  
                  {business.instagram && (
                    <a 
                      href={business.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:text-primary"
                    >
                      <Instagram className="h-5 w-5" />
                      <span className="text-sm">Instagram</span>
                    </a>
                  )}
                  
                  {business.twitter && (
                    <a 
                      href={business.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:text-primary"
                    >
                      <Twitter className="h-5 w-5" />
                      <span className="text-sm">Twitter</span>
                    </a>
                  )}
                  
                  {business.linkedin && (
                    <a 
                      href={business.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:text-primary"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span className="text-sm">LinkedIn</span>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
