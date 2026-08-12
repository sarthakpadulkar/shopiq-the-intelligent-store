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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ai_interactions: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_interactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "anonymous_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          is_demo: boolean
          metadata: Json
          product_id: string | null
          query: string | null
          session_id: string | null
          store_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          is_demo?: boolean
          metadata?: Json
          product_id?: string | null
          query?: string | null
          session_id?: string | null
          store_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          is_demo?: boolean
          metadata?: Json
          product_id?: string | null
          query?: string | null
          session_id?: string | null
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_demand_intelligence"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "analytics_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "analytics_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "anonymous_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "v_store_analytics"
            referencedColumns: ["store_id"]
          },
        ]
      }
      anonymous_sessions: {
        Row: {
          ended_at: string | null
          id: string
          is_demo: boolean
          last_active_at: string
          session_code: string
          started_at: string
          store_id: string | null
        }
        Insert: {
          ended_at?: string | null
          id?: string
          is_demo?: boolean
          last_active_at?: string
          session_code: string
          started_at?: string
          store_id?: string | null
        }
        Update: {
          ended_at?: string | null
          id?: string
          is_demo?: boolean
          last_active_at?: string
          session_code?: string
          started_at?: string
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_sessions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anonymous_sessions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "v_store_analytics"
            referencedColumns: ["store_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          metadata: Json
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          available_units: number
          floor: string | null
          id: string
          product_id: string
          rack: string | null
          section: string | null
          sold_units: number
          store_id: string
          updated_at: string
        }
        Insert: {
          available_units?: number
          floor?: string | null
          id?: string
          product_id: string
          rack?: string | null
          section?: string | null
          sold_units?: number
          store_id: string
          updated_at?: string
        }
        Update: {
          available_units?: number
          floor?: string | null
          id?: string
          product_id?: string
          rack?: string | null
          section?: string | null
          sold_units?: number
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_demand_intelligence"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "v_store_analytics"
            referencedColumns: ["store_id"]
          },
        ]
      }
      pos_integrations: {
        Row: {
          brand_id: string
          config: Json
          created_at: string
          id: string
          last_sync_at: string | null
          provider: string
          status: string
        }
        Insert: {
          brand_id: string
          config?: Json
          created_at?: string
          id?: string
          last_sync_at?: string | null
          provider: string
          status?: string
        }
        Update: {
          brand_id?: string
          config?: Json
          created_at?: string
          id?: string
          last_sync_at?: string | null
          provider?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_integrations_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string
          category: string
          colour: string
          created_at: string
          description: string | null
          fit: string | null
          gender: string
          id: string
          images: string[]
          is_active: boolean
          is_demo: boolean
          is_new_arrival: boolean
          is_trending: boolean
          material: string | null
          name: string
          occasion: string | null
          price: number
          product_code: string
          sizes: string[]
          style: string | null
          subcategory: string | null
          try_on_type: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          category: string
          colour: string
          created_at?: string
          description?: string | null
          fit?: string | null
          gender?: string
          id?: string
          images?: string[]
          is_active?: boolean
          is_demo?: boolean
          is_new_arrival?: boolean
          is_trending?: boolean
          material?: string | null
          name: string
          occasion?: string | null
          price: number
          product_code: string
          sizes?: string[]
          style?: string | null
          subcategory?: string | null
          try_on_type?: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          category?: string
          colour?: string
          created_at?: string
          description?: string | null
          fit?: string | null
          gender?: string
          id?: string
          images?: string[]
          is_active?: boolean
          is_demo?: boolean
          is_new_arrival?: boolean
          is_trending?: boolean
          material?: string | null
          name?: string
          occasion?: string | null
          price?: number
          product_code?: string
          sizes?: string[]
          style?: string | null
          subcategory?: string | null
          try_on_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          brand_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          store_id: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          store_id?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "v_store_analytics"
            referencedColumns: ["store_id"]
          },
        ]
      }
      sales: {
        Row: {
          id: string
          is_demo: boolean
          product_id: string
          sold_at: string
          source: string
          store_id: string
          total_value: number
          unit_price: number
          units: number
        }
        Insert: {
          id?: string
          is_demo?: boolean
          product_id: string
          sold_at?: string
          source?: string
          store_id: string
          total_value: number
          unit_price: number
          units: number
        }
        Update: {
          id?: string
          is_demo?: boolean
          product_id?: string
          sold_at?: string
          source?: string
          store_id?: string
          total_value?: number
          unit_price?: number
          units?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_demand_intelligence"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "v_store_analytics"
            referencedColumns: ["store_id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          brand_id: string
          city: string
          code: string
          created_at: string
          id: string
          is_demo: boolean
          name: string
        }
        Insert: {
          address?: string | null
          brand_id: string
          city: string
          code: string
          created_at?: string
          id?: string
          is_demo?: boolean
          name: string
        }
        Update: {
          address?: string | null
          brand_id?: string
          city?: string
          code?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      try_on_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          garment_count: number
          id: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          garment_count?: number
          id?: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          garment_count?: number
          id?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "try_on_sessions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "anonymous_sessions"
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
    }
    Views: {
      v_category_analytics: {
        Row: {
          available_units: number | null
          category: string | null
          conversion_pct: number | null
          revenue: number | null
          searches: number | null
          selections: number | null
          try_ons: number | null
          units_sold: number | null
          views: number | null
        }
        Relationships: []
      }
      v_demand_intelligence: {
        Row: {
          available_units: number | null
          category: string | null
          colour: string | null
          demand_risk: string | null
          name: string | null
          product_code: string | null
          product_id: string | null
          searches: number | null
          try_ons: number | null
          units_sold: number | null
          unmet_signal: number | null
          views: number | null
        }
        Relationships: []
      }
      v_engagement_summary: {
        Row: {
          ai_conversations: number | null
          demo_sales_rows: number | null
          product_selections: number | null
          product_views: number | null
          qr_scans: number | null
          revenue: number | null
          searches: number | null
          total_interactions: number | null
          total_sessions: number | null
          try_ons: number | null
          units_sold: number | null
        }
        Relationships: []
      }
      v_product_performance: {
        Row: {
          available_units: number | null
          category: string | null
          colour: string | null
          conversion_pct: number | null
          find_in_store: number | null
          gender: string | null
          impressions: number | null
          name: string | null
          price: number | null
          product_code: string | null
          product_id: string | null
          qr_scans: number | null
          revenue: number | null
          searches: number | null
          selections: number | null
          try_ons: number | null
          tryon_to_sale_pct: number | null
          units_sold: number | null
          view_to_tryon_pct: number | null
          views: number | null
        }
        Relationships: []
      }
      v_search_analytics: {
        Row: {
          last_searched: string | null
          query: string | null
          searches: number | null
        }
        Relationships: []
      }
      v_store_analytics: {
        Row: {
          city: string | null
          code: string | null
          conversion_pct: number | null
          interactions: number | null
          name: string | null
          revenue: number | null
          searches: number | null
          selections: number | null
          sessions: number | null
          store_id: string | null
          try_ons: number | null
          units_sold: number | null
          views: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_manage: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "brand_admin" | "store_manager" | "staff"
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
      app_role: ["super_admin", "brand_admin", "store_manager", "staff"],
    },
  },
} as const
