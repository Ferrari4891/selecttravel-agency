import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Copy, Mail, MessageCircle, X, Share2, Send, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SavedRestaurant {
  id: string;
  restaurant_name: string;
  restaurant_address: string;
  city: string;
  country: string;
  restaurant_data: any;
}

interface CreateInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: SavedRestaurant;
}

export const CreateInvitationDialog = ({ open, onOpenChange, restaurant }: CreateInvitationDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'create' | 'share'>('create');
  const [createdInvitation, setCreatedInvitation] = useState<any>(null);
  const [groupName, setGroupName] = useState('');
  const [proposedDate, setProposedDate] = useState<Date>();
  const [rsvpDeadline, setRsvpDeadline] = useState<Date>();
  const [customMessage, setCustomMessage] = useState('Hey friends! Want to join me at this great place I found?');
  const [emails, setEmails] = useState('');
  const [sendingEmails, setSendingEmails] = useState(false);
  
  const handleSubmit = async () => {
    if (!user || !groupName || !proposedDate || !rsvpDeadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (rsvpDeadline >= proposedDate) {
      toast.error('RSVP deadline must be before the proposed date');
      return;
    }

    setLoading(true);
    
    try {
      // Create the invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('group_invitations')
        .insert({
          creator_id: user.id,
          group_name: groupName,
          saved_restaurant_id: restaurant.id,
          proposed_date: proposedDate.toISOString(),
          rsvp_deadline: rsvpDeadline.toISOString(),
          custom_message: customMessage
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Create RSVP entries for each email
      if (emails.trim()) {
        const emailList = emails.split(',').map(email => email.trim()).filter(email => email);
        const rsvpPromises = emailList.map(email => 
          supabase.from('invitation_rsvps').insert({
            invitation_id: invitation.id,
            invitee_email: email,
            response: 'pending'
          })
        );
        
        await Promise.all(rsvpPromises);
      }

      setCreatedInvitation(invitation);
      setStep('share');
      toast.success('Invitation created successfully!');
      
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast.error('Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const generateInviteLink = (token: string) => {
    return `${window.location.origin}/rsvp/${token}`;
  };

  const copyInviteLink = () => {
    if (!createdInvitation) return;
    const link = generateInviteLink(createdInvitation.invite_token);
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard!');
  };

  const shareViaWhatsApp = () => {
    if (!createdInvitation || !restaurant) return;
    const link = generateInviteLink(createdInvitation.invite_token);
    const message = `🎉 You're invited to ${groupName}!\n\n📍 ${restaurant.restaurant_name}\n📅 ${format(proposedDate!, 'PPP')}\n\n${customMessage}\n\nRSVP here: ${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendEmailInvitations = async () => {
    if (!createdInvitation || !emails.trim() || !restaurant) return;

    setSendingEmails(true);
    try {
      const emailList = emails.split(',').map(email => email.trim()).filter(email => email);
      
      const response = await supabase.functions.invoke('send-invitation-emails', {
        body: {
          invitationId: createdInvitation.id,
          groupName,
          restaurantName: restaurant.restaurant_name,
          restaurantAddress: restaurant.restaurant_address,
          city: restaurant.city,
          country: restaurant.country,
          proposedDate: proposedDate!.toISOString(),
          rsvpDeadline: rsvpDeadline!.toISOString(),
          customMessage,
          inviteToken: createdInvitation.invite_token,
          creatorEmail: user!.email,
          recipientEmails: emailList,
        },
      });

      if (response.error) throw response.error;

      toast.success(`Email invitations sent to ${emailList.length} recipients!`);
    } catch (error) {
      console.error('Error sending email invitations:', error);
      toast.error('Failed to send email invitations');
    } finally {
      setSendingEmails(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset all state when closing
    setTimeout(() => {
      setStep('create');
      setCreatedInvitation(null);
      setGroupName('');
      setProposedDate(undefined);
      setRsvpDeadline(undefined);
      setCustomMessage('Hey friends! Want to join me at this great place I found?');
      setEmails('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            {step === 'create' ? 'Plan a Trip With Friends' : 'Share Your Invitation'}
          </DialogTitle>
          <Button
            variant="outline"
            size="lg"
            onClick={handleClose}
            className="h-12 w-12 p-0 border-2 hover:bg-gray-100 sm:h-10 sm:w-10"
          >
            <X className="h-8 w-8 sm:h-6 sm:w-6" />
          </Button>
        </DialogHeader>

        {step === 'create' ? (
          <div className="space-y-6">
            {/* Selected Business */}
            {restaurant && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Selected Place</h3>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{restaurant.restaurant_name}</p>
                  <p className="text-muted-foreground">{restaurant.restaurant_address}</p>
                  <p className="text-muted-foreground">{restaurant.city}, {restaurant.country}</p>
                </div>
              </div>
            )}

            {/* Group Name */}
            <div className="space-y-2">
              <Label htmlFor="groupName" className="text-base font-medium">
                Group/Trip Name *
              </Label>
              <Input
                id="groupName"
                placeholder="e.g., Birthday Dinner in Miami"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="text-base p-3"
              />
            </div>

            {/* Proposed Date */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Proposed Date & Time *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal text-base p-3",
                      !proposedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {proposedDate ? format(proposedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={proposedDate}
                    onSelect={setProposedDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* RSVP Deadline */}
            <div className="space-y-2">
              <Label className="text-base font-medium">RSVP By Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal text-base p-3",
                      !rsvpDeadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rsvpDeadline ? format(rsvpDeadline, "PPP") : <span>Pick deadline</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={rsvpDeadline}
                    onSelect={setRsvpDeadline}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Custom Message */}
            <div className="space-y-2">
              <Label htmlFor="customMessage" className="text-base font-medium">
                Custom Message
              </Label>
              <Textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[100px] text-base p-3"
                placeholder="Add a personal message to your invitation..."
              />
            </div>

            {/* Email Invites */}
            <div className="space-y-2">
              <Label htmlFor="emails" className="text-base font-medium">
                Email Addresses (Optional)
              </Label>
              <Textarea
                id="emails"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="min-h-[80px] text-base p-3"
                placeholder="Enter email addresses separated by commas..."
              />
              <p className="text-sm text-muted-foreground">
                You can send email invitations after creating the invitation.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading || !groupName || !proposedDate || !rsvpDeadline}
                className="flex-1 text-base p-3"
              >
                {loading ? 'Creating...' : 'CREATE INVITATION'}
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 text-base p-3"
              >
                CANCEL
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Invitation Created!</h3>
              <p className="text-green-700">Your invitation for "{groupName}" is ready to share.</p>
            </div>

            {/* Invitation Summary */}
            {restaurant && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-3">Invitation Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event:</span>
                    <span className="font-medium">{groupName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Place:</span>
                    <span className="font-medium">{restaurant.restaurant_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{proposedDate && format(proposedDate, 'PPP')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RSVP by:</span>
                    <span className="font-medium">{rsvpDeadline && format(rsvpDeadline, 'PPP')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sharing Options */}
            <div className="space-y-4">
              <h3 className="font-semibold">Share Your Invitation</h3>
              
              <div className="grid gap-3">
                {/* Copy Link */}
                <Button
                  variant="outline"
                  onClick={copyInviteLink}
                  className="w-full text-base p-4 justify-start"
                >
                  <Copy className="mr-3 h-5 w-5" />
                  Copy Invitation Link
                </Button>

                {/* WhatsApp */}
                <Button
                  variant="outline"
                  onClick={shareViaWhatsApp}
                  className="w-full text-base p-4 justify-start bg-green-50 hover:bg-green-100 border-green-200"
                >
                  <MessageCircle className="mr-3 h-5 w-5 text-green-600" />
                  Share via WhatsApp
                </Button>

                {/* Email Invitations */}
                {emails.trim() && (
                  <Button
                    variant="outline"
                    onClick={sendEmailInvitations}
                    disabled={sendingEmails}
                    className="w-full text-base p-4 justify-start bg-blue-50 hover:bg-blue-100 border-blue-200"
                  >
                    <Mail className="mr-3 h-5 w-5 text-blue-600" />
                    {sendingEmails ? 'Sending Emails...' : `Send Email Invitations (${emails.split(',').length})`}
                  </Button>
                )}
              </div>

              {/* Manual Email Input */}
              {!emails.trim() && (
                <div className="space-y-2">
                  <Label className="text-base font-medium">Send Email Invitations</Label>
                  <div className="flex gap-2">
                    <Textarea
                      value={emails}
                      onChange={(e) => setEmails(e.target.value)}
                      placeholder="Enter email addresses separated by commas..."
                      className="flex-1 text-base"
                    />
                  </div>
                  {emails.trim() && (
                    <Button
                      onClick={sendEmailInvitations}
                      disabled={sendingEmails}
                      className="w-full"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {sendingEmails ? 'Sending...' : 'Send Email Invitations'}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleClose}
                className="flex-1 text-base p-3"
              >
                DONE
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`/rsvp/${createdInvitation?.invite_token}`, '_blank')}
                className="flex-1 text-base p-3"
              >
                VIEW RSVP PAGE
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};