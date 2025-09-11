import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Clock, MapPin, Edit, Trash2, ExternalLink, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface GroupInvitation {
  id: string;
  group_name: string;
  proposed_date: string;
  rsvp_deadline: string;
  custom_message: string;
  status: string;
  invite_token: string;
  created_at: string;
  venues: {
    business_name: string;
    address: string;
  };
  invitation_rsvps: Array<{
    id: string;
    invitee_email: string;
    response: string;
    guest_count: number;
    response_message: string;
    responded_at: string;
  }>;
}

export const MyInvitations = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadInvitations();
    }
  }, [user]);

  const loadInvitations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('group_invitations')
        .select(`
          *,
          venues (
            business_name,
            address
          ),
          invitation_rsvps (
            id,
            invitee_email,
            response,
            guest_count,
            response_message,
            responded_at
          )
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/rsvp/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard!');
  };

  const getResponseCounts = (rsvps: any[]) => {
    const counts = { yes: 0, no: 0, maybe: 0, pending: 0 };
    rsvps.forEach(rsvp => {
      counts[rsvp.response as keyof typeof counts]++;
    });
    return counts;
  };

  const getStatusColor = (status: string, deadline: string) => {
    if (status === 'cancelled') return 'destructive';
    if (new Date() > new Date(deadline)) return 'secondary';
    return 'default';
  };

  const getStatusText = (status: string, deadline: string) => {
    if (status === 'cancelled') return 'Cancelled';
    if (new Date() > new Date(deadline)) return 'Expired';
    return 'Active';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded"></div>
        <div className="h-32 bg-muted animate-pulse rounded"></div>
        <div className="h-32 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No invitations yet</h3>
          <p className="text-muted-foreground">
            Start planning trips with friends by creating your first group invitation from your saved places!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Invitations</h2>
        <Badge variant="outline">{invitations.length} total</Badge>
      </div>

      <div className="grid gap-6">
        {invitations.map((invitation) => {
          const responseCounts = getResponseCounts(invitation.invitation_rsvps);
          const totalGuests = invitation.invitation_rsvps
            .filter(rsvp => rsvp.response === 'yes')
            .reduce((sum, rsvp) => sum + rsvp.guest_count, 0);

          return (
            <Card key={invitation.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{invitation.group_name}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{invitation.venues.business_name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invitation.venues.address}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(invitation.status, invitation.rsvp_deadline)}>
                    {getStatusText(invitation.status, invitation.rsvp_deadline)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Date & Time Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Event Date</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invitation.proposed_date), 'PPP')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">RSVP Deadline</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invitation.rsvp_deadline), 'PPP')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* RSVP Summary */}
                <div className="space-y-2">
                  <h4 className="font-medium">RSVP Responses</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      ✓ {responseCounts.yes} Yes ({totalGuests} guests)
                    </Badge>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      ? {responseCounts.maybe} Maybe
                    </Badge>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      ✗ {responseCounts.no} No
                    </Badge>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      ⏳ {responseCounts.pending} Pending
                    </Badge>
                  </div>
                </div>

                {/* Individual Responses */}
                {invitation.invitation_rsvps.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Individual Responses</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {invitation.invitation_rsvps.map((rsvp) => (
                        <div key={rsvp.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <div>
                            <p className="text-sm font-medium">{rsvp.invitee_email}</p>
                            {rsvp.response_message && (
                              <p className="text-xs text-muted-foreground">"{rsvp.response_message}"</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {rsvp.response === 'yes' && rsvp.guest_count > 1 && (
                              <Badge variant="outline" className="text-xs">
                                {rsvp.guest_count} guests
                              </Badge>
                            )}
                            <Badge 
                              variant={rsvp.response === 'yes' ? 'default' : 'outline'}
                              className={
                                rsvp.response === 'yes' ? 'bg-green-100 text-green-800' :
                                rsvp.response === 'no' ? 'bg-red-100 text-red-800' :
                                rsvp.response === 'maybe' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {rsvp.response.charAt(0).toUpperCase() + rsvp.response.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyInviteLink(invitation.invite_token)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                  >
                    <a 
                      href={`/rsvp/${invitation.invite_token}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View RSVP Page
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit (Coming Soon)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};