import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Tag, Calendar, Gift, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Voucher {
  id: string;
  title: string;
  description: string | null;
  voucher_code: string | null;
  voucher_type: string;
  discount_value: number;
  start_date: string;
  end_date: string;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
}

interface Business {
  business_name: string;
  description: string | null;
  logo_url: string | null;
}

const BusinessVouchers = () => {
  const { id: businessId } = useParams<{ id: string }>();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [businessId]);

  const fetchData = async () => {
    if (!businessId) return;

    try {
      // Fetch business info
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('business_name, description, logo_url')
        .eq('id', businessId)
        .eq('status', 'approved')
        .single();

      if (businessError) throw businessError;
      setBusiness(businessData);

      // Fetch active vouchers
      const { data: vouchersData, error: vouchersError } = await supabase
        .from('business_vouchers')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (vouchersError) throw vouchersError;
      setVouchers(vouchersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vouchers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: 'Voucher code copied to clipboard',
    });
  };

  const formatDiscount = (voucher: Voucher) => {
    if (voucher.voucher_type === 'percentage') {
      return `${voucher.discount_value}% OFF`;
    } else if (voucher.voucher_type === 'fixed') {
      return `$${voucher.discount_value} OFF`;
    } else if (voucher.voucher_type === 'bogo') {
      return 'BUY ONE GET ONE FREE';
    }
    return 'SPECIAL OFFER';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Business not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Business Header */}
        <Card className="border-2">
          <CardHeader className="text-center">
            {business.logo_url && (
              <div className="flex justify-center mb-4">
                <img 
                  src={business.logo_url} 
                  alt={business.business_name}
                  className="h-20 w-20 object-contain"
                />
              </div>
            )}
            <CardTitle className="text-3xl font-bold">{business.business_name}</CardTitle>
            {business.description && (
              <CardDescription className="text-lg mt-2">{business.description}</CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Vouchers Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Current Special Offers</h2>
          </div>

          {vouchers.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No active vouchers at the moment. Check back soon!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {vouchers.map((voucher) => (
                <Card 
                  key={voucher.id} 
                  className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-secondary/5"
                >
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{voucher.title}</CardTitle>
                        {voucher.description && (
                          <CardDescription className="text-base">
                            {voucher.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="default" className="text-lg px-4 py-2 whitespace-nowrap w-full md:w-auto text-center">
                        {formatDiscount(voucher)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {voucher.voucher_code && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-background/50 border-2 border-dashed">
                        <div className="flex items-center gap-2 flex-1">
                          <Tag className="h-5 w-5 text-primary" />
                          <code className="text-lg font-mono font-bold">
                            {voucher.voucher_code}
                          </code>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyVoucherCode(voucher.voucher_code!)}
                          className="w-full sm:w-auto"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Valid until {new Date(voucher.end_date).toLocaleDateString()}</span>
                      </div>
                      {voucher.max_uses && (
                        <div className="flex items-center gap-1">
                          <Gift className="h-4 w-4" />
                          <span>
                            {voucher.max_uses - voucher.current_uses} remaining
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessVouchers;
