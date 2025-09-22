import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Shield, Mail, Database, Users, Sliders, Gift } from 'lucide-react';
import { AmenityManagement } from './AmenityManagement';
import { EnhancedSubscriptionManagement } from './EnhancedSubscriptionManagement';
import { PriceLevelManagement } from './PriceLevelManagement';
import { TestMarketDashboard } from './TestMarketDashboard';
import { GiftCardManagement } from './GiftCardManagement';

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
    <div className="space-y-4">
      <Tabs defaultValue="admin" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 gap-1 h-auto bg-transparent p-0 md:grid-cols-3 lg:grid-cols-4">
          <TabsTrigger value="admin" className="text-xs md:text-sm p-2 md:p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            Admin
          </TabsTrigger>
          <TabsTrigger value="amenities" className="text-xs md:text-sm p-2 md:p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Sliders className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            Amenities
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="text-xs md:text-sm p-2 md:p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="giftcards" className="text-xs md:text-sm p-2 md:p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Gift className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            Gift Cards
          </TabsTrigger>
          <TabsTrigger value="testmarket" className="text-xs md:text-sm p-2 md:p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Database className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            Test Market
          </TabsTrigger>
          <TabsTrigger value="system" className="text-xs md:text-sm p-2 md:p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Database className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            System
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs md:text-sm p-2 md:p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            Security
          </TabsTrigger>
          <TabsTrigger value="database" className="text-xs md:text-sm p-2 md:p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Database className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            Database
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                Grant Administrator Access
              </CardTitle>
              <CardDescription className="text-sm">
                Promote existing platform users to administrator status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-sm font-medium">
                    User Email Address
                  </Label>
                  <div className="flex flex-col gap-2 md:flex-row md:gap-3">
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
                      className="w-full md:w-auto md:min-w-[120px]"
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
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                Administrator Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
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
        </TabsContent>

        <TabsContent value="amenities" className="space-y-4">
          <AmenityManagement />
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <EnhancedSubscriptionManagement />
        </TabsContent>

        <TabsContent value="giftcards" className="space-y-4">
          <GiftCardManagement />
        </TabsContent>

        <TabsContent value="testmarket" className="space-y-4">
          <TestMarketDashboard />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="space-y-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Settings className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Registration Settings
                </CardTitle>
                <CardDescription className="text-sm">
                  Control user and business account creation
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <SystemSetting
                  title="User Registration"
                  description="Allow new users to create personal accounts"
                  value={true}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `User registration ${value ? 'enabled' : 'disabled'}` })}
                />
                <SystemSetting
                  title="Business Registration"
                  description="Allow new business account creation and listings"
                  value={true}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `Business registration ${value ? 'enabled' : 'disabled'}` })}
                />
                <SystemSetting
                  title="Email Verification Required"
                  description="Require email verification for new account activations"
                  value={true}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `Email verification ${value ? 'required' : 'optional'}` })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Mail className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Communication Settings
                </CardTitle>
                <CardDescription className="text-sm">
                  Configure email notifications and messaging
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <SystemSetting
                  title="Email Notifications"
                  description="Send automated system notification emails to users"
                  value={true}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `Email notifications ${value ? 'enabled' : 'disabled'}` })}
                />
                <SystemSetting
                  title="Marketing Emails"
                  description="Allow sending promotional and marketing emails"
                  value={true}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `Marketing emails ${value ? 'enabled' : 'disabled'}` })}
                />
                <SystemSetting
                  title="SMS Notifications"
                  description="Enable SMS notifications for critical updates"
                  value={false}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `SMS notifications ${value ? 'enabled' : 'disabled'}` })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  API & Security Settings
                </CardTitle>
                <CardDescription className="text-sm">
                  Configure API access and security policies
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <SystemSetting
                  title="API Rate Limiting"
                  description="Enable rate limiting for API endpoints"
                  value={true}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `API rate limiting ${value ? 'enabled' : 'disabled'}` })}
                />
                <SystemSetting
                  title="Public API Access"
                  description="Allow public access to read-only API endpoints"
                  value={true}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `Public API access ${value ? 'enabled' : 'disabled'}` })}
                />
                <SystemSetting
                  title="Two-Factor Authentication"
                  description="Require 2FA for admin and business accounts"
                  value={false}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `2FA requirement ${value ? 'enabled' : 'disabled'}` })}
                />
                <SystemSetting
                  title="Session Security"
                  description="Enable enhanced session security and timeout"
                  value={true}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `Session security ${value ? 'enabled' : 'disabled'}` })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Database className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Content & Data Management
                </CardTitle>
                <CardDescription className="text-sm">
                  Configure content moderation and data handling
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <SystemSetting
                  title="Content Moderation"
                  description="Enable automatic content moderation for user submissions"
                  value={true}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `Content moderation ${value ? 'enabled' : 'disabled'}` })}
                />
                <SystemSetting
                  title="Image Upload Compression"
                  description="Automatically compress uploaded images"
                  value={true}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `Image compression ${value ? 'enabled' : 'disabled'}` })}
                />
                <SystemSetting
                  title="Data Export"
                  description="Allow users to export their personal data"
                  value={true}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `Data export ${value ? 'enabled' : 'disabled'}` })}
                />
                <SystemSetting
                  title="Auto Backup"
                  description="Enable automatic daily database backups"
                  value={true}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `Auto backup ${value ? 'enabled' : 'disabled'}` })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Sliders className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Performance & Features
                </CardTitle>
                <CardDescription className="text-sm">
                  Configure platform features and performance settings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <SystemSetting
                  title="Caching"
                  description="Enable server-side caching for improved performance"
                  value={true}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `Caching ${value ? 'enabled' : 'disabled'}` })}
                />
                <SystemSetting
                  title="Search Analytics"
                  description="Track user search patterns and analytics"
                  value={true}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `Search analytics ${value ? 'enabled' : 'disabled'}` })}
                />
                <SystemSetting
                  title="Real-time Updates"
                  description="Enable real-time data synchronization"
                  value={true}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `Real-time updates ${value ? 'enabled' : 'disabled'}` })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Settings className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
                  System Status
                </CardTitle>
                <CardDescription className="text-sm">
                  Control platform availability and maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <SystemSetting
                  title="Maintenance Mode"
                  description="Enable maintenance mode to restrict access during system updates"
                  value={false}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `Maintenance mode ${value ? 'enabled' : 'disabled'}` })}
                />
                <SystemSetting
                  title="Debug Mode"
                  description="Enable debug logging and error reporting"
                  value={false}
                  onToggle={(value) => toast({ title: "Setting Updated", description: `Debug mode ${value ? 'enabled' : 'disabled'}` })}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Shield className="h-4 w-4 md:h-5 md:w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security policies and access controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
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

        <TabsContent value="testmarket" className="space-y-4">
          <TestMarketDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};