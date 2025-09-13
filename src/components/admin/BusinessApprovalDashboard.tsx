import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  User
} from 'lucide-react';

interface Business {
  id: string;
  business_name: string;
  business_type: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  admin_notes?: string;
  user_id: string;
}

interface ApprovalActions {
  onApprove: (businessId: string, notes?: string) => void;
  onReject: (businessId: string, reason: string, notes?: string) => void;
}

const BusinessApprovalCard: React.FC<{ business: Business } & ApprovalActions> = ({
  business,
  onApprove,
  onReject
}) => {
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {business.business_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{business.business_type}</p>
          </div>
          {getStatusBadge(business.status)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {business.description && (
          <p className="text-sm">{business.description}</p>
        )}
        
        <div className="grid grid-cols-1 gap-4 text-sm">
          {business.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{business.email}</span>
            </div>
          )}
          {business.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{business.phone}</span>
            </div>
          )}
          {(business.address || business.city) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {business.address && `${business.address}, `}
                {business.city}{business.state && `, ${business.state}`}
                {business.country && `, ${business.country}`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Submitted: {new Date(business.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {business.rejection_reason && (
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Rejection Reason:</strong> {business.rejection_reason}
            </p>
          </div>
        )}

        {business.admin_notes && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Admin Notes:</strong> {business.admin_notes}
            </p>
          </div>
        )}

        {business.status === 'pending' && (
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => setShowApprovalForm(true)}
              className="w-full rounded-none"
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              onClick={() => setShowRejectionForm(true)}
              variant="destructive"
              className="w-full rounded-none"
              size="sm"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {showApprovalForm && (
          <div className="space-y-3 p-4 bg-green-50 rounded-lg">
            <textarea
              placeholder="Add approval notes (optional)..."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="w-full p-2 text-sm border rounded-none resize-none"
              rows={3}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  onApprove(business.id, approvalNotes);
                  setShowApprovalForm(false);
                  setApprovalNotes('');
                }}
                size="sm"
                className="w-full rounded-none"
              >
                Confirm Approval
              </Button>
              <Button
                onClick={() => {
                  setShowApprovalForm(false);
                  setApprovalNotes('');
                }}
                variant="outline"
                size="sm"
                className="w-full rounded-none"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {showRejectionForm && (
          <div className="space-y-3 p-4 bg-red-50 rounded-lg">
            <textarea
              placeholder="Reason for rejection (required)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2 text-sm border rounded-none resize-none"
              rows={2}
              required
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  if (rejectionReason.trim()) {
                    onReject(business.id, rejectionReason, approvalNotes);
                    setShowRejectionForm(false);
                    setRejectionReason('');
                    setApprovalNotes('');
                  }
                }}
                variant="destructive"
                size="sm"
                className="w-full rounded-none"
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </Button>
              <Button
                onClick={() => {
                  setShowRejectionForm(false);
                  setRejectionReason('');
                  setApprovalNotes('');
                }}
                variant="outline"
                size="sm"
                className="w-full rounded-none"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const BusinessApprovalDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch businesses: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (businessId: string, notes?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('approve_business', {
        business_id: businessId,
        admin_user_id: user.id,
        notes: notes || null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business approved successfully!",
      });

      fetchBusinesses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to approve business: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (businessId: string, reason: string, notes?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('reject_business', {
        business_id: businessId,
        admin_user_id: user.id,
        reason,
        notes: notes || null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business rejected successfully!",
      });

      fetchBusinesses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reject business: " + error.message,
        variant: "destructive",
      });
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    if (filter === 'all') return true;
    return business.status === filter;
  });

  const getStatusCount = (status: string) => {
    return businesses.filter(b => b.status === status).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading businesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Business Approval Dashboard</h1>
          <p className="text-muted-foreground">Review and manage business applications</p>
        </div>
        
        <div className="flex flex-col gap-2 w-full">
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            size="sm"
            className="w-full rounded-none"
          >
            Pending ({getStatusCount('pending')})
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
            size="sm"
            className="w-full rounded-none"
          >
            Approved ({getStatusCount('approved')})
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
            size="sm"
            className="w-full rounded-none"
          >
            Rejected ({getStatusCount('rejected')})
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
            className="w-full rounded-none"
          >
            All ({businesses.length})
          </Button>
        </div>
      </div>

      {filteredBusinesses.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No businesses found</h3>
          <p className="text-muted-foreground">
            {filter === 'pending' 
              ? "No businesses are currently pending approval." 
              : `No ${filter} businesses found.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBusinesses.map((business) => (
            <BusinessApprovalCard
              key={business.id}
              business={business}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
};