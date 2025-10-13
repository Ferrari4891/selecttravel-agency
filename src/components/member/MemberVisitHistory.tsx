import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Building2 } from "lucide-react";
import { format } from "date-fns";

interface Visit {
  id: string;
  visit_date: string;
  business_name: string;
  business_type: string;
  city: string;
  country: string;
}

interface FavoriteVenue {
  business_name: string;
  visit_count: number;
  business_type: string;
}

export function MemberVisitHistory() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [favorites, setFavorites] = useState<FavoriteVenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisitHistory();
  }, []);

  const loadVisitHistory = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get member card
      const { data: card } = await supabase
        .from("member_cards")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (!card) return;

      // Get visit history
      const { data: visitsData, error } = await supabase
        .from("member_visits")
        .select(`
          id,
          visit_date,
          businesses!inner(business_name, business_type, city, country)
        `)
        .eq("card_id", card.id)
        .order("visit_date", { ascending: false });

      if (error) throw error;

      const formattedVisits = visitsData?.map((v: any) => ({
        id: v.id,
        visit_date: v.visit_date,
        business_name: v.businesses.business_name,
        business_type: v.businesses.business_type,
        city: v.businesses.city,
        country: v.businesses.country,
      })) || [];

      setVisits(formattedVisits);

      // Calculate favorite venues
      const venueMap = new Map<string, FavoriteVenue>();
      formattedVisits.forEach(v => {
        const existing = venueMap.get(v.business_name);
        if (existing) {
          existing.visit_count++;
        } else {
          venueMap.set(v.business_name, {
            business_name: v.business_name,
            visit_count: 1,
            business_type: v.business_type,
          });
        }
      });

      const sortedFavorites = Array.from(venueMap.values())
        .sort((a, b) => b.visit_count - a.visit_count)
        .slice(0, 5);

      setFavorites(sortedFavorites);
    } catch (error) {
      console.error("Error loading visit history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading visit history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Visits</CardDescription>
            <CardTitle className="text-3xl">{visits.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unique Venues</CardDescription>
            <CardTitle className="text-3xl">
              {new Set(visits.map(v => v.business_name)).size}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Countries Visited</CardDescription>
            <CardTitle className="text-3xl">
              {new Set(visits.map(v => v.country)).size}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Favorite Venues */}
      {favorites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Favorite Venues</CardTitle>
            <CardDescription>Places you visit most often</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {favorites.map((fav, index) => (
                <div
                  key={fav.business_name}
                  className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{fav.business_name}</div>
                      <div className="text-sm text-muted-foreground">{fav.business_type}</div>
                    </div>
                  </div>
                  <Badge variant="secondary">{fav.visit_count} visits</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visit History */}
      <Card>
        <CardHeader>
          <CardTitle>Visit History</CardTitle>
          <CardDescription>All your recorded venue visits</CardDescription>
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No visits recorded yet. Show your membership card at participating venues!
            </div>
          ) : (
            <div className="space-y-4">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">{visit.business_name}</div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(visit.visit_date), "MMM dd, yyyy 'at' h:mm a")}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {visit.city}, {visit.country}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {visit.business_type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}