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
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

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
              <Card key={v.id} className="overflow-hidden shadow-xl">
                <div className="relative w-full h-[500px] bg-gradient-to-br from-emerald-600 to-emerald-800">
                  {/* Voucher Base Image */}
                  <img 
                    src={voucherBase} 
                    alt="Voucher background" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Main Content Grid */}
                  <div className="relative h-full flex flex-col md:flex-row">
                    {/* Left Section - Main Offer */}
                    <div className="flex-1 p-6 md:p-12 flex flex-col justify-between">
                      {/* Header */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                            {getIcon(v.voucher_type)}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white uppercase tracking-wide">
                              {businessName}
                            </h3>
                            <p className="text-white/80 text-sm">Premium Discount Voucher</p>
                          </div>
                        </div>
                        
                        <Badge variant="secondary" className="bg-yellow-400 text-gray-900 font-bold px-4 py-1">
                          {isExpired ? "EXPIRED" : "ACTIVE OFFER"}
                        </Badge>
                      </div>

                      {/* Main Offer */}
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
                            {v.title}
                          </h2>
                          
                          <div className="bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl p-6 inline-block">
                            <div className="text-6xl md:text-7xl font-black text-yellow-300 drop-shadow-2xl">
                              {v.voucher_type === "percentage_discount" && `${v.discount_value}%`}
                              {v.voucher_type === "fixed_amount" && `$${v.discount_value}`}
                              {v.voucher_type === "buy_one_get_one" && `${v.discount_value}X`}
                            </div>
                            <div className="text-2xl font-bold text-white mt-2">
                              {v.voucher_type === "percentage_discount" && "OFF"}
                              {v.voucher_type === "fixed_amount" && "OFF"}
                              {v.voucher_type === "buy_one_get_one" && "FREE"}
                            </div>
                          </div>
                        </div>
                        
                        {v.description && (
                          <p className="text-xl text-white/95 max-w-lg leading-relaxed">
                            {v.description}
                          </p>
                        )}
                      </div>

                      {/* Footer Info */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-white/90">
                          <Calendar className="h-6 w-6" />
                          <span className="text-lg font-medium">
                            Valid until {new Date(v.end_date).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - QR & Code & Terms */}
                    <div className="md:w-[360px] w-full bg-white/95 backdrop-blur-sm p-6 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l-4 border-dashed border-emerald-700/30">
                      {/* QR Code Section */}
                      <div className="text-center space-y-4">
                        <h4 className="text-gray-900 font-bold text-lg uppercase tracking-wide">
                          Scan or Enter Code
                        </h4>
                        
                        {qrMap[v.id] ? (
                          <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-emerald-600 mx-auto w-fit">
                            <img 
                              src={qrMap[v.id]} 
                              alt={`QR code for ${v.title} (${v.voucher_code || ''})`} 
                              className="w-56 h-56"
                            />
                          </div>
                        ) : (
                          <div className="w-56 h-56 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center border-4 border-gray-300">
                            <QrCode className="h-20 w-20 text-gray-400" />
                          </div>
                        )}

                        {/* Voucher Number */}
                        <div className="mt-4">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Voucher Number
                          </div>
                          <div className="font-mono text-2xl md:text-3xl font-bold text-gray-900 tracking-[0.2em] mt-1">
                            {v.voucher_code || "NO CODE"}
                          </div>
                          <div className="mt-3 flex items-center justify-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="rounded-none"
                              disabled={!v.voucher_code}
                              onClick={() => {
                                if (v.voucher_code) {
                                  navigator.clipboard.writeText(v.voucher_code);
                                  toast({ title: "Code copied", description: "Voucher code copied to clipboard." });
                                }
                              }}
                              aria-label="Copy voucher code"
                            >
                              Copy Code
                            </Button>
                          </div>
                          <p className="text-sm font-semibold text-gray-600 mt-3">
                            Staff: Scan the QR or type the code at POS
                          </p>
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="border-t-2 border-gray-200 pt-6">
                        <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                          Terms & Conditions
                        </h5>
                        <ul className="text-xs text-gray-700 space-y-2 leading-relaxed">
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>One-time use only</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>Cannot be combined with other offers</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>Present voucher before payment</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>No cash value • Non-transferable</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>Valid until expiry date shown</span>
                          </li>
                          {v.voucher_type === "percentage_discount" && (
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-600 font-bold">•</span>
                              <span>Discount applies to eligible items</span>
                            </li>
                          )}
                        </ul>
                      </div>
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
