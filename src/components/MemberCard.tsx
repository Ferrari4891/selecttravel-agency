import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import { toast } from '@/hooks/use-toast';
import memberCardBg from '@/assets/member-card-bg.png';

interface MemberCardData {
  id: string;
  card_number: string;
  qr_code_data: string;
  member_name: string;
  member_email: string;
  is_active: boolean;
  issued_at: string;
}

export const MemberCard = () => {
  const { user } = useAuth();
  const [cardData, setCardData] = useState<MemberCardData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberCard = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('member_cards')
          .select('*')
          .eq('profile_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setCardData(data);
          
          // Generate QR code
          const qrUrl = await QRCode.toDataURL(data.qr_code_data, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          });
          setQrCodeUrl(qrUrl);
        }
      } catch (error) {
        console.error('Error fetching member card:', error);
        toast({
          title: 'Error loading card',
          description: 'Unable to load your membership card. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMemberCard();
  }, [user]);

  const formatCardNumber = (number: string) => {
    // Format as: XXXX XXXX XXXX (groups of 4)
    const cleaned = number.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ');
  };

  const downloadCard = async () => {
    if (!cardData) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size (standard credit card ratio)
      canvas.width = 1200;
      canvas.height = 750;

      // Load background image
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.src = memberCardBg;

      bgImg.onload = () => {
        // Draw background
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        // Add branding text at top
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SMARTGUIDEBOOKS.COM', canvas.width / 2, 100);

        // Draw QR code in center
        if (qrCodeUrl) {
          const qrImg = new Image();
          qrImg.src = qrCodeUrl;
          qrImg.onload = () => {
            const qrSize = 300;
            const qrX = (canvas.width - qrSize) / 2;
            const qrY = 200;
            
            // White background for QR
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
            
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            // Draw green footer section
            const footerHeight = 200;
            const footerY = canvas.height - footerHeight;
            ctx.fillStyle = '#2F4F2F'; // Dark green
            ctx.fillRect(0, footerY, canvas.width, footerHeight);

            // Member name
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 56px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(cardData.member_name.toUpperCase(), canvas.width / 2, footerY + 80);

            // Card number
            ctx.font = 'bold 44px Arial';
            ctx.fillText(formatCardNumber(cardData.card_number), canvas.width / 2, footerY + 150);

            // Download
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `membership-card-${cardData.card_number}.png`;
                a.click();
                URL.revokeObjectURL(url);
                
                toast({
                  title: 'Card downloaded',
                  description: 'Your membership card has been downloaded.',
                });
              }
            });
          };
        }
      };
    } catch (error) {
      console.error('Error downloading card:', error);
      toast({
        title: 'Download failed',
        description: 'Unable to download your card. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!cardData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No membership card found. Please contact support.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Simple Scannable View */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Scan at Venue</h2>
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8">
            {qrCodeUrl && (
              <div className="bg-white p-4 inline-block mb-6">
                <img 
                  src={qrCodeUrl} 
                  alt="Member QR Code" 
                  className="w-64 h-64"
                />
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Member Number</p>
              <p className="text-2xl font-bold tracking-wider">
                {formatCardNumber(cardData.card_number)}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {cardData.member_name}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-muted-foreground">Full Membership Card</span>
        </div>
      </div>

      {/* Full Downloadable Card */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Download Your Card</h2>
        <Card className="overflow-hidden max-w-4xl mx-auto">
          <CardContent className="p-0">
            <div 
              className="relative w-full aspect-[16/10] bg-cover bg-center"
              style={{ backgroundImage: `url(${memberCardBg})` }}
            >
              {/* Branding */}
              <div className="absolute top-8 left-0 right-0 text-center">
                <h3 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  SMARTGUIDEBOOKS.COM
                </h3>
              </div>

              {/* QR Code */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                {qrCodeUrl && (
                  <div className="bg-white p-4">
                    <img 
                      src={qrCodeUrl} 
                      alt="Member QR Code" 
                      className="w-48 h-48 md:w-64 md:h-64"
                    />
                  </div>
                )}
              </div>

              {/* Footer with member info */}
              <div className="absolute bottom-0 left-0 right-0 bg-[#2F4F2F] py-6 px-8">
                <div className="text-center space-y-2">
                  <p className="text-white text-2xl md:text-3xl font-bold">
                    {cardData.member_name.toUpperCase()}
                  </p>
                  <p className="text-white text-xl md:text-2xl font-bold tracking-wider">
                    {formatCardNumber(cardData.card_number)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-6">
          <Button onClick={downloadCard} size="lg">
            <Download className="mr-2 h-5 w-5" />
            Download Card
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">How to Use Your Membership Card</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Show the QR code above at participating first-class businesses to scan</li>
            <li>• Download the full card and save it to your phone for offline access</li>
            <li>• Earn rewards and track your visits automatically</li>
            <li>• Use for bookings and exclusive member benefits</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
