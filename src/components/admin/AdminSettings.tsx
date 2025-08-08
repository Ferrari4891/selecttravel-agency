import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Shield, Mail, Database, Users, Sliders } from 'lucide-react';
import { AmenityManagement } from './AmenityManagement';

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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="admin">Admin Management</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="admin" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Grant Administrator Access
                </CardTitle>
                <CardDescription className="text-sm">
                  Promote existing platform users to administrator status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-sm font-medium">
                      User Email Address
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="user@example.com"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="flex-1"
                        disabled={loading}
                      />
                      <Button 
                        type="submit" 
                        disabled={loading || !newAdminEmail.trim()}
                        className="min-w-[120px]"
                      >
                        {loading ? 'Granting...' : 'Grant Access'}
                      </Button>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0"></div>
                      <p className="text-xs text-muted-foreground">
                        The user must have an existing account on the platform before admin privileges can be granted.
                      </p>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-muted">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-orange-500" />
                  Administrator Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      Administrators have full access to all platform features and user data
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      Admin privileges cannot be revoked through this interface - contact system administrator
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      Only grant admin access to trusted team members
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="amenities" className="space-y-4">
          <AmenityManagement />
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