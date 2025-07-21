import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MailingListSignupProps {
  location?: string;
  category?: string;
}

export const MailingListSignup: React.FC<MailingListSignupProps> = ({ location, category }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubscribed(true);
      toast({
        title: "Success!",
        description: "You've been added to our mailing list",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <Card className="group bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 rounded-none relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-center space-y-4 flex-col text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-primary">Welcome to the Club!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You'll receive exclusive {location ? `${location} ` : ''}{category ? `${category.toLowerCase()} ` : 'dining '}recommendations and special offers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/30 transition-all duration-300 rounded-none relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full flex-shrink-0">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Get Exclusive {location ? `${location} ` : ''}{category ? `${category} ` : 'Food '}Alerts</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Join thousands of {category ? `${category.toLowerCase()} ` : 'food '}lovers getting the best {category ? `${category.toLowerCase()} ` : 'dining '}recommendations, hidden gems, and exclusive offers delivered weekly.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-none"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                className="rounded-none bg-primary hover:bg-primary/90 px-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Join
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </form>
            
            <p className="text-xs text-muted-foreground">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};