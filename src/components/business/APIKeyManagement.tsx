import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Eye, EyeOff, Key, Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface APIKey {
  id: string;
  name: string;
  key_hash: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
  rate_limit_per_minute: number;
}

interface APIKeyManagementProps {
  businessId: string;
}

export const APIKeyManagement: React.FC<APIKeyManagementProps> = ({ businessId }) => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newGeneratedKey, setNewGeneratedKey] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchAPIKeys();
  }, [businessId]);

  const fetchAPIKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAPIKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate a secure random API key
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const apiKey = 'sk_' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

      // Hash the key for storage
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { error } = await supabase
        .from('api_keys')
        .insert([{
          business_id: businessId,
          name: newKeyName,
          key_hash: keyHash,
        }]);

      if (error) throw error;

      setNewGeneratedKey(apiKey);
      setShowNewKeyDialog(true);
      setNewKeyName('');
      fetchAPIKeys();

      toast({
        title: "Success",
        description: "API key generated successfully",
      });
    } catch (error) {
      console.error('Error generating API key:', error);
      toast({
        title: "Error",
        description: "Failed to generate API key",
        variant: "destructive",
      });
    }
  };

  const deleteAPIKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      fetchAPIKeys();
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  if (loading) {
    return <div className="p-6">Loading API keys...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Access
          </CardTitle>
          <CardDescription>
            Manage API keys for programmatic access to your business data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1">
              <Label htmlFor="keyName">API Key Name</Label>
              <Input
                id="keyName"
                placeholder="e.g., Production Server, Mobile App"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={generateAPIKey}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Key
              </Button>
            </div>
          </div>

          {apiKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No API keys yet. Generate one to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <Card key={key.id}>
                  <CardContent className="pt-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{key.name}</h4>
                          <Badge variant={key.is_active ? 'default' : 'secondary'}>
                            {key.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-xs bg-muted px-2 py-1">
                            {visibleKeys.has(key.id) 
                              ? key.key_hash.substring(0, 16) + '...' 
                              : '••••••••••••••••'}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(key.id)}
                          >
                            {visibleKeys.has(key.id) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Created: {new Date(key.created_at).toLocaleDateString()}</p>
                          {key.last_used_at && (
                            <p>Last used: {new Date(key.last_used_at).toLocaleDateString()}</p>
                          )}
                          <p>Rate limit: {key.rate_limit_per_minute} requests/minute</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAPIKey(key.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Base URL</h4>
            <code className="text-sm bg-muted px-2 py-1 block break-all">
              https://urczlhjnztiaxdsatueu.supabase.co/functions/v1/business-api
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Authentication</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Include your API key in the request header:
            </p>
            <code className="text-sm bg-muted px-2 py-1 block">
              x-api-key: your_api_key_here
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Available Endpoints</h4>
            <div className="space-y-3 text-sm">
              <div className="border-l-2 border-primary pl-3">
                <code className="font-medium">GET /business</code>
                <p className="text-muted-foreground mt-1">Get your business profile data</p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <code className="font-medium">GET /analytics?days=30</code>
                <p className="text-muted-foreground mt-1">Get analytics summary (optional: days parameter)</p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <code className="font-medium">GET /vouchers</code>
                <p className="text-muted-foreground mt-1">List all vouchers</p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <code className="font-medium">POST /vouchers</code>
                <p className="text-muted-foreground mt-1">Create a new voucher</p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <code className="font-medium">PATCH /vouchers/:id</code>
                <p className="text-muted-foreground mt-1">Update a voucher</p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <code className="font-medium">GET /gift-cards</code>
                <p className="text-muted-foreground mt-1">List all gift cards</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Example Request</h4>
            <pre className="text-xs bg-muted p-3 overflow-x-auto">
{`curl -X GET \\
  https://urczlhjnztiaxdsatueu.supabase.co/functions/v1/business-api/analytics \\
  -H "x-api-key: your_api_key_here"`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Generated</DialogTitle>
            <DialogDescription>
              Save this API key now. You won't be able to see it again!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Your API Key</Label>
              <div className="flex gap-2 mt-2">
                <Input value={newGeneratedKey} readOnly className="font-mono text-sm" />
                <Button onClick={() => copyToClipboard(newGeneratedKey)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This key provides full access to your business data via the API. Keep it secure and never share it publicly.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
