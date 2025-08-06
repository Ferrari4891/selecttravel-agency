import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { CalendarIcon, MapPinIcon, Users } from 'lucide-react';

interface Invitation {
  id: string;
  group_name: string;
  proposed_date: string;
  rsvp_deadline: string;
  custom_message: string;
  status: string;
  saved_restaurants: {
    restaurant_name: string;
    restaurant_address: string;
    city: string;
    country: string;
    restaurant_data: any;
  };
}

export const RSVP = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<'yes' | 'no' | 'maybe'>('yes');
  const [guestCount, setGuestCount] = useState(1);
  const [responseMessage, setResponseMessage] = useState('');
  const [email, setEmail] = useState('');
  const [hasExistingRsvp, setHasExistingRsvp] = useState(false);

  useEffect(() => {
    if (token) {
      loadInvitation();
    }
  }, [token]);

  const loadInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('group_invitations')
        .select(`
          *,
          saved_restaurants (
            restaurant_name,
            restaurant_address,
            city,
            country,
            restaurant_data
          )
        `)
        .eq('invite_token', token)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        toast.error('Invitation not found or expired');
        navigate('/');
        return;
      }

      setInvitation(data);

      // Check if past RSVP deadline
      if (new Date() > new Date(data.rsvp_deadline)) {
        toast.error('RSVP deadline has passed');
        return;
      }

      // Check for existing RSVP if user is logged in
      if (user) {
        const { data: existingRsvp } = await supabase
          .from('invitation_rsvps')
          .select('*')
          .eq('invitation_id', data.id)
          .eq('invitee_user_id', user.id)
          .single();

        if (existingRsvp) {
          setHasExistingRsvp(true);
          setResponse(existingRsvp.response as 'yes' | 'no' | 'maybe');
          setGuestCount(existingRsvp.guest_count || 1);
          setResponseMessage(existingRsvp.response_message || '');
        }
      }
    } catch (error) {
      console.error('Error loading invitation:', error);
      toast.error('Failed to load invitation');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!invitation) return;

    if (!user && !email) {
      toast.error('Please provide your email address');
      return;
    }

    setSubmitting(true);

    try {
      const rsvpData = {
        invitation_id: invitation.id,
        invitee_email: user?.email || email,
        invitee_user_id: user?.id || null,
        response,
        guest_count: guestCount,
        response_message: responseMessage,
        responded_at: new Date().toISOString()
      };

      if (hasExistingRsvp && user) {
        // Update existing RSVP
        const { error } = await supabase
          .from('invitation_rsvps')
          .update(rsvpData)
          .eq('invitation_id', invitation.id)
          .eq('invitee_user_id', user.id);

        if (error) throw error;
      } else {
        // Create new RSVP
        const { error } = await supabase
          .from('invitation_rsvps')
          .insert(rsvpData);

        if (error) throw error;
      }

      toast.success('RSVP submitted successfully!');
      
      if (!user) {
        toast.info('Sign up for a free account to manage your RSVPs and save places!');
      }

    } catch (error) {
      console.error('Error submitting RSVP:', error);
      toast.error('Failed to submit RSVP');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="bg-black text-white px-6 py-3 rounded-lg sm:bg-primary sm:text-primary-foreground">
            <h1 className="text-6xl font-bold mb-8">SGB</h1>
          </div>
          <div className="flex space-x-2 justify-center mt-8">
            <div className="w-3 h-3 bg-foreground rounded-full animate-bounce sm:bg-primary"></div>
            <div className="w-3 h-3 bg-foreground rounded-full animate-bounce sm:bg-primary" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-foreground rounded-full animate-bounce sm:bg-primary" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center p-8">
              <h2 className="text-xl font-semibold mb-4">Invitation Not Found</h2>
              <p className="text-muted-foreground mb-4">
                This invitation may have expired or been cancelled.
              </p>
              <Button onClick={() => navigate('/')}>
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                You're Invited!
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Invitation Details */}
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">{invitation.group_name}</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{invitation.saved_restaurants.restaurant_name}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {invitation.saved_restaurants.restaurant_address}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {invitation.saved_restaurants.city}, {invitation.saved_restaurants.country}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(invitation.proposed_date), 'PPP')}</span>
                </div>

                {invitation.custom_message && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="italic">"{invitation.custom_message}"</p>
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Please RSVP by {format(new Date(invitation.rsvp_deadline), 'PPP')}
                </p>
              </div>

              {/* RSVP Form */}
              <div className="space-y-4 border-t pt-6">
                <h4 className="font-semibold">Your Response</h4>
                
                <RadioGroup value={response} onValueChange={(value) => setResponse(value as 'yes' | 'no' | 'maybe')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="text-base">Yes, I'll be there!</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maybe" id="maybe" />
                    <Label htmlFor="maybe" className="text-base">Maybe</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="text-base">Sorry, can't make it</Label>
                  </div>
                </RadioGroup>

                {response === 'yes' && (
                  <div className="space-y-2">
                    <Label htmlFor="guestCount" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Total guests (including yourself)
                    </Label>
                    <Input
                      id="guestCount"
                      type="number"
                      min="1"
                      max="10"
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                      className="text-base p-3"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="responseMessage">Optional Message</Label>
                  <Textarea
                    id="responseMessage"
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Add a note to the organizer..."
                    className="text-base p-3"
                  />
                </div>

                {!user && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Your Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="text-base p-3"
                    />
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={submitting || (!user && !email)}
                  className="w-full text-base p-3"
                >
                  {submitting ? 'Submitting...' : hasExistingRsvp ? 'UPDATE RSVP' : 'SUBMIT RSVP'}
                </Button>

                {!user && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Want to save places and manage your RSVPs?
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/auth')}
                      className="text-sm"
                    >
                      Sign Up Free
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};