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
    <div className="space-y-4">
      {invitations.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-base font-semibold mb-2">No invitations yet</h3>
            <p className="text-sm text-muted-foreground">
              Start planning with friends
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => {
            const responseCounts = getResponseCounts(invitation.invitation_rsvps);
            const totalGuests = invitation.invitation_rsvps
              .filter(rsvp => rsvp.response === 'yes')
              .reduce((sum, rsvp) => sum + rsvp.guest_count, 0);

            return (
              <Card key={invitation.id}>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{invitation.group_name}</CardTitle>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm truncate">{invitation.venues.business_name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {invitation.venues.address}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(invitation.status, invitation.rsvp_deadline)} className="text-xs">
                      {getStatusText(invitation.status, invitation.rsvp_deadline)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-3">
                  {/* Date Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium">Event</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(invitation.proposed_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* RSVP Summary */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Responses</h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        ✓ {responseCounts.yes}
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                        ? {responseCounts.maybe}
                      </Badge>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                        ✗ {responseCounts.no}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                        ⏳ {responseCounts.pending}
                      </Badge>
                    </div>
                  </div>

                  {/* Individual Responses - Compact */}
                  {invitation.invitation_rsvps.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Details</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {invitation.invitation_rsvps.slice(0, 3).map((rsvp) => (
                          <div key={rsvp.id} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{rsvp.invitee_email}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {rsvp.response === 'yes' && rsvp.guest_count > 1 && (
                                <Badge variant="outline" className="text-xs">
                                  {rsvp.guest_count}
                                </Badge>
                              )}
                              <Badge 
                                variant={rsvp.response === 'yes' ? 'default' : 'outline'}
                                className={`text-xs ${
                                  rsvp.response === 'yes' ? 'bg-green-100 text-green-800' :
                                  rsvp.response === 'no' ? 'bg-red-100 text-red-800' :
                                  rsvp.response === 'maybe' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {rsvp.response.charAt(0).toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {invitation.invitation_rsvps.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{invitation.invitation_rsvps.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyInviteLink(invitation.invite_token)}
                      className="flex-1 text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="flex-1 text-xs"
                    >
                      <a 
                        href={`/rsvp/${invitation.invite_token}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};