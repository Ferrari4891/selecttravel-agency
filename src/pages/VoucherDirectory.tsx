import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Percent, DollarSign, Gift, MapPin, Search, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BusinessWithVouchers {
  id: string;
  business_name: string;
  city: string;
  country: string;
  business_type: string;
  logo_url: string | null;
  voucher_count: number;
  active_vouchers: Array<{
    id: string;
    title: string;
    voucher_type: string;
    discount_value: number;
    end_date: string;
  }>;
}

export default function VoucherDirectory() {
  const [businesses, setBusinesses] = useState<BusinessWithVouchers[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessWithVouchers[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [cities, setCities] = useState<string[]>([]);
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Voucher Directory | 55plus";
    loadBusinessesWithVouchers();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [searchTerm, selectedCity, selectedType, businesses]);

  const loadBusinessesWithVouchers = async () => {
    try {
      // Get all approved businesses with active vouchers
      const { data: bizData, error: bizError } = await supabase
        .from("businesses")
        .select(`
          id,
          business_name,
          city,
          country,
          business_type,
          logo_url
        `)
        .eq("status", "approved");

      if (bizError) throw bizError;

      // Get all active vouchers
      const { data: voucherData, error: voucherError } = await supabase
        .from("business_vouchers")
        .select("id, business_id, title, voucher_type, discount_value, end_date")
        .eq("is_active", true)
        .gt("end_date", new Date().toISOString());

      if (voucherError) throw voucherError;

      // Combine data
      const businessesWithVouchers = (bizData || [])
        .map(biz => {
          const vouchers = (voucherData || []).filter(v => v.business_id === biz.id);
          return {
            ...biz,
            voucher_count: vouchers.length,
            active_vouchers: vouchers
          };
        })
        .filter(biz => biz.voucher_count > 0);

      setBusinesses(businessesWithVouchers);

      // Extract unique cities and types for filters
      const uniqueCities = [...new Set(businessesWithVouchers.map(b => b.city).filter(Boolean))];
      const uniqueTypes = [...new Set(businessesWithVouchers.map(b => b.business_type).filter(Boolean))];
      setCities(uniqueCities.sort());
      setBusinessTypes(uniqueTypes.sort());
    } catch (error) {
      console.error("Error loading businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBusinesses = () => {
    let filtered = businesses;

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCity !== "all") {
      filtered = filtered.filter(b => b.city === selectedCity);
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(b => b.business_type === selectedType);
    }

    setFilteredBusinesses(filtered);
  };

  const getVoucherIcon = (type: string) => {
    switch (type) {
      case "percentage_discount": return <Percent className="h-4 w-4" />;
      case "fixed_amount": return <DollarSign className="h-4 w-4" />;
      case "buy_one_get_one": return <Gift className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const getDiscountDisplay = (voucher: any) => {
    switch (voucher.voucher_type) {
      case "percentage_discount": return `${voucher.discount_value}% OFF`;
      case "fixed_amount": return `$${voucher.discount_value} OFF`;
      case "buy_one_get_one": return "BOGO";
      default: return "Special Offer";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-lg">Loading vouchers...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discount Vouchers</h1>
          <p className="text-muted-foreground">
            Browse active vouchers from businesses near you
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {businessTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'} with active vouchers
        </div>

        {/* Business Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBusinesses.map(business => (
            <Card key={business.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{business.business_name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span className="text-xs truncate">{business.city}, {business.country}</span>
                    </CardDescription>
                  </div>
                  {business.logo_url && (
                    <img 
                      src={business.logo_url} 
                      alt={business.business_name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">{business.business_type}</Badge>
                  <Badge variant="outline">{business.voucher_count} {business.voucher_count === 1 ? 'voucher' : 'vouchers'}</Badge>
                </div>

                {/* Show first 2 vouchers */}
                <div className="space-y-2">
                  {business.active_vouchers.slice(0, 2).map(voucher => (
                    <div key={voucher.id} className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded">
                      {getVoucherIcon(voucher.voucher_type)}
                      <span className="flex-1 truncate">{voucher.title}</span>
                      <Badge className="bg-emerald-600 text-white text-xs">
                        {getDiscountDisplay(voucher)}
                      </Badge>
                    </div>
                  ))}
                  {business.voucher_count > 2 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{business.voucher_count - 2} more
                    </div>
                  )}
                </div>

                <Link to={`/business/${business.id}/vouchers`}>
                  <Button className="w-full" size="sm">
                    View All Vouchers
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBusinesses.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No businesses found with active vouchers.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters.</p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
