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
          file_url: string | null
          id: string
          is_active: boolean
          is_free: boolean
          release_days: number | null
          sales_page_url: string | null
          show_as_card: boolean | null
          sort_order: number
          title: string
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
          file_url?: string | null
          id?: string
          is_active?: boolean
          is_free?: boolean
          release_days?: number | null
          sales_page_url?: string | null
          show_as_card?: boolean | null
          sort_order?: number
          title: string
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
          file_url?: string | null
          id?: string
          is_active?: boolean
          is_free?: boolean
          release_days?: number | null
          sales_page_url?: string | null
          show_as_card?: boolean | null
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      course_integrations: {
        Row: {
          checkout_url: string | null
          course_id: string
          created_at: string
          external_product_id: string | null
          external_product_name: string | null
          id: string
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
          banner_image_url: string | null
          category_id: string | null
          course_type: string
          cover_image_url: string | null
          created_at: string
          full_description: string | null
          id: string
          launch_date: string | null
          price: number
          short_description: string | null
          sort_order: number
          status: string
          title: string
          total_duration: string | null
          total_lessons: number
          updated_at: string
        }
        Insert: {
          banner_image_url?: string | null
          category_id?: string | null
          course_type?: string
          cover_image_url?: string | null
          created_at?: string
          full_description?: string | null
          id?: string
          launch_date?: string | null
          price?: number
          short_description?: string | null
          sort_order?: number
          status?: string
          title: string
          total_duration?: string | null
          total_lessons?: number
          updated_at?: string
        }
        Update: {
          banner_image_url?: string | null
          category_id?: string | null
          course_type?: string
          cover_image_url?: string | null
          created_at?: string
          full_description?: string | null
          id?: string
          launch_date?: string | null
          price?: number
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
          completed_at: string | null
          course_id: string
          created_at: string
          enrolled_at: string
          id: string
          progress_percentage: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          progress_percentage?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
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
          content_url: string | null
          course_id: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          is_free_preview: boolean
          sort_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content_url?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_free_preview?: boolean
          sort_order?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content_url?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_free_preview?: boolean
          sort_order?: number
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
          event_type: string
          id: string
          order_id: string | null
          payload: Json | null
          provider: string
          response_message: string | null
          response_status: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_type?: string
          id?: string
          order_id?: string | null
          payload?: Json | null
          provider?: string
          response_message?: string | null
          response_status?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          event_type?: string
          id?: string
          order_id?: string | null
          payload?: Json | null
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
