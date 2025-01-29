export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      buildings: {
        Row: {
          age: string | null
          amenities_cohort: number | null
          bhk_types: string[] | null
          created_at: string | null
          data_source: string | null
          features: Json | null
          google_rating: number | null
          id: string
          images: string[] | null
          latitude: number | null
          locality: string | null
          longitude: number | null
          map_link: string | null
          max_price: number | null
          min_price: number | null
          name: string
          price_psqft: number | null
          street_view: string | null
          sub_locality: string | null
          total_floors: number | null
          type: string | null
          updated_at: string | null
          video_thumbnail: string | null
        }
        Insert: {
          age?: string | null
          amenities_cohort?: number | null
          bhk_types?: string[] | null
          created_at?: string | null
          data_source?: string | null
          features?: Json | null
          google_rating?: number | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          map_link?: string | null
          max_price?: number | null
          min_price?: number | null
          name: string
          price_psqft?: number | null
          street_view?: string | null
          sub_locality?: string | null
          total_floors?: number | null
          type?: string | null
          updated_at?: string | null
          video_thumbnail?: string | null
        }
        Update: {
          age?: string | null
          amenities_cohort?: number | null
          bhk_types?: string[] | null
          created_at?: string | null
          data_source?: string | null
          features?: Json | null
          google_rating?: number | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          map_link?: string | null
          max_price?: number | null
          min_price?: number | null
          name?: string
          price_psqft?: number | null
          street_view?: string | null
          sub_locality?: string | null
          total_floors?: number | null
          type?: string | null
          updated_at?: string | null
          video_thumbnail?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_building_scores: {
        Row: {
          budget_match_score: number | null
          building_id: string | null
          calculated_at: string | null
          id: string
          last_calculation_time: string | null
          lifestyle_match_score: number | null
          location_match_score: number | null
          overall_match_score: number | null
          shortlisted: boolean | null
          top_callout_1: string | null
          top_callout_2: string | null
          user_id: string | null
        }
        Insert: {
          budget_match_score?: number | null
          building_id?: string | null
          calculated_at?: string | null
          id?: string
          last_calculation_time?: string | null
          lifestyle_match_score?: number | null
          location_match_score?: number | null
          overall_match_score?: number | null
          shortlisted?: boolean | null
          top_callout_1?: string | null
          top_callout_2?: string | null
          user_id?: string | null
        }
        Update: {
          budget_match_score?: number | null
          building_id?: string | null
          calculated_at?: string | null
          id?: string
          last_calculation_time?: string | null
          lifestyle_match_score?: number | null
          location_match_score?: number | null
          overall_match_score?: number | null
          shortlisted?: boolean | null
          top_callout_1?: string | null
          top_callout_2?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_building_scores_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_building_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preference_weights: {
        Row: {
          budget_weight: number | null
          created_at: string | null
          id: string
          lifestyle_weight: number | null
          location_weight: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          budget_weight?: number | null
          created_at?: string | null
          id?: string
          lifestyle_weight?: number | null
          location_weight?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          budget_weight?: number | null
          created_at?: string | null
          id?: string
          lifestyle_weight?: number | null
          location_weight?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preference_weights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          deal_breakers: string[] | null
          home_features: string[] | null
          id: string
          lifestyle_cohort: string | null
          location_latitude: number | null
          location_longitude: number | null
          location_preference_input: string | null
          location_radius: number | null
          max_budget: number | null
          notes: string | null
          size: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deal_breakers?: string[] | null
          home_features?: string[] | null
          id?: string
          lifestyle_cohort?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          location_preference_input?: string | null
          location_radius?: number | null
          max_budget?: number | null
          notes?: string | null
          size?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deal_breakers?: string[] | null
          home_features?: string[] | null
          id?: string
          lifestyle_cohort?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          location_preference_input?: string | null
          location_radius?: number | null
          max_budget?: number | null
          notes?: string | null
          size?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferred_buildings: {
        Row: {
          building_id: string
          created_at: string | null
          user_id: string
        }
        Insert: {
          building_id: string
          created_at?: string | null
          user_id: string
        }
        Update: {
          building_id?: string
          created_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferred_buildings_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferred_buildings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
