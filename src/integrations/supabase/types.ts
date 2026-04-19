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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      active_sessions: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          email: string
          id: string
          ip_address: string | null
          is_valid: boolean
          last_active_at: string
          session_token: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          email: string
          id?: string
          ip_address?: string | null
          is_valid?: boolean
          last_active_at?: string
          session_token: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          is_valid?: boolean
          last_active_at?: string
          session_token?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      approved_buyers: {
        Row: {
          access_enabled: boolean
          can_download: boolean
          created_at: string
          email: string
          first_login_at: string | null
          id: string
          is_trial: boolean
          last_login_at: string | null
          nome: string
          order_id: string | null
          product_name: string | null
          status: string
          trial_expires_at: string | null
        }
        Insert: {
          access_enabled?: boolean
          can_download?: boolean
          created_at?: string
          email: string
          first_login_at?: string | null
          id?: string
          is_trial?: boolean
          last_login_at?: string | null
          nome: string
          order_id?: string | null
          product_name?: string | null
          status?: string
          trial_expires_at?: string | null
        }
        Update: {
          access_enabled?: boolean
          can_download?: boolean
          created_at?: string
          email?: string
          first_login_at?: string | null
          id?: string
          is_trial?: boolean
          last_login_at?: string | null
          nome?: string
          order_id?: string | null
          product_name?: string | null
          status?: string
          trial_expires_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_featured: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      community_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_avatar_url: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_avatar_url?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_items: {
        Row: {
          access_mode: string | null
          badge_text: string | null
          card_cover_url: string | null
          content_type: string
          cover_url: string | null
          created_at: string
          description: string | null
          display_category: string | null
          featured_priority: number
          file_url: string | null
          id: string
          initial_free_count: number
          is_active: boolean
          is_featured: boolean
          is_free: boolean
          journey_group: string | null
          journey_order: number
          launch_mode: string
          locked_final_count: number
          locked_label: string | null
          release_days: number | null
          release_mode: string
          sales_page_url: string | null
          show_as_card: boolean | null
          sort_order: number
          title: string
          unlock_rule_content_id: string | null
          unlock_rule_type: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          access_mode?: string | null
          badge_text?: string | null
          card_cover_url?: string | null
          content_type?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          display_category?: string | null
          featured_priority?: number
          file_url?: string | null
          id?: string
          initial_free_count?: number
          is_active?: boolean
          is_featured?: boolean
          is_free?: boolean
          journey_group?: string | null
          journey_order?: number
          launch_mode?: string
          locked_final_count?: number
          locked_label?: string | null
          release_days?: number | null
          release_mode?: string
          sales_page_url?: string | null
          show_as_card?: boolean | null
          sort_order?: number
          title: string
          unlock_rule_content_id?: string | null
          unlock_rule_type?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          access_mode?: string | null
          badge_text?: string | null
          card_cover_url?: string | null
          content_type?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          display_category?: string | null
          featured_priority?: number
          file_url?: string | null
          id?: string
          initial_free_count?: number
          is_active?: boolean
          is_featured?: boolean
          is_free?: boolean
          journey_group?: string | null
          journey_order?: number
          launch_mode?: string
          locked_final_count?: number
          locked_label?: string | null
          release_days?: number | null
          release_mode?: string
          sales_page_url?: string | null
          show_as_card?: boolean | null
          sort_order?: number
          title?: string
          unlock_rule_content_id?: string | null
          unlock_rule_type?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_items_unlock_rule_content_id_fkey"
            columns: ["unlock_rule_content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      course_integrations: {
        Row: {
          checkout_url: string | null
          course_id: string
          created_at: string
          external_product_id: string | null
          external_product_name: string | null
          id: string
          integration_token: string | null
          is_enabled: boolean
          notes: string | null
          platform: string
          updated_at: string
          webhook_active: boolean
        }
        Insert: {
          checkout_url?: string | null
          course_id: string
          created_at?: string
          external_product_id?: string | null
          external_product_name?: string | null
          id?: string
          integration_token?: string | null
          is_enabled?: boolean
          notes?: string | null
          platform?: string
          updated_at?: string
          webhook_active?: boolean
        }
        Update: {
          checkout_url?: string | null
          course_id?: string
          created_at?: string
          external_product_id?: string | null
          external_product_name?: string | null
          id?: string
          integration_token?: string | null
          is_enabled?: boolean
          notes?: string | null
          platform?: string
          updated_at?: string
          webhook_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "course_integrations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          access_count: number
          banner_image_url: string | null
          benefits: string[]
          category_id: string | null
          course_type: string
          cover_image_url: string | null
          created_at: string
          full_description: string | null
          id: string
          launch_date: string | null
          price: number
          product_type: string
          promotional_price: number | null
          sales_description: string | null
          short_description: string | null
          sort_order: number
          status: string
          title: string
          total_duration: string | null
          total_lessons: number
          updated_at: string
        }
        Insert: {
          access_count?: number
          banner_image_url?: string | null
          benefits?: string[]
          category_id?: string | null
          course_type?: string
          cover_image_url?: string | null
          created_at?: string
          full_description?: string | null
          id?: string
          launch_date?: string | null
          price?: number
          product_type?: string
          promotional_price?: number | null
          sales_description?: string | null
          short_description?: string | null
          sort_order?: number
          status?: string
          title: string
          total_duration?: string | null
          total_lessons?: number
          updated_at?: string
        }
        Update: {
          access_count?: number
          banner_image_url?: string | null
          benefits?: string[]
          category_id?: string | null
          course_type?: string
          cover_image_url?: string | null
          created_at?: string
          full_description?: string | null
          id?: string
          launch_date?: string | null
          price?: number
          product_type?: string
          promotional_price?: number | null
          sales_description?: string | null
          short_description?: string | null
          sort_order?: number
          status?: string
          title?: string
          total_duration?: string | null
          total_lessons?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      download_logs: {
        Row: {
          downloaded_at: string
          email: string
          id: string
          track_id: string
        }
        Insert: {
          downloaded_at?: string
          email: string
          id?: string
          track_id: string
        }
        Update: {
          downloaded_at?: string
          email?: string
          id?: string
          track_id?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          access_origin: string
          completed_at: string | null
          course_id: string
          created_at: string
          email: string | null
          enrolled_at: string
          expires_at: string | null
          granted_at: string
          id: string
          notes: string | null
          progress_percentage: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_origin?: string
          completed_at?: string | null
          course_id: string
          created_at?: string
          email?: string | null
          enrolled_at?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          notes?: string | null
          progress_percentage?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_origin?: string
          completed_at?: string | null
          course_id?: string
          created_at?: string
          email?: string | null
          enrolled_at?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          notes?: string | null
          progress_percentage?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_click_logs: {
        Row: {
          clicked_at: string
          email: string
          funnel_context: string | null
          id: string
          is_locked: boolean
          item_id: string
          item_type: string
          shelf_title: string | null
        }
        Insert: {
          clicked_at?: string
          email: string
          funnel_context?: string | null
          id?: string
          is_locked?: boolean
          item_id: string
          item_type?: string
          shelf_title?: string | null
        }
        Update: {
          clicked_at?: string
          email?: string
          funnel_context?: string | null
          id?: string
          is_locked?: boolean
          item_id?: string
          item_type?: string
          shelf_title?: string | null
        }
        Relationships: []
      }
      impersonation_logs: {
        Row: {
          admin_email: string
          admin_user_id: string
          created_at: string
          ended_at: string | null
          id: string
          ip_address: string | null
          started_at: string
          target_email: string
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          admin_email: string
          admin_user_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          started_at?: string
          target_email: string
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          admin_email?: string
          admin_user_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          started_at?: string
          target_email?: string
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      journeys: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      lesson_materials: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          material_type: string
          sort_order: number
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          material_type?: string
          sort_order?: number
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          material_type?: string
          sort_order?: number
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          lesson_id: string
          updated_at: string
          user_id: string
          watched_seconds: number
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          lesson_id: string
          updated_at?: string
          user_id: string
          watched_seconds?: number
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
          watched_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_type: string
          content_url: string | null
          course_id: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          is_free_preview: boolean
          module_id: string | null
          sort_order: number
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content_type?: string
          content_url?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_free_preview?: boolean
          module_id?: string | null
          sort_order?: number
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content_type?: string
          content_url?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_free_preview?: boolean
          module_id?: string | null
          sort_order?: number
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          sort_order: number
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      platform_modules: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
          visible_in_menu: boolean
          visible_in_vitrine: boolean
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
          visible_in_menu?: boolean
          visible_in_vitrine?: boolean
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          visible_in_menu?: boolean
          visible_in_vitrine?: boolean
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      play_logs: {
        Row: {
          duration_seconds: number
          email: string
          id: string
          played_at: string
          track_id: string
        }
        Insert: {
          duration_seconds?: number
          email: string
          id?: string
          played_at?: string
          track_id: string
        }
        Update: {
          duration_seconds?: number
          email?: string
          id?: string
          played_at?: string
          track_id?: string
        }
        Relationships: []
      }
      playlist_tracks: {
        Row: {
          created_at: string
          id: string
          playlist_id: string
          sort_order: number
          track_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          playlist_id: string
          sort_order?: number
          track_id: string
        }
        Update: {
          created_at?: string
          id?: string
          playlist_id?: string
          sort_order?: number
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      processed_webhooks: {
        Row: {
          created_at: string
          details: Json | null
          email: string | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json | null
          processed_at: string | null
          provider: string
          status: string
          unique_event_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          email?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          processed_at?: string | null
          provider?: string
          status?: string
          unique_event_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          email?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          processed_at?: string | null
          provider?: string
          status?: string
          unique_event_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_upsells: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          sort_order: number
          source_id: string
          source_type: string
          target_id: string
          target_type: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          source_id: string
          source_type: string
          target_id: string
          target_type: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          source_id?: string
          source_type?: string
          target_id?: string
          target_type?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          position_after_shelf: number
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          position_after_shelf?: number
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          position_after_shelf?: number
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      shelf_courses: {
        Row: {
          course_id: string
          created_at: string
          id: string
          shelf_id: string
          sort_order: number
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          shelf_id: string
          sort_order?: number
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          shelf_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "shelf_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shelf_courses_shelf_id_fkey"
            columns: ["shelf_id"]
            isOneToOne: false
            referencedRelation: "shelves"
            referencedColumns: ["id"]
          },
        ]
      }
      shelves: {
        Row: {
          auto_criteria: string | null
          created_at: string
          id: string
          is_active: boolean
          mode: string
          name: string
          show_in_vitrine: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          auto_criteria?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          mode?: string
          name: string
          show_in_vitrine?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          auto_criteria?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          mode?: string
          name?: string
          show_in_vitrine?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tracks: {
        Row: {
          bonus_release_date: string | null
          category: string
          cover_url: string | null
          created_at: string
          description: string | null
          download_url: string | null
          duration: string
          id: string
          is_active: boolean
          is_bonus: boolean
          sort_order: number
          storage_path: string
          title: string
          updated_at: string
        }
        Insert: {
          bonus_release_date?: string | null
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          download_url?: string | null
          duration?: string
          id?: string
          is_active?: boolean
          is_bonus?: boolean
          sort_order?: number
          storage_path: string
          title: string
          updated_at?: string
        }
        Update: {
          bonus_release_date?: string | null
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          download_url?: string | null
          duration?: string
          id?: string
          is_active?: boolean
          is_bonus?: boolean
          sort_order?: number
          storage_path?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          buyer_email: string
          buyer_name: string
          course_id: string | null
          course_title: string
          created_at: string
          external_order_id: string | null
          id: string
          payment_method: string | null
          platform: string | null
          status: string
          transaction_code: string
          updated_at: string
        }
        Insert: {
          amount?: number
          buyer_email: string
          buyer_name: string
          course_id?: string | null
          course_title: string
          created_at?: string
          external_order_id?: string | null
          id?: string
          payment_method?: string | null
          platform?: string | null
          status?: string
          transaction_code: string
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_email?: string
          buyer_name?: string
          course_id?: string | null
          course_title?: string
          created_at?: string
          external_order_id?: string | null
          id?: string
          payment_method?: string | null
          platform?: string | null
          status?: string
          transaction_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_access_logs: {
        Row: {
          block_reason: string | null
          device_fingerprint: string | null
          email: string
          id: string
          ip_address: string | null
          is_blocked: boolean
          login_at: string
          user_agent: string | null
        }
        Insert: {
          block_reason?: string | null
          device_fingerprint?: string | null
          email: string
          id?: string
          ip_address?: string | null
          is_blocked?: boolean
          login_at?: string
          user_agent?: string | null
        }
        Update: {
          block_reason?: string | null
          device_fingerprint?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          is_blocked?: boolean
          login_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      user_content_progress: {
        Row: {
          completed_at: string | null
          content_id: string
          created_at: string
          downloaded_at: string | null
          id: string
          last_position_seconds: number
          started_at: string | null
          updated_at: string
          user_email: string
          viewed_at: string | null
        }
        Insert: {
          completed_at?: string | null
          content_id: string
          created_at?: string
          downloaded_at?: string | null
          id?: string
          last_position_seconds?: number
          started_at?: string | null
          updated_at?: string
          user_email: string
          viewed_at?: string | null
        }
        Update: {
          completed_at?: string | null
          content_id?: string
          created_at?: string
          downloaded_at?: string | null
          id?: string
          last_position_seconds?: number
          started_at?: string | null
          updated_at?: string
          user_email?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_content_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_content_unlocks: {
        Row: {
          content_id: string
          created_at: string
          email: string
          id: string
          order_id: string | null
          unlock_at: string
          unlocked: boolean
          updated_at: string
        }
        Insert: {
          content_id: string
          created_at?: string
          email: string
          id?: string
          order_id?: string | null
          unlock_at: string
          unlocked?: boolean
          updated_at?: string
        }
        Update: {
          content_id?: string
          created_at?: string
          email?: string
          id?: string
          order_id?: string | null
          unlock_at?: string
          unlocked?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_content_unlocks_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          content_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          email: string | null
          error_details: string | null
          event_type: string
          external_product_id: string | null
          id: string
          internal_course_id: string | null
          is_success: boolean | null
          order_id: string | null
          payload: Json | null
          processed_at: string | null
          provider: string
          response_message: string | null
          response_status: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          error_details?: string | null
          event_type?: string
          external_product_id?: string | null
          id?: string
          internal_course_id?: string | null
          is_success?: boolean | null
          order_id?: string | null
          payload?: Json | null
          processed_at?: string | null
          provider?: string
          response_message?: string | null
          response_status?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          error_details?: string | null
          event_type?: string
          external_product_id?: string | null
          id?: string
          internal_course_id?: string | null
          is_success?: boolean | null
          order_id?: string | null
          payload?: Json | null
          processed_at?: string | null
          provider?: string
          response_message?: string | null
          response_status?: number
        }
        Relationships: []
      }
      webhook_settings: {
        Row: {
          allowed_ips: string[]
          auth_token: string | null
          created_at: string
          id: string
          is_active: boolean
          monitored_events: string[]
          provider: string
          updated_at: string
          webhook_url: string
        }
        Insert: {
          allowed_ips?: string[]
          auth_token?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          monitored_events?: string[]
          provider?: string
          updated_at?: string
          webhook_url?: string
        }
        Update: {
          allowed_ips?: string[]
          auth_token?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          monitored_events?: string[]
          provider?: string
          updated_at?: string
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_analytics_summary: { Args: { p_days?: number }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_course_access: {
        Args: { p_course_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
