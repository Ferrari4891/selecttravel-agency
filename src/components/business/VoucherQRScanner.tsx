import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, X, CheckCircle, AlertCircle, Ticket } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import jsQR from "jsqr";

interface VoucherQRScannerProps {
  businessId: string;
}

interface VoucherQRPayload {
  type: string;
  code: string;
  voucher_id: string;
  business_id: string;
}

export function VoucherQRScanner({ businessId }: VoucherQRScannerProps) {
  const { toast } = useToast();
  const [isTestMode, setIsTestMode] = useState(() => {
    const saved = localStorage.getItem("voucherScannerTestMode");
    return saved === "true";
  });
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{
    title: string;
    code: string;
    uses: number;
    isTestScan: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setIsScanning(true);
      setError(null);
      scanQRCode();
    } catch (err) {
      setError("Failed to access camera. Please grant camera permissions.");
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsScanning(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        handleQRCodeDetected(code.data);
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanQRCode);
  };

  const handleQRCodeDetected = async (qrData: string) => {
    stopCamera();
    try {
      const payload: VoucherQRPayload = JSON.parse(qrData);
      if (payload.type !== "voucher") throw new Error("Invalid voucher QR");
      if (payload.business_id !== businessId) throw new Error("Voucher not for this business");

      // Fetch voucher
      const { data: voucher, error: vErr } = await supabase
        .from("business_vouchers")
        .select("id, title, is_active, end_date, max_uses, current_uses")
        .eq("id", payload.voucher_id)
        .maybeSingle();

      if (vErr || !voucher) throw new Error("Voucher not found");

      const isExpired = new Date(voucher.end_date) < new Date();
      const isMaxed = voucher.max_uses !== null && voucher.max_uses !== undefined && voucher.current_uses >= voucher.max_uses;
      if (!voucher.is_active || isExpired || isMaxed) {
        throw new Error("Voucher is not valid (inactive, expired, or maxed)");
      }

      // In TEST MODE: Skip database writes
      if (isTestMode) {
        setResult({ 
          title: voucher.title, 
          code: payload.code, 
          uses: (voucher.current_uses || 0) + 1, 
          isTestScan: true 
        });
        toast({
          title: "Test Scan Complete",
          description: "Voucher validated successfully. No data recorded.",
        });
        return;
      }

      // In LIVE MODE: Record redemption and increment uses
      const { error: useErr } = await supabase.from("voucher_usage").insert({
        voucher_id: voucher.id,
        amount_saved: 0,
      });
      if (useErr) throw useErr;

      const { error: updErr } = await supabase
        .from("business_vouchers")
        .update({ current_uses: (voucher.current_uses || 0) + 1 })
        .eq("id", voucher.id);
      if (updErr) throw updErr;

      setResult({ 
        title: voucher.title, 
        code: payload.code, 
        uses: (voucher.current_uses || 0) + 1, 
        isTestScan: false 
      });
      toast({
        title: "Voucher Redeemed",
        description: "Redemption recorded successfully.",
      });
    } catch (err) {
      console.error("Voucher QR error:", err);
      setError(err instanceof Error ? err.message : "Failed to process voucher QR");
    }
  };

  const handleTestModeToggle = (checked: boolean) => {
    if (!checked && isTestMode) {
      // Switching from TEST to LIVE
      if (!confirm("Switch to LIVE MODE? All scans will be recorded permanently.")) {
        return;
      }
    }
    setIsTestMode(checked);
    localStorage.setItem("voucherScannerTestMode", checked.toString());
    toast({
      title: checked ? "Test Mode Enabled" : "Live Mode Enabled",
      description: checked 
        ? "Scans will validate but not record data." 
        : "Scans will now be recorded permanently.",
      variant: checked ? "default" : "destructive",
    });
  };

  useEffect(() => () => stopCamera(), []);

  if (result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" /> 
            {result.isTestScan ? "Test Scan Complete" : "Voucher Redeemed"}
          </CardTitle>
          <CardDescription>
            {result.isTestScan 
              ? "Voucher validated successfully. No data was recorded." 
              : "Redemption recorded successfully."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge variant={result.isTestScan ? "secondary" : "default"} className="w-fit">
            {result.isTestScan ? "🟡 TEST SCAN" : "🔴 LIVE REDEMPTION"}
          </Badge>
          <div className="text-sm text-muted-foreground">Voucher</div>
          <div className="font-medium flex items-center gap-2">
            <Ticket className="h-4 w-4" /> {result.title}
          </div>
          <div className="text-sm text-muted-foreground">Code</div>
          <div className="font-mono text-sm">{result.code}</div>
          <div className="text-sm text-muted-foreground">
            {result.isTestScan ? "Total Uses (Would be)" : "Total Uses"}
          </div>
          <div className="text-2xl font-bold">{result.uses}</div>
          <Button onClick={() => setResult(null)} className="w-full">Scan Another Voucher</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redeem Voucher</CardTitle>
        <CardDescription>Scan a voucher QR to redeem and record usage.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            <Switch 
              id="test-mode" 
              checked={isTestMode} 
              onCheckedChange={handleTestModeToggle}
            />
            <Label htmlFor="test-mode" className="cursor-pointer">
              <div className="font-medium">
                {isTestMode ? "🟡 TEST MODE" : "🔴 LIVE MODE"}
              </div>
              <div className="text-xs text-muted-foreground">
                {isTestMode ? "Scans will not record data" : "Scans will be recorded"}
              </div>
            </Label>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        {isScanning ? (
          <div className="space-y-4">
            <div className="relative aspect-video bg-black overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <Button onClick={stopCamera} variant="outline" className="w-full">
              <X className="h-4 w-4 mr-2" /> Cancel Scan
            </Button>
          </div>
        ) : (
          <Button onClick={startCamera} className="w-full">
            <Camera className="h-4 w-4 mr-2" /> Start Camera
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
