import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Twitter, Unlink, Link as LinkIcon } from "lucide-react";

export default function SocialMediaConnect({ businessId }: { businessId: string }) {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnections();
  }, [businessId]);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from("social_media_connections")
        .select("*")
        .eq("business_id", businessId);

      if (error) throw error;
      setConnections(data || []);
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

  const handleDisconnect = async (id: string) => {
    try {
      const { error } = await supabase
        .from("social_media_connections")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account disconnected successfully",
      });

      fetchConnections();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="h-5 w-5" />;
      case "instagram":
        return <Instagram className="h-5 w-5" />;
      case "twitter":
        return <Twitter className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const handleConnect = (platform: string) => {
    toast({
      title: "Coming Soon",
      description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} integration will be available soon. Please contact support for early access.`,
    });
  };

  const platforms = [
    { id: "facebook", name: "Facebook", color: "bg-blue-600" },
    { id: "instagram", name: "Instagram", color: "bg-pink-600" },
    { id: "twitter", name: "Twitter", color: "bg-sky-500" },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Connections</CardTitle>
        <CardDescription>
          Connect your social media accounts to enable auto-posting
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {platforms.map((platform) => {
          const connection = connections.find((c) => c.platform === platform.id);

          return (
            <div
              key={platform.id}
              className="flex items-center justify-between p-4 border"
            >
              <div className="flex items-center gap-3">
                <div className={`${platform.color} p-2 text-white`}>
                  {getPlatformIcon(platform.id)}
                </div>
                <div>
                  <p className="font-medium">{platform.name}</p>
                  {connection ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        @{connection.account_name}
                      </p>
                      <Badge variant={connection.is_active ? "default" : "secondary"}>
                        {connection.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  )}
                </div>
              </div>

              {connection ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(connection.id)}
                >
                  <Unlink className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleConnect(platform.id)}
                  className={platform.color}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Connect
                </Button>
              )}
            </div>
          );
        })}

        <div className="bg-muted p-4 text-sm space-y-2">
          <p className="font-medium">Note:</p>
          <p className="text-muted-foreground">
            Social media integration requires OAuth authentication. Click "Connect" to
            authorize mysmartguide.online to post on your behalf.
          </p>
          <p className="text-muted-foreground">
            You can revoke access at any time from your social media account settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}