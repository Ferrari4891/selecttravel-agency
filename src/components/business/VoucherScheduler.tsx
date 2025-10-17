import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, Plus, Trash2, Edit, Pause, Play } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface VoucherSchedule {
  id: string;
  schedule_name: string;
  voucher_template: any;
  recurrence_pattern: string;
  recurrence_details: any;
  is_active: boolean;
  next_trigger_at: string;
  last_triggered_at: string | null;
}

export default function VoucherScheduler({ businessId }: { businessId: string }) {
  const [schedules, setSchedules] = useState<VoucherSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    schedule_name: "",
    title: "",
    description: "",
    voucher_type: "bogo",
    discount_value: "",
    min_purchase_amount: "",
    spend_amount: "",
    get_back_amount: "",
    max_uses: "",
    duration_days: "7",
    recurrence_pattern: "weekly",
    time: "09:00",
    day_of_week: "monday",
    day_of_month: "1",
    exclusions: "",
    terms: "",
    blackout_days: "",
  });

  useEffect(() => {
    fetchSchedules();
  }, [businessId]);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from("voucher_schedules")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const recurrenceDetails: any = { time: formData.time };
      if (formData.recurrence_pattern === "weekly") {
        recurrenceDetails.day_of_week = formData.day_of_week;
      } else if (formData.recurrence_pattern === "monthly") {
        recurrenceDetails.day_of_month = parseInt(formData.day_of_month);
      }

      const nextTrigger = calculateNextTrigger(formData.recurrence_pattern, recurrenceDetails);

      const voucherTemplate: any = {
        title: formData.title,
        description: formData.description,
        voucher_type: formData.voucher_type,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        duration_days: parseInt(formData.duration_days),
        exclusions: formData.exclusions,
        terms: formData.terms,
        blackout_days: formData.blackout_days,
      };

      // Add type-specific fields
      if (formData.voucher_type === "bogo") {
        // BOGO doesn't need additional fields
      } else if (formData.voucher_type === "percentage") {
        voucherTemplate.discount_value = parseFloat(formData.discount_value);
        voucherTemplate.min_purchase_amount = formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : 0;
      } else if (formData.voucher_type === "spend_get") {
        voucherTemplate.spend_amount = parseFloat(formData.spend_amount);
        voucherTemplate.get_back_amount = parseFloat(formData.get_back_amount);
      }

      const { error } = await supabase.from("voucher_schedules").insert({
        business_id: businessId,
        schedule_name: formData.schedule_name,
        voucher_template: voucherTemplate,
        recurrence_pattern: formData.recurrence_pattern,
        recurrence_details: recurrenceDetails,
        next_trigger_at: nextTrigger.toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Voucher schedule created successfully",
      });

      setDialogOpen(false);
      fetchSchedules();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleSchedule = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("voucher_schedules")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Schedule ${!currentStatus ? "activated" : "paused"}`,
      });

      fetchSchedules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from("voucher_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });

      fetchSchedules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      schedule_name: "",
      title: "",
      description: "",
      voucher_type: "bogo",
      discount_value: "",
      min_purchase_amount: "",
      spend_amount: "",
      get_back_amount: "",
      max_uses: "",
      duration_days: "7",
      recurrence_pattern: "weekly",
      time: "09:00",
      day_of_week: "monday",
      day_of_month: "1",
      exclusions: "",
      terms: "",
      blackout_days: "",
    });
  };

  const calculateNextTrigger = (pattern: string, details: any): Date => {
    const now = new Date();
    const [hours, minutes] = details.time.split(":").map(Number);

    switch (pattern) {
      case "daily":
        const daily = new Date(now);
        daily.setDate(daily.getDate() + 1);
        daily.setHours(hours, minutes, 0, 0);
        return daily;

      case "weekly":
        const weekly = new Date(now);
        weekly.setDate(weekly.getDate() + 7);
        weekly.setHours(hours, minutes, 0, 0);
        return weekly;

      case "monthly":
        const monthly = new Date(now);
        monthly.setMonth(monthly.getMonth() + 1);
        monthly.setDate(details.day_of_month);
        monthly.setHours(hours, minutes, 0, 0);
        return monthly;

      default:
        const def = new Date(now);
        def.setDate(def.getDate() + 1);
        return def;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Automated Voucher Scheduler</CardTitle>
              <CardDescription>
                Create recurring vouchers automatically on a schedule
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  NEW
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Voucher Schedule</DialogTitle>
                  <DialogDescription>
                    Set up a recurring voucher that will be created automatically
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Schedule Name</Label>
                    <Input
                      value={formData.schedule_name}
                      onChange={(e) => setFormData({ ...formData, schedule_name: e.target.value })}
                      placeholder="e.g., Weekly Monday Special"
                      required
                    />
                  </div>

                  <div>
                    <Label>Voucher Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., 20% Off Special"
                      required
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Voucher details..."
                    />
                  </div>

                  <div>
                    <Label>Voucher Type</Label>
                    <Select
                      value={formData.voucher_type}
                      onValueChange={(value) => setFormData({ ...formData, voucher_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bogo">BOGO (Buy One Get One)</SelectItem>
                        <SelectItem value="percentage">% Off with Minimum Purchase</SelectItem>
                        <SelectItem value="spend_get">Spend Amount, Get Amount Back</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.voucher_type === "percentage" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Discount Percentage</Label>
                        <Input
                          type="number"
                          value={formData.discount_value}
                          onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                          placeholder="e.g., 20"
                          required
                        />
                      </div>
                      <div>
                        <Label>Min Purchase Amount</Label>
                        <Input
                          type="number"
                          value={formData.min_purchase_amount}
                          onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                          placeholder="e.g., 50"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {formData.voucher_type === "spend_get" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Spend Amount ($)</Label>
                        <Input
                          type="number"
                          value={formData.spend_amount}
                          onChange={(e) => setFormData({ ...formData, spend_amount: e.target.value })}
                          placeholder="e.g., 100"
                          required
                        />
                      </div>
                      <div>
                        <Label>Get Back Amount ($)</Label>
                        <Input
                          type="number"
                          value={formData.get_back_amount}
                          onChange={(e) => setFormData({ ...formData, get_back_amount: e.target.value })}
                          placeholder="e.g., 20"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Max Uses (optional)</Label>
                      <Input
                        type="number"
                        value={formData.max_uses}
                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                        placeholder="e.g., 100"
                      />
                    </div>

                    <div>
                      <Label>Voucher Duration (days)</Label>
                      <Input
                        type="number"
                        value={formData.duration_days}
                        onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Exclusions (optional)</Label>
                    <Textarea
                      value={formData.exclusions}
                      onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                      placeholder="e.g., Not valid with other offers"
                    />
                  </div>

                  <div>
                    <Label>Terms & Conditions (optional)</Label>
                    <Textarea
                      value={formData.terms}
                      onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                      placeholder="e.g., Valid for dine-in only"
                    />
                  </div>

                  <div>
                    <Label>Blackout Days (optional)</Label>
                    <Textarea
                      value={formData.blackout_days}
                      onChange={(e) => setFormData({ ...formData, blackout_days: e.target.value })}
                      placeholder="e.g., Not valid on holidays"
                    />
                  </div>

                  <div>
                    <Label>Recurrence Pattern</Label>
                    <Select
                      value={formData.recurrence_pattern}
                      onValueChange={(value) => setFormData({ ...formData, recurrence_pattern: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.recurrence_pattern === "weekly" && (
                    <div>
                      <Label>Day of Week</Label>
                      <Select
                        value={formData.day_of_week}
                        onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}
                      >
                        <SelectTrigger>
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

                  {formData.recurrence_pattern === "monthly" && (
                    <div>
                      <Label>Day of Month</Label>
                      <Input
                        type="number"
                        min="1"
                        max="28"
                        value={formData.day_of_month}
                        onChange={(e) => setFormData({ ...formData, day_of_month: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Create Schedule
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No schedules created yet. Click "New Schedule" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const template = schedule.voucher_template;
                            setFormData({
                              schedule_name: schedule.schedule_name,
                              title: template.title,
                              description: template.description,
                              voucher_type: template.voucher_type,
                              discount_value: template.discount_value?.toString() || "",
                              min_purchase_amount: template.min_purchase_amount?.toString() || "",
                              spend_amount: template.spend_amount?.toString() || "",
                              get_back_amount: template.get_back_amount?.toString() || "",
                              max_uses: template.max_uses?.toString() || "",
                              duration_days: template.duration_days.toString(),
                              recurrence_pattern: schedule.recurrence_pattern,
                              time: schedule.recurrence_details.time,
                              day_of_week: schedule.recurrence_details.day_of_week || "monday",
                              day_of_month: schedule.recurrence_details.day_of_month?.toString() || "1",
                              exclusions: template.exclusions || "",
                              terms: template.terms || "",
                              blackout_days: template.blackout_days || "",
                            });
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSchedule(schedule.id, schedule.is_active)}
                        >
                          {schedule.is_active ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSchedule(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">{schedule.schedule_name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {schedule.voucher_template.title}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {schedule.recurrence_pattern}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Next: {new Date(schedule.next_trigger_at).toLocaleString()}
                          </span>
                        </div>
                        {schedule.last_triggered_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last run: {new Date(schedule.last_triggered_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}