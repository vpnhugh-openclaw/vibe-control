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
      attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size_bytes: number | null
          file_type: string | null
          id: string
          project_id: string | null
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size_bytes?: number | null
          file_type?: string | null
          id?: string
          project_id?: string | null
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size_bytes?: number | null
          file_type?: string | null
          id?: string
          project_id?: string | null
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_entries: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          date: string | null
          entry_type: string | null
          gmail_account_id: string | null
          id: string
          notes: string | null
          platform_id: string | null
          project_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          date?: string | null
          entry_type?: string | null
          gmail_account_id?: string | null
          id?: string
          notes?: string | null
          platform_id?: string | null
          project_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          date?: string | null
          entry_type?: string | null
          gmail_account_id?: string | null
          id?: string
          notes?: string | null
          platform_id?: string | null
          project_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_entries_gmail_account_id_fkey"
            columns: ["gmail_account_id"]
            isOneToOne: false
            referencedRelation: "gmail_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_entries_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_items: {
        Row: {
          category: string | null
          created_at: string
          date_seen: string | null
          id: string
          is_bookmarked: boolean | null
          is_dismissed: boolean | null
          relevance_score: number | null
          source_type: string | null
          source_url: string | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          date_seen?: string | null
          id?: string
          is_bookmarked?: boolean | null
          is_dismissed?: boolean | null
          relevance_score?: number | null
          source_type?: string | null
          source_url?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          date_seen?: string | null
          id?: string
          is_bookmarked?: boolean | null
          is_dismissed?: boolean | null
          relevance_score?: number | null
          source_type?: string | null
          source_url?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gmail_accounts: {
        Row: {
          best_for_platform: string | null
          created_at: string
          email_address: string
          id: string
          is_active: boolean | null
          label: string
          last_used_date: string | null
          login_method: string | null
          notes: string | null
          preferred_use_case: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          best_for_platform?: string | null
          created_at?: string
          email_address: string
          id?: string
          is_active?: boolean | null
          label: string
          last_used_date?: string | null
          login_method?: string | null
          notes?: string | null
          preferred_use_case?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          best_for_platform?: string | null
          created_at?: string
          email_address?: string
          id?: string
          is_active?: boolean | null
          label?: string
          last_used_date?: string | null
          login_method?: string | null
          notes?: string | null
          preferred_use_case?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      models: {
        Row: {
          best_for: string[] | null
          cost_per_unit: number | null
          created_at: string
          date_verified: string | null
          expiry_date: string | null
          id: string
          is_free_tier: boolean | null
          last_synced_at: string | null
          model_id: string | null
          model_name: string | null
          provider: string | null
          quality_notes: string | null
          source_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          best_for?: string[] | null
          cost_per_unit?: number | null
          created_at?: string
          date_verified?: string | null
          expiry_date?: string | null
          id?: string
          is_free_tier?: boolean | null
          last_synced_at?: string | null
          model_id?: string | null
          model_name?: string | null
          provider?: string | null
          quality_notes?: string | null
          source_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          best_for?: string[] | null
          cost_per_unit?: number | null
          created_at?: string
          date_verified?: string | null
          expiry_date?: string | null
          id?: string
          is_free_tier?: boolean | null
          last_synced_at?: string | null
          model_id?: string | null
          model_name?: string | null
          provider?: string | null
          quality_notes?: string | null
          source_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_memberships: {
        Row: {
          created_at: string
          daily_reset_time: string | null
          free_tier_usefulness: number | null
          gmail_account_id: string | null
          id: string
          is_registered: boolean | null
          is_worth_keeping: boolean | null
          last_known_balance: number | null
          monthly_credits: number | null
          notes: string | null
          platform_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_reset_time?: string | null
          free_tier_usefulness?: number | null
          gmail_account_id?: string | null
          id?: string
          is_registered?: boolean | null
          is_worth_keeping?: boolean | null
          last_known_balance?: number | null
          monthly_credits?: number | null
          notes?: string | null
          platform_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_reset_time?: string | null
          free_tier_usefulness?: number | null
          gmail_account_id?: string | null
          id?: string
          is_registered?: boolean | null
          is_worth_keeping?: boolean | null
          last_known_balance?: number | null
          monthly_credits?: number | null
          notes?: string | null
          platform_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_memberships_gmail_account_id_fkey"
            columns: ["gmail_account_id"]
            isOneToOne: false
            referencedRelation: "gmail_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_memberships_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      platforms: {
        Row: {
          best_use_cases: string[] | null
          category: string | null
          created_at: string
          free_tier_notes: string | null
          i_use_it: boolean | null
          id: string
          is_currently_active: boolean | null
          last_synced_at: string | null
          link: string | null
          logo_slug: string | null
          name: string
          personal_rating: number | null
          pricing_notes: string | null
          promo_notes: string | null
          recommended_project_types: string[] | null
          short_description: string | null
          source_type: string | null
          strengths: string[] | null
          updated_at: string
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          best_use_cases?: string[] | null
          category?: string | null
          created_at?: string
          free_tier_notes?: string | null
          i_use_it?: boolean | null
          id?: string
          is_currently_active?: boolean | null
          last_synced_at?: string | null
          link?: string | null
          logo_slug?: string | null
          name: string
          personal_rating?: number | null
          pricing_notes?: string | null
          promo_notes?: string | null
          recommended_project_types?: string[] | null
          short_description?: string | null
          source_type?: string | null
          strengths?: string[] | null
          updated_at?: string
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          best_use_cases?: string[] | null
          category?: string | null
          created_at?: string
          free_tier_notes?: string | null
          i_use_it?: boolean | null
          id?: string
          is_currently_active?: boolean | null
          last_synced_at?: string | null
          link?: string | null
          logo_slug?: string | null
          name?: string
          personal_rating?: number | null
          pricing_notes?: string | null
          promo_notes?: string | null
          recommended_project_types?: string[] | null
          short_description?: string | null
          source_type?: string | null
          strengths?: string[] | null
          updated_at?: string
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_platforms: {
        Row: {
          platform_id: string
          project_id: string
        }
        Insert: {
          platform_id: string
          project_id: string
        }
        Update: {
          platform_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_platforms_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_platforms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tags: {
        Row: {
          project_id: string
          tag_id: string
        }
        Insert: {
          project_id: string
          tag_id: string
        }
        Update: {
          project_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tags_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          project_id: string
          type: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          project_id: string
          type?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          project_id?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          blocker_summary: string | null
          category: string | null
          confidence_score: number | null
          created_at: string
          deployment_url: string | null
          effort_score: number | null
          gmail_account_id: string | null
          id: string
          is_stalled: boolean | null
          last_active_date: string | null
          last_meaningful_progress_date: string | null
          long_notes: string | null
          monetisation_score: number | null
          motivation_score: number | null
          name: string
          next_action: string | null
          platform_fit_score: number | null
          priority: number | null
          project_type: string | null
          project_url: string | null
          repo_url: string | null
          rescue_score: number | null
          short_description: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blocker_summary?: string | null
          category?: string | null
          confidence_score?: number | null
          created_at?: string
          deployment_url?: string | null
          effort_score?: number | null
          gmail_account_id?: string | null
          id?: string
          is_stalled?: boolean | null
          last_active_date?: string | null
          last_meaningful_progress_date?: string | null
          long_notes?: string | null
          monetisation_score?: number | null
          motivation_score?: number | null
          name: string
          next_action?: string | null
          platform_fit_score?: number | null
          priority?: number | null
          project_type?: string | null
          project_url?: string | null
          repo_url?: string | null
          rescue_score?: number | null
          short_description?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blocker_summary?: string | null
          category?: string | null
          confidence_score?: number | null
          created_at?: string
          deployment_url?: string | null
          effort_score?: number | null
          gmail_account_id?: string | null
          id?: string
          is_stalled?: boolean | null
          last_active_date?: string | null
          last_meaningful_progress_date?: string | null
          long_notes?: string | null
          monetisation_score?: number | null
          motivation_score?: number | null
          name?: string
          next_action?: string | null
          platform_fit_score?: number | null
          priority?: number | null
          project_type?: string | null
          project_url?: string | null
          repo_url?: string | null
          rescue_score?: number | null
          short_description?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_gmail_account_id_fkey"
            columns: ["gmail_account_id"]
            isOneToOne: false
            referencedRelation: "gmail_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          amount: number | null
          created_at: string
          credit_type: string | null
          expiry_date: string | null
          freshness: string | null
          id: string
          last_synced_at: string | null
          notes: string | null
          provider: string | null
          source_type: string | null
          source_url: string | null
          tags: string[] | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          credit_type?: string | null
          expiry_date?: string | null
          freshness?: string | null
          id?: string
          last_synced_at?: string | null
          notes?: string | null
          provider?: string | null
          source_type?: string | null
          source_url?: string | null
          tags?: string[] | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          credit_type?: string | null
          expiry_date?: string | null
          freshness?: string | null
          id?: string
          last_synced_at?: string | null
          notes?: string | null
          provider?: string | null
          source_type?: string | null
          source_url?: string | null
          tags?: string[] | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompt_platforms: {
        Row: {
          platform_id: string
          prompt_id: string
        }
        Insert: {
          platform_id: string
          prompt_id: string
        }
        Update: {
          platform_id?: string
          prompt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_platforms_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_platforms_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_projects: {
        Row: {
          project_id: string
          prompt_id: string
        }
        Insert: {
          project_id: string
          prompt_id: string
        }
        Update: {
          project_id?: string
          prompt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_projects_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_tags: {
        Row: {
          prompt_id: string
          tag_id: string
        }
        Insert: {
          prompt_id: string
          tag_id: string
        }
        Update: {
          prompt_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_tags_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          category: string | null
          created_at: string
          date_added: string | null
          effectiveness_rating: number | null
          id: string
          last_used_date: string | null
          notes: string | null
          prompt_text: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          date_added?: string | null
          effectiveness_rating?: number | null
          id?: string
          last_used_date?: string | null
          notes?: string | null
          prompt_text?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          date_added?: string | null
          effectiveness_rating?: number | null
          id?: string
          last_used_date?: string | null
          notes?: string | null
          prompt_text?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stall_assessments: {
        Row: {
          ai_output: Json | null
          already_tried: string | null
          created_at: string
          credits_issue: string | null
          credits_limitation: number | null
          current_blocker: string | null
          feels_unclear: string | null
          id: string
          last_progress: string | null
          monetisation_clarity: number | null
          motivation_energy: number | null
          needs_narrowing: boolean | null
          platform_fit: number | null
          project_id: string
          prompt_quality: number | null
          rescue_score_output: number | null
          scope_clarity: number | null
          technical_blockers: number | null
          user_id: string
        }
        Insert: {
          ai_output?: Json | null
          already_tried?: string | null
          created_at?: string
          credits_issue?: string | null
          credits_limitation?: number | null
          current_blocker?: string | null
          feels_unclear?: string | null
          id?: string
          last_progress?: string | null
          monetisation_clarity?: number | null
          motivation_energy?: number | null
          needs_narrowing?: boolean | null
          platform_fit?: number | null
          project_id: string
          prompt_quality?: number | null
          rescue_score_output?: number | null
          scope_clarity?: number | null
          technical_blockers?: number | null
          user_id: string
        }
        Update: {
          ai_output?: Json | null
          already_tried?: string | null
          created_at?: string
          credits_issue?: string | null
          credits_limitation?: number | null
          current_blocker?: string | null
          feels_unclear?: string | null
          id?: string
          last_progress?: string | null
          monetisation_clarity?: number | null
          motivation_energy?: number | null
          needs_narrowing?: boolean | null
          platform_fit?: number | null
          project_id?: string
          prompt_quality?: number | null
          rescue_score_output?: number | null
          scope_clarity?: number | null
          technical_blockers?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stall_assessments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          colour: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          colour?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          colour?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
