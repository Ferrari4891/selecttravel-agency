import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Mail, Send } from "lucide-react";

export default function AnalyticsReportSettings({ businessId }: { businessId: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    frequency: "weekly",
    send_day: "monday",
    send_date: "1",
    send_time: "09:00",
    recipient_email: "",
    is_active: false,
  });

  useEffect(() => {
    fetchSettings();
  }, [businessId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("analytics_report_settings")
        .select("*")
        .eq("business_id", businessId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          frequency: data.frequency,
          send_day: data.send_day || "monday",
          send_date: String(data.send_date || "1"),
          send_time: data.send_time,
          recipient_email: data.recipient_email,
          is_active: data.is_active,
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("analytics_report_settings")
        .upsert({
          business_id: businessId,
          frequency: settings.frequency,
          send_day: settings.frequency === "weekly" ? settings.send_day : null,
          send_date: settings.frequency === "monthly" ? parseInt(settings.send_date) : null,
          send_time: settings.send_time,
          recipient_email: settings.recipient_email,
          is_active: settings.is_active,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Analytics report settings saved",
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

  const sendTestReport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("send-analytics-report", {
        body: { business_id: businessId, test: true },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test report sent successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Email Reports</CardTitle>
        <CardDescription>
          Receive automated analytics reports via email
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Automated Reports</Label>
            <p className="text-sm text-muted-foreground">
              Send regular analytics reports to your email
            </p>
          </div>
          <Switch
            checked={settings.is_active}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, is_active: checked })
            }
          />
        </div>

        <div className="space-y-4">
          <div>
            <Label>Recipient Email</Label>
            <Input
              type="email"
              value={settings.recipient_email}
              onChange={(e) =>
                setSettings({ ...settings, recipient_email: e.target.value })
              }
              placeholder="your@email.com"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Report Frequency</Label>
            <Select
              value={settings.frequency}
              onValueChange={(value) =>
                setSettings({ ...settings, frequency: value })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.frequency === "weekly" && (
            <div>
              <Label>Send Day</Label>
              <Select
                value={settings.send_day}
                onValueChange={(value) =>
                  setSettings({ ...settings, send_day: value })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {settings.frequency === "monthly" && (
            <div>
              <Label>Day of Month</Label>
              <Input
                type="number"
                min="1"
                max="28"
                value={settings.send_date}
                onChange={(e) =>
                  setSettings({ ...settings, send_date: e.target.value })
                }
                className="mt-2"
              />
            </div>
          )}

          <div>
            <Label>Send Time</Label>
            <Input
              type="time"
              value={settings.send_time}
              onChange={(e) =>
                setSettings({ ...settings, send_time: e.target.value })
              }
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            <Mail className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
          <Button
            variant="outline"
            onClick={sendTestReport}
            disabled={!settings.recipient_email}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Test
          </Button>
        </div>

        {settings.is_active && (
          <div className="bg-muted p-4 space-y-2 text-sm">
            <p className="font-medium">Report Schedule Summary:</p>
            <p className="text-muted-foreground">
              {settings.frequency === "daily" && `Daily at ${settings.send_time}`}
              {settings.frequency === "weekly" &&
                `Every ${settings.send_day} at ${settings.send_time}`}
              {settings.frequency === "monthly" &&
                `On the ${settings.send_date}${
                  settings.send_date === "1"
                    ? "st"
                    : settings.send_date === "2"
                    ? "nd"
                    : settings.send_date === "3"
                    ? "rd"
                    : "th"
                } of each month at ${settings.send_time}`}
            </p>
            <p className="text-muted-foreground">
              Reports will be sent to: {settings.recipient_email}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}