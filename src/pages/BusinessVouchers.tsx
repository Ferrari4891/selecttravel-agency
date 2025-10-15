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
                <div className="relative w-full aspect-video">
                  {/* Voucher Base Image */}
                  <img 
                    src={voucherBase} 
                    alt="Voucher background" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Text Overlay - Left Side */}
                  <div className="absolute inset-0 flex">
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-white">{getIcon(v.voucher_type)}</div>
                        <Badge variant="secondary" className="bg-white/95 text-black">
                          {isExpired ? "Expired" : "Active"}
                        </Badge>
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                        {v.title}
                      </h3>
                      
                      <div className="text-3xl md:text-5xl font-bold text-yellow-300 mb-4 drop-shadow-lg">
                        {v.voucher_type === "percentage_discount" && `${v.discount_value}% OFF`}
                        {v.voucher_type === "fixed_amount" && `$${v.discount_value} OFF`}
                        {v.voucher_type === "buy_one_get_one" && `Buy 1 Get ${v.discount_value} FREE`}
                      </div>
                      
                      {v.description && (
                        <p className="text-sm md:text-base text-white/90 mb-4 max-w-md drop-shadow">
                          {v.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm md:text-base text-white/95 mb-3 drop-shadow">
                        <Calendar className="h-4 w-4" />
                        <span>Expires {new Date(v.end_date).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="bg-white/95 px-4 py-2 rounded shadow-lg">
                        <div className="text-xs text-gray-600 mb-1">Voucher Code</div>
                        <div className="font-mono text-lg md:text-xl font-bold text-gray-900">
                          {v.voucher_code || "—"}
                        </div>
                      </div>
                    </div>
                    
                    {/* QR Code - Right Side */}
                    <div className="w-1/3 flex items-center justify-center p-4 bg-white/10">
                      {qrMap[v.id] ? (
                        <div className="bg-white p-3 rounded shadow-lg">
                          <img 
                            src={qrMap[v.id]} 
                            alt={`QR code for ${v.title}`} 
                            className="w-full h-auto"
                          />
                          <div className="text-center text-xs text-gray-600 mt-2">Scan to redeem</div>
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-white/20 rounded flex items-center justify-center">
                          <QrCode className="h-12 w-12 text-white/50" />
                        </div>
                      )}
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
