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
          area_id: string | null
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
          area_id?: string | null
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
          area_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "active_sessions_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      approved_buyers: {
        Row: {
          access_enabled: boolean
          area_id: string | null
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
          area_id?: string | null
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
          area_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "approved_buyers_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      areas: {
        Row: {
          background_color: string | null
          banner_url: string | null
          created_at: string | null
          description: string | null
          domain: string | null
          favicon_url: string | null
          id: string
          is_primary: boolean | null
          language: string | null
          login_background_url: string | null
          login_subtitle: string | null
          login_title: string | null
          logo_url: string | null
          name: string
          primary_color: string | null
          product_id: string | null
          secondary_color: string | null
          settings: Json | null
          short_label: string | null
          slug: string
          status: string | null
          surface_color: string | null
        }
        Insert: {
          background_color?: string | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          domain?: string | null
          favicon_url?: string | null
          id?: string
          is_primary?: boolean | null
          language?: string | null
          login_background_url?: string | null
          login_subtitle?: string | null
          login_title?: string | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          product_id?: string | null
          secondary_color?: string | null
          settings?: Json | null
          short_label?: string | null
          slug: string
          status?: string | null
          surface_color?: string | null
        }
        Update: {
          background_color?: string | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          domain?: string | null
          favicon_url?: string | null
          id?: string
          is_primary?: boolean | null
          language?: string | null
          login_background_url?: string | null
          login_subtitle?: string | null
          login_title?: string | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          product_id?: string | null
          secondary_color?: string | null
          settings?: Json | null
          short_label?: string | null
          slug?: string
          status?: string | null
          surface_color?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "areas_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      areas_membros: {
        Row: {
          accent_color: string | null
          app_name: string | null
          ativa: boolean | null
          atualizado_em: string
          background_color: string | null
          banner_url: string | null
          boas_vindas: string | null
          botao_continuar: string | null
          botao_entrar: string | null
          button_color: string | null
          button_text_color: string | null
          conclusao: string | null
          criado_em: string
          descricao: string | null
          elevated_surface: string | null
          favicon_url: string | null
          formato_data: string | null
          id: string
          idiomas_ativos: string[] | null
          language: string | null
          logo_alt: string | null
          logo_url: string | null
          nome: string
          parabens: string | null
          primary_color: string | null
          principal: boolean | null
          produto_bloqueado: string | null
          produto_id: string | null
          rotulo_curto: string | null
          secondary_color: string | null
          sidebar_color: string | null
          status: string | null
          subdominio: string
          suporte_texto: string | null
          support_email: string | null
          surface_color: string | null
          text_primary: string | null
          text_secondary: string | null
          theme_mode: string | null
          tipo: string | null
        }
        Insert: {
          accent_color?: string | null
          app_name?: string | null
          ativa?: boolean | null
          atualizado_em?: string
          background_color?: string | null
          banner_url?: string | null
          boas_vindas?: string | null
          botao_continuar?: string | null
          botao_entrar?: string | null
          button_color?: string | null
          button_text_color?: string | null
          conclusao?: string | null
          criado_em?: string
          descricao?: string | null
          elevated_surface?: string | null
          favicon_url?: string | null
          formato_data?: string | null
          id?: string
          idiomas_ativos?: string[] | null
          language?: string | null
          logo_alt?: string | null
          logo_url?: string | null
          nome: string
          parabens?: string | null
          primary_color?: string | null
          principal?: boolean | null
          produto_bloqueado?: string | null
          produto_id?: string | null
          rotulo_curto?: string | null
          secondary_color?: string | null
          sidebar_color?: string | null
          status?: string | null
          subdominio: string
          suporte_texto?: string | null
          support_email?: string | null
          surface_color?: string | null
          text_primary?: string | null
          text_secondary?: string | null
          theme_mode?: string | null
          tipo?: string | null
        }
        Update: {
          accent_color?: string | null
          app_name?: string | null
          ativa?: boolean | null
          atualizado_em?: string
          background_color?: string | null
          banner_url?: string | null
          boas_vindas?: string | null
          botao_continuar?: string | null
          botao_entrar?: string | null
          button_color?: string | null
          button_text_color?: string | null
          conclusao?: string | null
          criado_em?: string
          descricao?: string | null
          elevated_surface?: string | null
          favicon_url?: string | null
          formato_data?: string | null
          id?: string
          idiomas_ativos?: string[] | null
          language?: string | null
          logo_alt?: string | null
          logo_url?: string | null
          nome?: string
          parabens?: string | null
          primary_color?: string | null
          principal?: boolean | null
          produto_bloqueado?: string | null
          produto_id?: string | null
          rotulo_curto?: string | null
          secondary_color?: string | null
          sidebar_color?: string | null
          status?: string | null
          subdominio?: string
          suporte_texto?: string | null
          support_email?: string | null
          surface_color?: string | null
          text_primary?: string | null
          text_secondary?: string | null
          theme_mode?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "areas_membros_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          area_id: string | null
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
          area_id?: string | null
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
          area_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "categories_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas_membros"
            referencedColumns: ["id"]
          },
        ]
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
          area_id: string | null
          author_avatar_url: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          author_avatar_url?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area_id?: string | null
          author_avatar_url?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_login_area: {
        Row: {
          area_id: string
          created_at: string
          id: string
          imagem_login_url: string | null
          layout_login: string | null
          modo_fundo: string | null
          placeholder_email: string | null
          placeholder_senha: string | null
          subtitulo_login: string | null
          texto_ajuda: string | null
          texto_botao: string | null
          texto_rodape: string | null
          titulo_login: string | null
          updated_at: string
        }
        Insert: {
          area_id: string
          created_at?: string
          id?: string
          imagem_login_url?: string | null
          layout_login?: string | null
          modo_fundo?: string | null
          placeholder_email?: string | null
          placeholder_senha?: string | null
          subtitulo_login?: string | null
          texto_ajuda?: string | null
          texto_botao?: string | null
          texto_rodape?: string | null
          titulo_login?: string | null
          updated_at?: string
        }
        Update: {
          area_id?: string
          created_at?: string
          id?: string
          imagem_login_url?: string | null
          layout_login?: string | null
          modo_fundo?: string | null
          placeholder_email?: string | null
          placeholder_senha?: string | null
          subtitulo_login?: string | null
          texto_ajuda?: string | null
          texto_botao?: string | null
          texto_rodape?: string | null
          titulo_login?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_login_area_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: true
            referencedRelation: "areas_membros"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          access_mode: string | null
          area_id: string | null
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
          area_id?: string | null
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
          area_id?: string | null
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
            foreignKeyName: "content_items_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_unlock_rule_content_id_fkey"
            columns: ["unlock_rule_content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      contents: {
        Row: {
          area_id: string | null
          category_id: string | null
          created_at: string | null
          id: string
          sort_order: number
          status: string | null
          title: string
          type: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          area_id?: string | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          sort_order?: number
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          area_id?: string | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          sort_order?: number
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contents_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas_membros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
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
          payment_type: string | null
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
          payment_type?: string | null
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
          payment_type?: string | null
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
          area_id: string | null
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
          area_id?: string | null
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
          area_id?: string | null
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
            foreignKeyName: "courses_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
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
          area_id: string | null
          downloaded_at: string
          email: string
          id: string
          track_id: string
        }
        Insert: {
          area_id?: string | null
          downloaded_at?: string
          email: string
          id?: string
          track_id: string
        }
        Update: {
          area_id?: string | null
          downloaded_at?: string
          email?: string
          id?: string
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "download_logs_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          access_origin: string
          area_id: string | null
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
          area_id?: string | null
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
          area_id?: string | null
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
            foreignKeyName: "enrollments_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
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
      hero_banner_events: {
        Row: {
          banner_id: string
          created_at: string
          cta_kind: string | null
          email: string | null
          event_type: string
          id: string
        }
        Insert: {
          banner_id: string
          created_at?: string
          cta_kind?: string | null
          email?: string | null
          event_type: string
          id?: string
        }
        Update: {
          banner_id?: string
          created_at?: string
          cta_kind?: string | null
          email?: string | null
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_banner_events_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "vitrine_hero_banners"
            referencedColumns: ["id"]
          },
        ]
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
          area_id: string | null
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
          area_id?: string | null
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
          area_id?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journeys_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
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
      memberships: {
        Row: {
          area_id: string | null
          created_at: string | null
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          area_id?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
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
          area_id: string | null
          duration_seconds: number
          email: string
          id: string
          played_at: string
          track_id: string
        }
        Insert: {
          area_id?: string | null
          duration_seconds?: number
          email: string
          id?: string
          played_at?: string
          track_id: string
        }
        Update: {
          area_id?: string | null
          duration_seconds?: number
          email?: string
          id?: string
          played_at?: string
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "play_logs_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
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
          area_id: string | null
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
          area_id?: string | null
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
          area_id?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
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
          is_featured: boolean
          shelf_id: string
          sort_order: number
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          is_featured?: boolean
          shelf_id: string
          sort_order?: number
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          is_featured?: boolean
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
          area_id: string | null
          auto_criteria: string | null
          created_at: string
          description: string | null
          display_mode: string
          id: string
          is_active: boolean
          mode: string
          name: string
          public_title: string | null
          show_in_vitrine: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          area_id?: string | null
          auto_criteria?: string | null
          created_at?: string
          description?: string | null
          display_mode?: string
          id?: string
          is_active?: boolean
          mode?: string
          name: string
          public_title?: string | null
          show_in_vitrine?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          area_id?: string | null
          auto_criteria?: string | null
          created_at?: string
          description?: string | null
          display_mode?: string
          id?: string
          is_active?: boolean
          mode?: string
          name?: string
          public_title?: string | null
          show_in_vitrine?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shelves_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
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
          area_id: string | null
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
          area_id?: string | null
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
          area_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "tracks_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas_membros"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          area_id: string | null
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
          area_id?: string | null
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
          area_id?: string | null
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
            foreignKeyName: "transactions_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
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
          area_id: string | null
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
          area_id?: string | null
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
          area_id?: string | null
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
            foreignKeyName: "user_content_progress_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
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
      vitrine_hero_banners: {
        Row: {
          area_id: string | null
          autoplay: boolean
          autoplay_interval_ms: number
          banner_click_target: string | null
          banner_click_type: string | null
          banner_clickable: boolean
          container_ratio: string
          created_at: string
          description: string | null
          display_mode: string
          id: string
          image_height: number | null
          image_mobile_url: string | null
          image_tablet_url: string | null
          image_url: string
          image_width: number | null
          is_active: boolean
          primary_cta_label: string | null
          primary_cta_target: string | null
          primary_cta_type: string
          primary_cta_url: string | null
          schedule_end_at: string | null
          schedule_start_at: string | null
          secondary_cta_label: string | null
          secondary_cta_target: string | null
          secondary_cta_type: string
          secondary_cta_url: string | null
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          area_id?: string | null
          autoplay?: boolean
          autoplay_interval_ms?: number
          banner_click_target?: string | null
          banner_click_type?: string | null
          banner_clickable?: boolean
          container_ratio?: string
          created_at?: string
          description?: string | null
          display_mode?: string
          id?: string
          image_height?: number | null
          image_mobile_url?: string | null
          image_tablet_url?: string | null
          image_url: string
          image_width?: number | null
          is_active?: boolean
          primary_cta_label?: string | null
          primary_cta_target?: string | null
          primary_cta_type?: string
          primary_cta_url?: string | null
          schedule_end_at?: string | null
          schedule_start_at?: string | null
          secondary_cta_label?: string | null
          secondary_cta_target?: string | null
          secondary_cta_type?: string
          secondary_cta_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          area_id?: string | null
          autoplay?: boolean
          autoplay_interval_ms?: number
          banner_click_target?: string | null
          banner_click_type?: string | null
          banner_clickable?: boolean
          container_ratio?: string
          created_at?: string
          description?: string | null
          display_mode?: string
          id?: string
          image_height?: number | null
          image_mobile_url?: string | null
          image_tablet_url?: string | null
          image_url?: string
          image_width?: number | null
          is_active?: boolean
          primary_cta_label?: string | null
          primary_cta_target?: string | null
          primary_cta_type?: string
          primary_cta_url?: string | null
          schedule_end_at?: string | null
          schedule_start_at?: string | null
          secondary_cta_label?: string | null
          secondary_cta_target?: string | null
          secondary_cta_type?: string
          secondary_cta_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vitrine_hero_banners_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
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
      delete_user_account: { Args: never; Returns: undefined }
      delete_user_account_v2: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      get_analytics_summary:
        | { Args: { p_days?: number }; Returns: Json }
        | { Args: { p_area_id?: string; p_days: number }; Returns: Json }
      get_hero_banner_metrics: { Args: { p_days?: number }; Returns: Json }
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
      is_admin: { Args: { uid: string }; Returns: boolean }
      is_area_member: { Args: { _area_id: string }; Returns: boolean }
      redact_json: { Args: { data: Json }; Returns: Json }
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
