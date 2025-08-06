import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Copy, Mail, MessageCircle, X } from 'lucide-react';
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
  const [groupName, setGroupName] = useState('');
  const [proposedDate, setProposedDate] = useState<Date>();
  const [rsvpDeadline, setRsvpDeadline] = useState<Date>();
  const [customMessage, setCustomMessage] = useState('Hey friends! Want to join me at this great place I found?');
  const [emails, setEmails] = useState('');
  
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

      toast.success('Invitation created successfully!');
      onOpenChange(false);
      
      // Reset form
      setGroupName('');
      setProposedDate(undefined);
      setRsvpDeadline(undefined);
      setCustomMessage('Hey friends! Want to join me at this great place I found?');
      setEmails('');
      
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Plan a Trip With Friends</DialogTitle>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onOpenChange(false)}
            className="h-12 w-12 p-0 border-2 hover:bg-gray-100 sm:h-10 sm:w-10"
          >
            <X className="h-8 w-8 sm:h-6 sm:w-6" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Business */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">Selected Place</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{restaurant.restaurant_name}</p>
              <p className="text-muted-foreground">{restaurant.restaurant_address}</p>
              <p className="text-muted-foreground">{restaurant.city}, {restaurant.country}</p>
            </div>
          </div>

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
              Email Addresses
            </Label>
            <Textarea
              id="emails"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="min-h-[80px] text-base p-3"
              placeholder="Enter email addresses separated by commas..."
            />
            <p className="text-sm text-muted-foreground">
              Separate multiple emails with commas. Non-members will be prompted to sign up.
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
              onClick={() => onOpenChange(false)}
              className="flex-1 text-base p-3"
            >
              CANCEL
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};