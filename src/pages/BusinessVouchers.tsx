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
import placeholderQR from "@/assets/placeholder-qr.png";
import { useToast } from "@/hooks/use-toast";

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
              <Card key={v.id} className="overflow-hidden">
                {/* Mobile-First Compact Layout */}
                <div className="relative w-full bg-gradient-to-br from-emerald-600 to-emerald-800">
                  <img 
                    src={voucherBase} 
                    alt="Voucher background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                  
                  <div className="relative p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-2 rounded">
                          {getIcon(v.voucher_type)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase">
                            {businessName}
                          </h3>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-400 text-gray-900 font-bold text-xs px-2 py-0.5">
                        {isExpired ? "EXPIRED" : "ACTIVE"}
                      </Badge>
                    </div>

                    {/* Main Offer */}
                    <div className="text-center py-4">
                      <h2 className="text-xl font-bold text-white mb-2">
                        {v.title}
                      </h2>
                      
                      <div className="inline-block bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-lg px-6 py-3">
                        <div className="text-5xl font-black text-yellow-300">
                          {v.voucher_type === "percentage_discount" && `${v.discount_value}%`}
                          {v.voucher_type === "fixed_amount" && `$${v.discount_value}`}
                          {v.voucher_type === "buy_one_get_one" && "BUY 1"}
                        </div>
                        <div className="text-lg font-bold text-white">
                          {v.voucher_type === "percentage_discount" && "OFF"}
                          {v.voucher_type === "fixed_amount" && "OFF"}
                          {v.voucher_type === "buy_one_get_one" && "GET 1 FREE"}
                        </div>
                      </div>
                      
                      {v.description && (
                        <p className="text-sm text-white/90 mt-3 px-4">
                          {v.description}
                        </p>
                      )}
                    </div>

                    {/* QR and Code Section */}
                    <div className="bg-white rounded-lg p-4 space-y-3">
                      <h4 className="text-center font-bold text-gray-900 text-sm uppercase">
                        Scan or Enter Code
                      </h4>
                      
                      <div className="flex items-center justify-center">
                        <div className="relative w-full aspect-square bg-white rounded-lg border-4 border-emerald-600 p-2">
                          <img 
                            src={qrMap[v.id] || placeholderQR} 
                            alt={`QR code for ${v.title}`} 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-xs font-semibold text-gray-500 uppercase">
                          Voucher Code
                        </div>
                        <div className="font-mono text-xl font-bold text-gray-900 my-1">
                          {v.voucher_code || "DEMO1234"}
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-none w-full"
                          disabled={!v.voucher_code}
                          onClick={() => {
                            if (v.voucher_code) {
                              navigator.clipboard.writeText(v.voucher_code);
                              toast({ title: "Code copied!" });
                            }
                          }}
                        >
                          Copy Code
                        </Button>
                        <p className="text-xs text-gray-600 mt-2 font-medium">
                          Staff: Scan QR or type code at POS
                        </p>
                      </div>
                    </div>

                    {/* Expiry */}
                    <div className="flex items-center justify-center gap-2 text-white text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Valid until {new Date(v.end_date).toLocaleDateString()}</span>
                    </div>

                    {/* Terms */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <h5 className="text-xs font-bold text-white uppercase mb-2">
                        Terms & Conditions
                      </h5>
                      <ul className="text-xs text-white/90 space-y-1">
                        <li>• One-time use only</li>
                        <li>• Cannot be combined with other offers</li>
                        <li>• Present before payment</li>
                        <li>• No cash value • Non-transferable</li>
                        {v.voucher_type === "percentage_discount" && (
                          <li>• Discount applies to eligible items</li>
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
