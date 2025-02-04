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
      listings: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          building_id: string | null
          building_name: string | null
          built_up_area: number | null
          created_at: string
          facing: string | null
          floor: number | null
          id: string
          maintenance: number | null
          price: number | null
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          building_id?: string | null
          building_name?: string | null
          built_up_area?: number | null
          created_at?: string
          facing?: string | null
          floor?: number | null
          id?: string
          maintenance?: number | null
          price?: number | null
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          building_id?: string | null
          building_name?: string | null
          built_up_area?: number | null
          created_at?: string
          facing?: string | null
          floor?: number | null
          id?: string
          maintenance?: number | null
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
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
          amenities_match_score: number | null
          bhk_match_score: number | null
          budget_match_score: number | null
          building_id: string | null
          calculated_at: string | null
          id: string
          last_calculation_time: string | null
          lifestyle_match_score: number | null
          locality_match_score: number | null
          location_match_score: number | null
          notes: string | null
          overall_match_score: number | null
          shortlisted: boolean | null
          top_callout_1: string | null
          top_callout_2: string | null
          user_id: string | null
        }
        Insert: {
          amenities_match_score?: number | null
          bhk_match_score?: number | null
          budget_match_score?: number | null
          building_id?: string | null
          calculated_at?: string | null
          id?: string
          last_calculation_time?: string | null
          lifestyle_match_score?: number | null
          locality_match_score?: number | null
          location_match_score?: number | null
          notes?: string | null
          overall_match_score?: number | null
          shortlisted?: boolean | null
          top_callout_1?: string | null
          top_callout_2?: string | null
          user_id?: string | null
        }
        Update: {
          amenities_match_score?: number | null
          bhk_match_score?: number | null
          budget_match_score?: number | null
          building_id?: string | null
          calculated_at?: string | null
          id?: string
          last_calculation_time?: string | null
          lifestyle_match_score?: number | null
          locality_match_score?: number | null
          location_match_score?: number | null
          notes?: string | null
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
          amenities: string[] | null
          bhk_preferences: string[] | null
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
          preferred_localities: Json[] | null
          size: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amenities?: string[] | null
          bhk_preferences?: string[] | null
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
          preferred_localities?: Json[] | null
          size?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amenities?: string[] | null
          bhk_preferences?: string[] | null
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
          preferred_localities?: Json[] | null
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
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
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
