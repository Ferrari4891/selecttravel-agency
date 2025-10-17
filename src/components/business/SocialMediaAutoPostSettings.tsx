import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Share2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SocialMediaAutoPostSettings({ businessId }: { businessId: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    auto_post_enabled: false,
    platforms: [] as string[],
    post_template: "Check out our new offer: {voucher_title} - {discount}! Valid until {expiry}.",
    include_voucher_code: true,
    include_business_link: true,
  });

  useEffect(() => {
    fetchSettings();
    fetchRecentPosts();
  }, [businessId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("social_media_auto_post_settings")
        .select("*")
        .eq("business_id", businessId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          auto_post_enabled: data.auto_post_enabled,
          platforms: data.platforms || [],
          post_template: data.post_template,
          include_voucher_code: data.include_voucher_code,
          include_business_link: data.include_business_link,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("social_media_posts")
        .select(`
          *,
          business_vouchers(title)
        `)
        .eq("business_id", businessId)
        .order("posted_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentPosts(data || []);
    } catch (error: any) {
      console.error("Error fetching recent posts:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("social_media_auto_post_settings")
        .upsert({
          business_id: businessId,
          auto_post_enabled: settings.auto_post_enabled,
          platforms: settings.platforms,
          post_template: settings.post_template,
          include_voucher_code: settings.include_voucher_code,
          include_business_link: settings.include_business_link,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Auto-post settings saved",
      });

      fetchSettings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePlatform = (platform: string) => {
    setSettings((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Auto-Post Settings</CardTitle>
          <CardDescription>
            Automatically post new vouchers to your social media accounts
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Auto-Posting</Label>
              <p className="text-sm text-muted-foreground">
                Automatically post when you create a new voucher
              </p>
            </div>
            <Switch
              checked={settings.auto_post_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, auto_post_enabled: checked })
              }
            />
          </div>

          <div className="space-y-4">
            <Label>Platforms</Label>
            <div className="space-y-2">
              {["facebook", "instagram", "twitter"].map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform}
                    checked={settings.platforms.includes(platform)}
                    onCheckedChange={() => togglePlatform(platform)}
                  />
                  <label
                    htmlFor={platform}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                  >
                    {platform}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Post Template</Label>
            <p className="text-sm text-muted-foreground">
              Use {"{voucher_title}"}, {"{discount}"}, {"{expiry}"}, {"{business_name}"}
            </p>
            <Textarea
              value={settings.post_template}
              onChange={(e) =>
                setSettings({ ...settings, post_template: e.target.value })
              }
              rows={4}
              className="mt-2"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Include Voucher Code</Label>
              <Switch
                checked={settings.include_voucher_code}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, include_voucher_code: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Include Business Link</Label>
              <Switch
                checked={settings.include_business_link}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, include_business_link: checked })
                }
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {recentPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Your latest auto-posted vouchers</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={post.status === "success" ? "default" : "destructive"}>
                          {post.platform}
                        </Badge>
                        <span className="text-sm text-muted-foreground capitalize">
                          {post.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        {post.business_vouchers?.title || "Untitled"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {post.post_content}
                      </p>
                      {post.error_message && (
                        <p className="text-xs text-destructive mt-1">{post.error_message}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(post.posted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}