import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, Percent, DollarSign, Gift, Ticket, QrCode } from "lucide-react";
import QRCode from "qrcode";
import voucherBase from "@/assets/voucher-base.png";

interface Voucher {
  id: string;
  title: string;
  description: string | null;
  voucher_type: "percentage_discount" | "fixed_amount" | "buy_one_get_one";
  discount_value: number;
  end_date: string;
  voucher_code: string | null;
  qr_code_data: string | null;
}

export default function BusinessVouchers() {
  const { id } = useParams();
  const businessId = id as string;
  const [businessName, setBusinessName] = useState<string>("");
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = businessName ? `${businessName} Vouchers | 55plus` : "Business Vouchers | 55plus";
    // Meta description (best effort in SPA)
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", `Active discount vouchers for ${businessName || "business"}.`);
  }, [businessName]);

  useEffect(() => {
    const load = async () => {
      // Fetch business public name (only approved are public)
      const { data: biz } = await supabase
        .from("businesses")
        .select("business_name")
        .eq("id", businessId)
        .maybeSingle();
      setBusinessName(biz?.business_name || "");

      const { data: vs } = await supabase
        .from("business_vouchers")
        .select("id, title, description, voucher_type, discount_value, end_date, voucher_code, qr_code_data")
        .eq("business_id", businessId)
        .gt("end_date", new Date().toISOString())
        .eq("is_active", true);
      
      // Pre-generate QR codes for all vouchers
      if (vs) {
        const qrCodes: Record<string, string> = {};
        for (const v of vs) {
          if (v.qr_code_data) {
            try {
              const dataUrl = await QRCode.toDataURL(v.qr_code_data, { margin: 1, scale: 4 });
              qrCodes[v.id] = dataUrl;
            } catch (e) {
              console.error("QR generation error", e);
            }
          }
        }
        setQrMap(qrCodes);
      }
      
      setVouchers(vs || []);
    };
    if (businessId) load();
  }, [businessId]);

  const getIcon = (type: Voucher["voucher_type"]) => {
    switch (type) {
      case "percentage_discount":
        return <Percent className="h-4 w-4" />;
      case "fixed_amount":
        return <DollarSign className="h-4 w-4" />;
      case "buy_one_get_one":
        return <Gift className="h-4 w-4" />;
    }
  };


  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">{businessName || "Business"} Discount Vouchers</h1>
        <p className="text-muted-foreground text-sm">Show the QR or code at checkout to redeem.</p>
      </header>
      <Separator />

      {vouchers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No active vouchers at the moment.
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-4">
          {vouchers.map((v) => {
            const isExpired = new Date(v.end_date) < new Date();
            return (
              <Card key={v.id} className="overflow-hidden">
                <div className="relative w-full min-h-[400px]">
                  {/* Voucher Base Image */}
                  <img 
                    src={voucherBase} 
                    alt="Voucher background" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Main Voucher Content */}
                  <div className="relative p-8 flex flex-col gap-6">
                    {/* Header with Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-white">{getIcon(v.voucher_type)}</div>
                        <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                          {businessName}
                        </h3>
                      </div>
                      <Badge variant="secondary" className="bg-white text-black">
                        {isExpired ? "Expired" : "Active"}
                      </Badge>
                    </div>

                    {/* Main Offer Section */}
                    <div className="flex items-start gap-6">
                      {/* Left: Offer Details */}
                      <div className="flex-1 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                          {v.title}
                        </h2>
                        
                        <div className="text-4xl md:text-6xl font-bold text-yellow-300 drop-shadow-lg">
                          {v.voucher_type === "percentage_discount" && `${v.discount_value}% OFF`}
                          {v.voucher_type === "fixed_amount" && `$${v.discount_value} OFF`}
                          {v.voucher_type === "buy_one_get_one" && `Buy 1 Get ${v.discount_value} FREE`}
                        </div>
                        
                        {v.description && (
                          <p className="text-base md:text-lg text-white drop-shadow">
                            {v.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 text-white drop-shadow">
                          <Calendar className="h-5 w-5" />
                          <span className="text-base md:text-lg">
                            Valid until {new Date(v.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="bg-white/95 px-6 py-3 rounded inline-block shadow-lg">
                          <div className="text-xs text-gray-600 mb-1">Voucher Code</div>
                          <div className="font-mono text-2xl md:text-3xl font-bold text-gray-900">
                            {v.voucher_code || "NO CODE NEEDED"}
                          </div>
                        </div>
                      </div>

                      {/* Right: QR Code */}
                      <div className="flex flex-col items-center gap-2">
                        {qrMap[v.id] ? (
                          <div className="bg-white p-4 rounded-lg shadow-xl">
                            <img 
                              src={qrMap[v.id]} 
                              alt={`QR code for ${v.title}`} 
                              className="w-40 h-40 md:w-48 md:h-48"
                            />
                          </div>
                        ) : (
                          <div className="w-40 h-40 md:w-48 md:h-48 bg-white/20 rounded-lg flex items-center justify-center">
                            <QrCode className="h-16 w-16 text-white/50" />
                          </div>
                        )}
                        <p className="text-white text-sm font-medium drop-shadow">Scan to Redeem</p>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="border-t border-white/30 pt-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Terms & Conditions:</h4>
                      <ul className="text-xs text-white/90 space-y-1 list-disc list-inside">
                        <li>Valid for one-time use only</li>
                        <li>Cannot be combined with other offers</li>
                        <li>Show this voucher at checkout to redeem</li>
                        <li>No cash value. Non-transferable.</li>
                        <li>Valid until {new Date(v.end_date).toLocaleDateString()}</li>
                        {v.voucher_type === "percentage_discount" && (
                          <li>Discount applies to eligible items only</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </main>
  );
}
