import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, X, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import jsQR from "jsqr";

interface MemberCardData {
  type: string;
  card_number: string;
  member_id: string;
  issued: string;
}

interface ScanResult {
  cardNumber: string;
  memberName: string;
  memberEmail: string;
  visitCount: number;
}

export function BusinessQRScanner({ businessId }: { businessId: string }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
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
      streamRef.current.getTracks().forEach(track => track.stop());
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
      const cardData: MemberCardData = JSON.parse(qrData);
      
      if (cardData.type !== "member_card") {
        throw new Error("Invalid QR code");
      }

      // Get member card details
      const { data: memberCard, error: cardError } = await supabase
        .from("member_cards")
        .select("id, member_name, member_email, card_number")
        .eq("card_number", cardData.card_number)
        .eq("is_active", true)
        .single();

      if (cardError || !memberCard) {
        throw new Error("Invalid or inactive member card");
      }

      // Get visit count for this member at this business
      const { count } = await supabase
        .from("member_visits")
        .select("*", { count: "exact", head: true })
        .eq("card_id", memberCard.id)
        .eq("business_id", businessId);

      // Record the visit
      const { error: visitError } = await supabase
        .from("member_visits")
        .insert({
          card_id: memberCard.id,
          business_id: businessId,
          visit_date: new Date().toISOString()
        });

      if (visitError) throw visitError;

      setScanResult({
        cardNumber: memberCard.card_number,
        memberName: memberCard.member_name,
        memberEmail: memberCard.member_email,
        visitCount: (count || 0) + 1
      });

      toast.success("Visit recorded successfully!");
    } catch (err) {
      console.error("QR scan error:", err);
      setError(err instanceof Error ? err.message : "Failed to process QR code");
      toast.error("Failed to scan QR code");
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (scanResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5" />
            Visit Recorded
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Member Name</p>
            <p className="font-medium">{scanResult.memberName}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Card Number</p>
            <p className="font-mono text-sm">{scanResult.cardNumber}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Visits</p>
            <p className="text-2xl font-bold text-primary">{scanResult.visitCount}</p>
          </div>
          <Button onClick={resetScanner} className="w-full">
            Scan Another Card
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Member QR Code</CardTitle>
        <CardDescription>
          Point your camera at a member's QR code to record their visit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isScanning ? (
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <Button onClick={stopCamera} variant="outline" className="w-full">
              <X className="h-4 w-4 mr-2" />
              Cancel Scan
            </Button>
          </div>
        ) : (
          <Button onClick={startCamera} className="w-full">
            <Camera className="h-4 w-4 mr-2" />
            Start Camera
          </Button>
        )}
      </CardContent>
    </Card>
  );
}