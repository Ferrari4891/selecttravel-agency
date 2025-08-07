import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Shield, Mail, Database, Users } from 'lucide-react';

export const AdminSettings = () => {
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('set_admin_by_email', {
        user_email: newAdminEmail
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Admin privileges granted to ${newAdminEmail}`,
      });
      setNewAdminEmail('');
    } catch (error) {
      console.error('Error creating admin:', error);
      toast({
        title: "Error",
        description: "Failed to grant admin privileges. User may not exist.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const SystemSetting = ({ title, description, value, onToggle }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: (value: boolean) => void;
  }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-1">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
      <Switch checked={value} onCheckedChange={onToggle} />
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="admin" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="admin">Admin Management</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Administrator Management
              </CardTitle>
              <CardDescription>
                Manage administrator privileges and access control.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <Label htmlFor="admin-email">Grant Admin Privileges</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="Enter user email address"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                    />
                    <Button type="submit" disabled={loading || !newAdminEmail}>
                      {loading ? 'Processing...' : 'Grant Admin'}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    User must be registered on the platform first.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Configure platform-wide settings and features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SystemSetting
                title="User Registration"
                description="Allow new users to register accounts"
                value={true}
                onToggle={(value) => toast({ title: "Setting Updated", description: `User registration ${value ? 'enabled' : 'disabled'}` })}
              />
              <SystemSetting
                title="Business Registration"
                description="Allow new business account creation"
                value={true}
                onToggle={(value) => toast({ title: "Setting Updated", description: `Business registration ${value ? 'enabled' : 'disabled'}` })}
              />
              <SystemSetting
                title="Email Notifications"
                description="Send system notification emails"
                value={true}
                onToggle={(value) => toast({ title: "Setting Updated", description: `Email notifications ${value ? 'enabled' : 'disabled'}` })}
              />
              <SystemSetting
                title="Maintenance Mode"
                description="Enable maintenance mode for system updates"
                value={false}
                onToggle={(value) => toast({ title: "Setting Updated", description: `Maintenance mode ${value ? 'enabled' : 'disabled'}` })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security policies and access controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SystemSetting
                title="Two-Factor Authentication"
                description="Require 2FA for admin accounts"
                value={false}
                onToggle={(value) => toast({ title: "Setting Updated", description: `2FA requirement ${value ? 'enabled' : 'disabled'}` })}
              />
              <SystemSetting
                title="Email Verification"
                description="Require email verification for new accounts"
                value={true}
                onToggle={(value) => toast({ title: "Setting Updated", description: `Email verification ${value ? 'enabled' : 'disabled'}` })}
              />
              <SystemSetting
                title="Rate Limiting"
                description="Enable API rate limiting"
                value={true}
                onToggle={(value) => toast({ title: "Setting Updated", description: `Rate limiting ${value ? 'enabled' : 'disabled'}` })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Management
              </CardTitle>
              <CardDescription>
                Database utilities and maintenance tools.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start p-4 h-auto">
                  <Database className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Backup Database</div>
                    <div className="text-xs text-muted-foreground">Create a full database backup</div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start p-4 h-auto">
                  <Settings className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Cleanup Logs</div>
                    <div className="text-xs text-muted-foreground">Remove old system logs</div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start p-4 h-auto">
                  <Settings className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Optimize Performance</div>
                    <div className="text-xs text-muted-foreground">Run database optimization</div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start p-4 h-auto">
                  <Database className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Export Data</div>
                    <div className="text-xs text-muted-foreground">Export system data</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};