export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      amenity_options: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          option_key: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          option_key: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          option_key?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      business_analytics: {
        Row: {
          business_id: string
          created_at: string
          id: string
          metric_date: string
          metric_name: string
          metric_value: number
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          metric_date?: string
          metric_name: string
          metric_value: number
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          metric_date?: string
          metric_name?: string
          metric_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "business_analytics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_subscriptions: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
        }
        Insert: {
          amount: number
          business_id: string
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier: string
          updated_at?: string
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          air_conditioned: boolean | null
          business_hours: Json | null
          business_name: string
          business_type: string
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          email: string | null
          extended_hours: boolean | null
          facebook: string | null
          gluten_free: boolean | null
          id: string
          image_1_url: string | null
          image_2_url: string | null
          image_3_url: string | null
          instagram: string | null
          linkedin: string | null
          logo_url: string | null
          low_noise: boolean | null
          online_booking: boolean | null
          outdoor_seating: boolean | null
          pet_friendly: boolean | null
          phone: string | null
          postal_code: string | null
          public_transport: boolean | null
          senior_discounts: boolean | null
          state: string | null
          status: string
          subscription_end_date: string | null
          subscription_status: string | null
          subscription_tier: string | null
          twitter: string | null
          updated_at: string
          user_id: string
          website: string | null
          wheelchair_access: boolean | null
        }
        Insert: {
          address?: string | null
          air_conditioned?: boolean | null
          business_hours?: Json | null
          business_name: string
          business_type: string
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          extended_hours?: boolean | null
          facebook?: string | null
          gluten_free?: boolean | null
          id?: string
          image_1_url?: string | null
          image_2_url?: string | null
          image_3_url?: string | null
          instagram?: string | null
          linkedin?: string | null
          logo_url?: string | null
          low_noise?: boolean | null
          online_booking?: boolean | null
          outdoor_seating?: boolean | null
          pet_friendly?: boolean | null
          phone?: string | null
          postal_code?: string | null
          public_transport?: boolean | null
          senior_discounts?: boolean | null
          state?: string | null
          status?: string
          subscription_end_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          twitter?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          wheelchair_access?: boolean | null
        }
        Update: {
          address?: string | null
          air_conditioned?: boolean | null
          business_hours?: Json | null
          business_name?: string
          business_type?: string
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          extended_hours?: boolean | null
          facebook?: string | null
          gluten_free?: boolean | null
          id?: string
          image_1_url?: string | null
          image_2_url?: string | null
          image_3_url?: string | null
          instagram?: string | null
          linkedin?: string | null
          logo_url?: string | null
          low_noise?: boolean | null
          online_booking?: boolean | null
          outdoor_seating?: boolean | null
          pet_friendly?: boolean | null
          phone?: string | null
          postal_code?: string | null
          public_transport?: boolean | null
          senior_discounts?: boolean | null
          state?: string | null
          status?: string
          subscription_end_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          twitter?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          wheelchair_access?: boolean | null
        }
        Relationships: []
      }
      collection_shares: {
        Row: {
          collection_id: string
          created_at: string
          expires_at: string | null
          id: string
          share_token: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          share_token?: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          share_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_shares_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      group_invitations: {
        Row: {
          created_at: string
          creator_id: string
          custom_message: string | null
          group_name: string
          id: string
          invite_token: string
          proposed_date: string
          rsvp_deadline: string
          saved_restaurant_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          custom_message?: string | null
          group_name: string
          id?: string
          invite_token?: string
          proposed_date: string
          rsvp_deadline: string
          saved_restaurant_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          custom_message?: string | null
          group_name?: string
          id?: string
          invite_token?: string
          proposed_date?: string
          rsvp_deadline?: string
          saved_restaurant_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_saved_restaurant"
            columns: ["saved_restaurant_id"]
            isOneToOne: false
            referencedRelation: "saved_restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_rsvps: {
        Row: {
          created_at: string
          guest_count: number | null
          id: string
          invitation_id: string
          invitee_email: string
          invitee_user_id: string | null
          responded_at: string | null
          response: string | null
          response_message: string | null
        }
        Insert: {
          created_at?: string
          guest_count?: number | null
          id?: string
          invitation_id: string
          invitee_email: string
          invitee_user_id?: string | null
          responded_at?: string | null
          response?: string | null
          response_message?: string | null
        }
        Update: {
          created_at?: string
          guest_count?: number | null
          id?: string
          invitation_id?: string
          invitee_email?: string
          invitee_user_id?: string | null
          responded_at?: string | null
          response?: string | null
          response_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_invitation"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "group_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_group: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          gender: string | null
          id: string
          is_admin: boolean | null
          member_since: string
          preferred_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_group?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id?: string
          is_admin?: boolean | null
          member_since?: string
          preferred_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_group?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id?: string
          is_admin?: boolean | null
          member_since?: string
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_restaurants: {
        Row: {
          category: string | null
          city: string
          collection_id: string | null
          country: string
          created_at: string
          id: string
          restaurant_address: string
          restaurant_data: Json
          restaurant_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          city: string
          collection_id?: string | null
          country: string
          created_at?: string
          id?: string
          restaurant_address: string
          restaurant_data: Json
          restaurant_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          city?: string
          collection_id?: string | null
          country?: string
          created_at?: string
          id?: string
          restaurant_address?: string
          restaurant_data?: Json
          restaurant_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_restaurants_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      "Test Eat": {
        Row: {
          Address: string
          Email: string | null
          Facebook: string | null
          "Google Map Reference": string
          "Image Links": string | null
          Instagram: string | null
          Name: string
          Phone: string | null
          Rating: number | null
          "Review Count": number | null
          Source: string | null
          Twitter: string | null
          Website: string | null
        }
        Insert: {
          Address: string
          Email?: string | null
          Facebook?: string | null
          "Google Map Reference": string
          "Image Links"?: string | null
          Instagram?: string | null
          Name: string
          Phone?: string | null
          Rating?: number | null
          "Review Count"?: number | null
          Source?: string | null
          Twitter?: string | null
          Website?: string | null
        }
        Update: {
          Address?: string
          Email?: string | null
          Facebook?: string | null
          "Google Map Reference"?: string
          "Image Links"?: string | null
          Instagram?: string | null
          Name?: string
          Phone?: string | null
          Rating?: number | null
          "Review Count"?: number | null
          Source?: string | null
          Twitter?: string | null
          Website?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          air_conditioned: boolean | null
          created_at: string
          extended_hours: boolean | null
          gluten_free: boolean | null
          id: string
          low_noise: boolean | null
          online_booking: boolean | null
          outdoor_seating: boolean | null
          pet_friendly: boolean | null
          preferred_language: string | null
          public_transport: boolean | null
          senior_discounts: boolean | null
          updated_at: string
          user_id: string
          wheelchair_access: boolean | null
        }
        Insert: {
          air_conditioned?: boolean | null
          created_at?: string
          extended_hours?: boolean | null
          gluten_free?: boolean | null
          id?: string
          low_noise?: boolean | null
          online_booking?: boolean | null
          outdoor_seating?: boolean | null
          pet_friendly?: boolean | null
          preferred_language?: string | null
          public_transport?: boolean | null
          senior_discounts?: boolean | null
          updated_at?: string
          user_id: string
          wheelchair_access?: boolean | null
        }
        Update: {
          air_conditioned?: boolean | null
          created_at?: string
          extended_hours?: boolean | null
          gluten_free?: boolean | null
          id?: string
          low_noise?: boolean | null
          online_booking?: boolean | null
          outdoor_seating?: boolean | null
          pet_friendly?: boolean | null
          preferred_language?: string | null
          public_transport?: boolean | null
          senior_discounts?: boolean | null
          updated_at?: string
          user_id?: string
          wheelchair_access?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      set_admin_by_email: {
        Args: { user_email: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
