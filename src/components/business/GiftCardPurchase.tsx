import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GiftCardPurchaseProps {
  businessId: string;
  businessName: string;
}

export function GiftCardPurchase({ businessId, businessName }: GiftCardPurchaseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [message, setMessage] = useState("");
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const presetAmounts = [
    { value: "10.00", label: "$10.00" },
    { value: "20.00", label: "$20.00" },
    { value: "30.00", label: "$30.00" },
    { value: "40.00", label: "$40.00" },
    { value: "50.00", label: "$50.00" },
    { value: "60.00", label: "$60.00" },
    { value: "70.00", label: "$70.00" },
    { value: "80.00", label: "$80.00" },
    { value: "90.00", label: "$90.00" },
    { value: "100.00", label: "$100.00" },
    { value: "custom", label: "Custom Amount" },
  ];

  const finalAmount = amount === "custom" ? customAmount : amount;

  const handlePurchase = async () => {
    if (!finalAmount || !recipientName || !recipientEmail || !purchaserName || !purchaserEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const amountNumber = parseFloat(finalAmount);
    if (isNaN(amountNumber) || amountNumber < 5 || amountNumber > 1000) {
      toast({
        title: "Invalid Amount",
        description: "Gift card amount must be between $5.00 and $1,000.00.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Generate unique codes
      const qrCode = `GC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const numericCode = Math.random().toString().substr(2, 8);

      // Insert gift card record
      const { error } = await supabase
        .from('gift_cards')
        .insert({
          business_id: businessId,
          recipient_name: recipientName,
          recipient_email: recipientEmail,
          recipient_phone: recipientPhone,
          message: message,
          amount: amountNumber,
          qr_code: qrCode,
          numeric_code: numericCode,
          purchased_by_name: purchaserName,
          purchased_by_email: purchaserEmail,
        });

      if (error) throw error;

      toast({
        title: "Gift Card Created",
        description: "Gift card has been created successfully! Payment processing will be implemented next.",
      });

      // Reset form and close dialog
      setAmount("");
      setCustomAmount("");
      setRecipientName("");
      setRecipientEmail("");
      setRecipientPhone("");
      setMessage("");
      setPurchaserName("");
      setPurchaserEmail("");
      setIsOpen(false);

    } catch (error) {
      console.error('Error creating gift card:', error);
      toast({
        title: "Error",
        description: "Failed to create gift card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Gift className="w-4 h-4 mr-2" />
          Purchase Gift Card
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase Gift Card</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Give the gift of {businessName}
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Amount Selection */}
          <div className="space-y-2">
            <Label htmlFor="amount">Select Amount</Label>
            <Select value={amount} onValueChange={setAmount}>
              <SelectTrigger>
                <SelectValue placeholder="Choose gift card amount" />
              </SelectTrigger>
              <SelectContent>
                {presetAmounts.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Amount Input */}
          {amount === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="custom-amount">Custom Amount ($5.00 - $1,000.00)</Label>
              <Input
                id="custom-amount"
                type="number"
                min="5"
                max="1000"
                step="0.01"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>
          )}

          {/* Recipient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recipient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="recipient-name">Recipient Name *</Label>
                <Input
                  id="recipient-name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter recipient's name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipient-email">Recipient Email *</Label>
                <Input
                  id="recipient-email"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recipient@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipient-phone">Recipient Phone (Optional)</Label>
                <Input
                  id="recipient-phone"
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a personal message..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Purchaser Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="purchaser-name">Your Name *</Label>
                <Input
                  id="purchaser-name"
                  value={purchaserName}
                  onChange={(e) => setPurchaserName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaser-email">Your Email *</Label>
                <Input
                  id="purchaser-email"
                  type="email"
                  value={purchaserEmail}
                  onChange={(e) => setPurchaserEmail(e.target.value)}
                  placeholder="your@example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Total Display */}
          {finalAmount && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>${parseFloat(finalAmount).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Purchase Button */}
          <Button 
            onClick={handlePurchase} 
            disabled={isLoading || !finalAmount || !recipientName || !recipientEmail || !purchaserName || !purchaserEmail}
            className="w-full"
          >
            {isLoading ? "Processing..." : `Purchase Gift Card - $${finalAmount ? parseFloat(finalAmount).toFixed(2) : "0.00"}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}