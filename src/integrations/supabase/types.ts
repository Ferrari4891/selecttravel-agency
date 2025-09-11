export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
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
      blocked_users: {
        Row: {
          blocked_by: string | null
          created_at: string
          email: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_by?: string | null
          created_at?: string
          email: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_by?: string | null
          created_at?: string
          email?: string
          id?: string
          reason?: string | null
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
      business_media: {
        Row: {
          business_id: string
          created_at: string
          id: string
          images: Json | null
          media_type: Database["public"]["Enums"]["media_type"]
          updated_at: string
          youtube_id: string | null
          youtube_url: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          images?: Json | null
          media_type: Database["public"]["Enums"]["media_type"]
          updated_at?: string
          youtube_id?: string | null
          youtube_url?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          images?: Json | null
          media_type?: Database["public"]["Enums"]["media_type"]
          updated_at?: string
          youtube_id?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_media_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_registrations: {
        Row: {
          auth_user_id: string | null
          business_name: string
          created_at: string
          email: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          business_name: string
          created_at?: string
          email: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          business_name?: string
          created_at?: string
          email?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
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
      carousel_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
          updated_at?: string
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
          approval_status: string
          created_at: string
          creator_id: string
          custom_message: string | null
          group_name: string
          id: string
          invite_token: string
          invite_type: string
          proposed_date: string
          rsvp_deadline: string
          selected_member_ids: Json | null
          status: string
          updated_at: string
          venue_id: string
        }
        Insert: {
          approval_status?: string
          created_at?: string
          creator_id: string
          custom_message?: string | null
          group_name: string
          id?: string
          invite_token?: string
          invite_type?: string
          proposed_date: string
          rsvp_deadline: string
          selected_member_ids?: Json | null
          status?: string
          updated_at?: string
          venue_id: string
        }
        Update: {
          approval_status?: string
          created_at?: string
          creator_id?: string
          custom_message?: string | null
          group_name?: string
          id?: string
          invite_token?: string
          invite_type?: string
          proposed_date?: string
          rsvp_deadline?: string
          selected_member_ids?: Json | null
          status?: string
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_venue"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      help_card_feedback: {
        Row: {
          created_at: string
          feedback_text: string | null
          help_card_id: string
          id: string
          is_helpful: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          help_card_id: string
          id?: string
          is_helpful: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          help_card_id?: string
          id?: string
          is_helpful?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_card_feedback_help_card_id_fkey"
            columns: ["help_card_id"]
            isOneToOne: false
            referencedRelation: "help_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      help_cards: {
        Row: {
          android_store_url: string | null
          apple_store_url: string | null
          audio_url: string | null
          category: string
          content_type: string
          created_at: string
          helpful_count: number
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          question: string
          sort_order: number
          text_content: string | null
          updated_at: string
          video_url: string | null
          view_count: number
          website_url: string | null
        }
        Insert: {
          android_store_url?: string | null
          apple_store_url?: string | null
          audio_url?: string | null
          category?: string
          content_type: string
          created_at?: string
          helpful_count?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          question: string
          sort_order?: number
          text_content?: string | null
          updated_at?: string
          video_url?: string | null
          view_count?: number
          website_url?: string | null
        }
        Update: {
          android_store_url?: string | null
          apple_store_url?: string | null
          audio_url?: string | null
          category?: string
          content_type?: string
          created_at?: string
          helpful_count?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          question?: string
          sort_order?: number
          text_content?: string | null
          updated_at?: string
          video_url?: string | null
          view_count?: number
          website_url?: string | null
        }
        Relationships: []
      }
      help_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          sort_order: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          sort_order?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "help_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_rsvps: {
        Row: {
          created_at: string
          first_name: string | null
          guest_count: number | null
          id: string
          invitation_id: string
          invitee_email: string | null
          invitee_user_id: string | null
          responded_at: string | null
          response: string | null
          response_message: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          guest_count?: number | null
          id?: string
          invitation_id: string
          invitee_email?: string | null
          invitee_user_id?: string | null
          responded_at?: string | null
          response?: string | null
          response_message?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          guest_count?: number | null
          id?: string
          invitation_id?: string
          invitee_email?: string | null
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
      member_photos: {
        Row: {
          caption: string | null
          event_id: string | null
          id: string
          is_approved: boolean
          member_id: string | null
          photo_url: string
          updated_at: string | null
          uploaded_at: string
          uploaded_by_email: string
          venue_id: string | null
        }
        Insert: {
          caption?: string | null
          event_id?: string | null
          id?: string
          is_approved?: boolean
          member_id?: string | null
          photo_url: string
          updated_at?: string | null
          uploaded_at?: string
          uploaded_by_email: string
          venue_id?: string | null
        }
        Update: {
          caption?: string | null
          event_id?: string | null
          id?: string
          is_approved?: boolean
          member_id?: string | null
          photo_url?: string
          updated_at?: string | null
          uploaded_at?: string
          uploaded_by_email?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "group_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_photos_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "simple_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_photos_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      message_replies: {
        Row: {
          author_email: string
          author_id: string | null
          author_name: string
          created_at: string
          id: string
          is_approved: boolean
          message_id: string
          parent_reply_id: string | null
          reply_text: string
          updated_at: string
        }
        Insert: {
          author_email: string
          author_id?: string | null
          author_name: string
          created_at?: string
          id?: string
          is_approved?: boolean
          message_id: string
          parent_reply_id?: string | null
          reply_text: string
          updated_at?: string
        }
        Update: {
          author_email?: string
          author_id?: string | null
          author_name?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          message_id?: string
          parent_reply_id?: string | null
          reply_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          author_email: string
          author_id: string | null
          author_name: string
          created_at: string
          id: string
          is_approved: boolean
          message_text: string
          message_type: string
          updated_at: string
        }
        Insert: {
          author_email: string
          author_id?: string | null
          author_name: string
          created_at?: string
          id?: string
          is_approved?: boolean
          message_text: string
          message_type?: string
          updated_at?: string
        }
        Update: {
          author_email?: string
          author_id?: string | null
          author_name?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          message_text?: string
          message_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      navigation_menu_items: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          path: string
          requires_auth: boolean
          requires_member: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          path: string
          requires_auth?: boolean
          requires_member?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          path?: string
          requires_auth?: boolean
          requires_member?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      page_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          template_data: Json
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          template_data?: Json
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          template_data?: Json
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          slug: string
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_group: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
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
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
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
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
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
      simple_members: {
        Row: {
          created_at: string
          display_name: string
          email: string
          first_name: string
          id: string
          is_active: boolean
          joined_at: string
          last_name: string
          receive_notifications: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email: string
          first_name: string
          id?: string
          is_active?: boolean
          joined_at?: string
          last_name: string
          receive_notifications?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          last_name?: string
          receive_notifications?: boolean
          updated_at?: string
        }
        Relationships: []
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
      venue_ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
          venue_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
          venue_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string
          average_rating: number | null
          business_name: string
          created_at: string
          description: string
          facebook_link: string | null
          google_maps_link: string | null
          id: string
          image_1_url: string | null
          image_2_url: string | null
          image_3_url: string | null
          rating_count: number | null
          status: string
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          address: string
          average_rating?: number | null
          business_name: string
          created_at?: string
          description: string
          facebook_link?: string | null
          google_maps_link?: string | null
          id?: string
          image_1_url?: string | null
          image_2_url?: string | null
          image_3_url?: string | null
          rating_count?: number | null
          status?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          average_rating?: number | null
          business_name?: string
          created_at?: string
          description?: string
          facebook_link?: string | null
          google_maps_link?: string | null
          id?: string
          image_1_url?: string | null
          image_2_url?: string | null
          image_3_url?: string | null
          rating_count?: number | null
          status?: string
          submitted_by?: string | null
          updated_at?: string
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
      get_rsvp_counts: {
        Args: { invitation_ids: string[] }
        Returns: {
          attending: number
          invitation_id: string
          not_attending: number
          total: number
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      set_admin_by_email: {
        Args: { user_email: string }
        Returns: undefined
      }
    }
    Enums: {
      media_type: "carousel" | "image" | "youtube"
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
    Enums: {
      media_type: ["carousel", "image", "youtube"],
    },
  },
} as const
