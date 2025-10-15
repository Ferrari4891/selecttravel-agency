import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";
import { Download, Printer, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BusinessVoucherQRProps {
  businessId: string;
  businessName: string;
}

export const BusinessVoucherQR = ({ businessId, businessName }: BusinessVoucherQRProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const { toast } = useToast();
  const voucherUrl = `${window.location.origin}/business/${businessId}/vouchers`;

  useEffect(() => {
    generateQRCode();
  }, [businessId]);

  const generateQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(voucherUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${businessName.replace(/\s+/g, '-')}-voucher-qr.png`;
    link.click();
    
    toast({
      title: "QR Code Downloaded",
      description: "Your voucher QR code has been downloaded successfully.",
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Voucher QR Code</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              h1 { margin-bottom: 20px; }
              img { max-width: 400px; margin: 20px 0; }
              p { text-align: center; max-width: 400px; }
            </style>
          </head>
          <body>
            <h1>${businessName}</h1>
            <h2>Scan for Discount Vouchers</h2>
            <img src="${qrCodeUrl}" alt="Voucher QR Code" />
            <p>Scan this QR code with your smartphone to view our current discount vouchers</p>
            <p style="font-size: 12px; color: #666;">${voucherUrl}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${businessName} Vouchers`,
          text: `Check out discount vouchers from ${businessName}`,
          url: voucherUrl,
        });
        toast({
          title: "Shared!",
          description: "Voucher link shared successfully.",
        });
      } else {
        await navigator.clipboard.writeText(voucherUrl);
        toast({
          title: "Link Copied",
          description: "Voucher link copied to clipboard.",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Vouchers</CardTitle>
        <CardDescription>
          Display this QR code in your business for customers to scan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {qrCodeUrl && (
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border-4 border-emerald-600">
              <img src={qrCodeUrl} alt="Voucher QR Code" className="w-64 h-64" />
            </div>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p className="font-medium mb-1">Scan to view vouchers</p>
          <p className="text-xs break-all">{voucherUrl}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>

        <div className="bg-muted p-3 rounded text-xs">
          <p className="font-medium mb-1">💡 Pro Tip:</p>
          <p className="text-muted-foreground">
            Print this QR code and display it at your entrance, on tables, or at the checkout counter 
            so customers can easily access your vouchers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
