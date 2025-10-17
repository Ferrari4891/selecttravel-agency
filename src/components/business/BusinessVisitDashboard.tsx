import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface Visit {
  id: string;
  visit_date: string;
  member_name: string;
  member_email: string;
  card_number: string;
}

interface VisitStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

export function BusinessVisitDashboard({ businessId }: { businessId: string }) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState<VisitStats>({ today: 0, thisWeek: 0, thisMonth: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisits();
  }, [businessId]);

  const loadVisits = async () => {
    setLoading(true);
    try {
      const { data: visitsData, error } = await supabase
        .from("member_visits")
        .select(`
          id,
          visit_date,
          member_cards!inner(member_name, member_email, card_number)
        `)
        .eq("business_id", businessId)
        .order("visit_date", { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedVisits = visitsData?.map((v: any) => ({
        id: v.id,
        visit_date: v.visit_date,
        member_name: v.member_cards.member_name,
        member_email: v.member_cards.member_email,
        card_number: v.member_cards.card_number,
      })) || [];

      setVisits(formattedVisits);

      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      setStats({
        today: formattedVisits.filter(v => new Date(v.visit_date) >= today).length,
        thisWeek: formattedVisits.filter(v => new Date(v.visit_date) >= weekAgo).length,
        thisMonth: formattedVisits.filter(v => new Date(v.visit_date) >= monthAgo).length,
        total: formattedVisits.length,
      });
    } catch (error) {
      console.error("Error loading visits:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Time", "Member Name", "Email", "Card Number"];
    const rows = visits.map(v => [
      format(new Date(v.visit_date), "yyyy-MM-dd"),
      format(new Date(v.visit_date), "HH:mm:ss"),
      v.member_name,
      v.member_email,
      v.card_number,
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visits-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading visit data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today</CardDescription>
            <CardTitle className="text-3xl">{stats.today}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Week</CardDescription>
            <CardTitle className="text-3xl">{stats.thisWeek}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-3xl">{stats.thisMonth}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Visits</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {stats.total}
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Visits Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>Recent Visits</CardTitle>
              <CardDescription>Last 50 member visits to your business</CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No visits recorded yet. Start scanning member cards!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Member Name</TableHead>
                  <TableHead>Card Number</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {format(new Date(visit.visit_date), "MMM dd, yyyy")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(visit.visit_date), "h:mm a")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{visit.member_name}</TableCell>
                    <TableCell className="font-mono text-sm">{visit.card_number}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{visit.member_email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}