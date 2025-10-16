import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Eye, EyeOff, Trash2, Plus, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  subscriptionTier: string;
}

const APIKeyManagement: React.FC<APIKeyManagementProps> = ({ businessId, subscriptionTier }) => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string>('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (subscriptionTier === 'firstclass') {
      fetchAPIKeys();
    }
  }, [businessId, subscriptionTier]);

  const fetchAPIKeys = async () => {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      });
      return;
    }

    setApiKeys(data || []);
  };

  const generateAPIKey = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const createAPIKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key",
        variant: "destructive",
      });
      return;
    }

    const newKey = generateAPIKey();

    const { error } = await supabase
      .from('api_keys')
      .insert({
        business_id: businessId,
        name: newKeyName,
        key_hash: newKey,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
      return;
    }

    setNewlyCreatedKey(newKey);
    setShowNewKey(true);
    setNewKeyName('');
    fetchAPIKeys();

    toast({
      title: "Success",
      description: "API key created successfully",
    });
  };

  const deleteAPIKey = async (keyId: string) => {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
      return;
    }

    fetchAPIKeys();
    setDeleteKeyId(null);
    toast({
      title: "Success",
      description: "API key deleted",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const maskKey = (key: string) => {
    return key.substring(0, 8) + '•'.repeat(48) + key.substring(key.length - 8);
  };

  if (subscriptionTier !== 'firstclass') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>Upgrade to First Class to access the API</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            API access is only available for First Class subscribers. Upgrade your plan to generate API keys and integrate your business data with external systems.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showNewKey && newlyCreatedKey && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              New API Key Created
            </CardTitle>
            <CardDescription>
              Copy this key now. You won't be able to see it again!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newlyCreatedKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={() => copyToClipboard(newlyCreatedKey)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => setShowNewKey(false)} className="w-full">
              I've Saved My Key
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create New API Key</CardTitle>
          <CardDescription>
            Generate a new API key for your integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyName">Key Name</Label>
            <Input
              id="keyName"
              placeholder="e.g., Production App, Analytics Dashboard"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
          </div>
          <Button onClick={createAPIKey} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Manage your existing API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No API keys yet. Create one to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <Card key={key.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{key.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Created: {new Date(key.created_at).toLocaleDateString()}
                          </p>
                          {key.last_used_at && (
                            <p className="text-sm text-muted-foreground">
                              Last used: {new Date(key.last_used_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Badge variant={key.is_active ? "default" : "secondary"}>
                          {key.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Input
                          value={visibleKeys.has(key.id) ? key.key_hash : maskKey(key.key_hash)}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleKeyVisibility(key.id)}
                        >
                          {visibleKeys.has(key.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(key.key_hash)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeleteKeyId(key.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Rate limit: {key.rate_limit_per_minute} requests per minute
                      </p>
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
          <CardDescription>
            Available endpoints and usage examples
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Base URL:</h4>
            <code className="block bg-muted p-2 text-sm">
              {import.meta.env.VITE_SUPABASE_URL}/functions/v1/business-api
            </code>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Authentication:</h4>
            <p className="text-sm text-muted-foreground">
              Include your API key in the <code>X-API-Key</code> header
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Endpoints:</h4>
            
            <div className="space-y-1">
              <code className="block bg-muted p-2 text-sm">GET /business</code>
              <p className="text-sm text-muted-foreground">Get your business profile data</p>
            </div>

            <div className="space-y-1">
              <code className="block bg-muted p-2 text-sm">GET /analytics?days=30</code>
              <p className="text-sm text-muted-foreground">Get analytics summary</p>
            </div>

            <div className="space-y-1">
              <code className="block bg-muted p-2 text-sm">GET /vouchers</code>
              <p className="text-sm text-muted-foreground">List all vouchers</p>
            </div>

            <div className="space-y-1">
              <code className="block bg-muted p-2 text-sm">POST /vouchers</code>
              <p className="text-sm text-muted-foreground">Create a new voucher</p>
            </div>

            <div className="space-y-1">
              <code className="block bg-muted p-2 text-sm">GET /gift-cards</code>
              <p className="text-sm text-muted-foreground">List all gift cards</p>
            </div>

            <div className="space-y-1">
              <code className="block bg-muted p-2 text-sm">GET /visits</code>
              <p className="text-sm text-muted-foreground">Get member visit history</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Example Request:</h4>
            <pre className="bg-muted p-3 text-xs overflow-x-auto">
{`curl -X GET \\
  ${import.meta.env.VITE_SUPABASE_URL}/functions/v1/business-api/business \\
  -H "X-API-Key: YOUR_API_KEY_HERE"`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteKeyId !== null} onOpenChange={() => setDeleteKeyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this API key. Any applications using this key will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteKeyId && deleteAPIKey(deleteKeyId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export { APIKeyManagement };