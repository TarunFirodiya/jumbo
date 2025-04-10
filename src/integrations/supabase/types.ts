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
      app_config: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      buildings: {
        Row: {
          age: number | null
          amenities: string[] | null
          bhk_types: number[] | null
          building_status: Database["public"]["Enums"]["building_status"] | null
          city: string | null
          collections: string[] | null
          created_at: string | null
          google_rating: number | null
          id: string
          images: string[] | null
          latitude: number | null
          locality: string | null
          longitude: number | null
          map_link: string | null
          media_content: Json | null
          min_price: number | null
          name: string
          nearby_places: Json | null
          price_psqft: number | null
          street_view: string | null
          sub_locality: string | null
          total_floors: number | null
          total_units: number | null
          updated_at: string | null
          user_id: string | null
          video_thumbnail: string | null
          water: string[] | null
        }
        Insert: {
          age?: number | null
          amenities?: string[] | null
          bhk_types?: number[] | null
          building_status?:
            | Database["public"]["Enums"]["building_status"]
            | null
          city?: string | null
          collections?: string[] | null
          created_at?: string | null
          google_rating?: number | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          map_link?: string | null
          media_content?: Json | null
          min_price?: number | null
          name: string
          nearby_places?: Json | null
          price_psqft?: number | null
          street_view?: string | null
          sub_locality?: string | null
          total_floors?: number | null
          total_units?: number | null
          updated_at?: string | null
          user_id?: string | null
          video_thumbnail?: string | null
          water?: string[] | null
        }
        Update: {
          age?: number | null
          amenities?: string[] | null
          bhk_types?: number[] | null
          building_status?:
            | Database["public"]["Enums"]["building_status"]
            | null
          city?: string | null
          collections?: string[] | null
          created_at?: string | null
          google_rating?: number | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          map_link?: string | null
          media_content?: Json | null
          min_price?: number | null
          name?: string
          nearby_places?: Json | null
          price_psqft?: number | null
          street_view?: string | null
          sub_locality?: string | null
          total_floors?: number | null
          total_units?: number | null
          updated_at?: string | null
          user_id?: string | null
          video_thumbnail?: string | null
          water?: string[] | null
        }
        Relationships: []
      }
      listings: {
        Row: {
          "99acres_price": number | null
          active_loan_flag: boolean | null
          agent_id: string | null
          ai_staged_photos: string[] | null
          availability: string | null
          balconies: number | null
          bathrooms: number | null
          bedrooms: number | null
          building_id: string | null
          building_name: string | null
          built_up_area: number | null
          carpet_area: number | null
          created_at: string
          e_khata_obtained_flag: boolean | null
          estimated_furnishing_cost: number | null
          facing: string | null
          floor: number | null
          floor_plan_image: string | null
          furnishing_age: number | null
          furnishing_status: string | null
          housing_price: number | null
          id: string
          images: string[] | null
          khata_type: Database["public"]["Enums"]["khata_type"] | null
          listing_price: number | null
          loan_bank: string | null
          magicbricks_price: number | null
          maintenance: number | null
          media_content: Json | null
          media_metadata: Json | null
          nobroker_price: number | null
          occupancy_status:
            | Database["public"]["Enums"]["occupancy_status"]
            | null
          parking_spots: number | null
          preferred_visit_days:
            | Database["public"]["Enums"]["preferred_visit_days"][]
            | null
          preferred_visit_times:
            | Database["public"]["Enums"]["preferred_visit_times"][]
            | null
          price: number | null
          price_psqft: number | null
          reserve_price: number | null
          status: string | null
          thumbnail_image: string | null
          uds_area: number | null
          variants: Json[] | null
          visit_fulfiller: Database["public"]["Enums"]["visit_fulfiller"] | null
        }
        Insert: {
          "99acres_price"?: number | null
          active_loan_flag?: boolean | null
          agent_id?: string | null
          ai_staged_photos?: string[] | null
          availability?: string | null
          balconies?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          building_id?: string | null
          building_name?: string | null
          built_up_area?: number | null
          carpet_area?: number | null
          created_at?: string
          e_khata_obtained_flag?: boolean | null
          estimated_furnishing_cost?: number | null
          facing?: string | null
          floor?: number | null
          floor_plan_image?: string | null
          furnishing_age?: number | null
          furnishing_status?: string | null
          housing_price?: number | null
          id?: string
          images?: string[] | null
          khata_type?: Database["public"]["Enums"]["khata_type"] | null
          listing_price?: number | null
          loan_bank?: string | null
          magicbricks_price?: number | null
          maintenance?: number | null
          media_content?: Json | null
          media_metadata?: Json | null
          nobroker_price?: number | null
          occupancy_status?:
            | Database["public"]["Enums"]["occupancy_status"]
            | null
          parking_spots?: number | null
          preferred_visit_days?:
            | Database["public"]["Enums"]["preferred_visit_days"][]
            | null
          preferred_visit_times?:
            | Database["public"]["Enums"]["preferred_visit_times"][]
            | null
          price?: number | null
          price_psqft?: number | null
          reserve_price?: number | null
          status?: string | null
          thumbnail_image?: string | null
          uds_area?: number | null
          variants?: Json[] | null
          visit_fulfiller?:
            | Database["public"]["Enums"]["visit_fulfiller"]
            | null
        }
        Update: {
          "99acres_price"?: number | null
          active_loan_flag?: boolean | null
          agent_id?: string | null
          ai_staged_photos?: string[] | null
          availability?: string | null
          balconies?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          building_id?: string | null
          building_name?: string | null
          built_up_area?: number | null
          carpet_area?: number | null
          created_at?: string
          e_khata_obtained_flag?: boolean | null
          estimated_furnishing_cost?: number | null
          facing?: string | null
          floor?: number | null
          floor_plan_image?: string | null
          furnishing_age?: number | null
          furnishing_status?: string | null
          housing_price?: number | null
          id?: string
          images?: string[] | null
          khata_type?: Database["public"]["Enums"]["khata_type"] | null
          listing_price?: number | null
          loan_bank?: string | null
          magicbricks_price?: number | null
          maintenance?: number | null
          media_content?: Json | null
          media_metadata?: Json | null
          nobroker_price?: number | null
          occupancy_status?:
            | Database["public"]["Enums"]["occupancy_status"]
            | null
          parking_spots?: number | null
          preferred_visit_days?:
            | Database["public"]["Enums"]["preferred_visit_days"][]
            | null
          preferred_visit_times?:
            | Database["public"]["Enums"]["preferred_visit_times"][]
            | null
          price?: number | null
          price_psqft?: number | null
          reserve_price?: number | null
          status?: string | null
          thumbnail_image?: string | null
          uds_area?: number | null
          variants?: Json[] | null
          visit_fulfiller?:
            | Database["public"]["Enums"]["visit_fulfiller"]
            | null
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
          email: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      property_media: {
        Row: {
          building_id: string | null
          created_at: string
          display_order: number | null
          id: string
          is_thumbnail: boolean | null
          listing_id: string | null
          metadata: Json | null
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          building_id?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_thumbnail?: boolean | null
          listing_id?: string | null
          metadata?: Json | null
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          building_id?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_thumbnail?: boolean | null
          listing_id?: string | null
          metadata?: Json | null
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_media_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_media_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_building_scores: {
        Row: {
          building_id: string
          calculated_at: string
          id: string
          notes: string | null
          shortlisted: boolean
          user_id: string
        }
        Insert: {
          building_id: string
          calculated_at?: string
          id?: string
          notes?: string | null
          shortlisted?: boolean
          user_id: string
        }
        Update: {
          building_id?: string
          calculated_at?: string
          id?: string
          notes?: string | null
          shortlisted?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_building_scores_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          amenities: string[] | null
          bhk_preferences: number[] | null
          created_at: string | null
          deal_breakers: string[] | null
          home_features: string[] | null
          id: string
          lifestyle_cohort: number | null
          max_budget: number | null
          notes: string | null
          preferred_localities: Json[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amenities?: string[] | null
          bhk_preferences?: number[] | null
          created_at?: string | null
          deal_breakers?: string[] | null
          home_features?: string[] | null
          id?: string
          lifestyle_cohort?: number | null
          max_budget?: number | null
          notes?: string | null
          preferred_localities?: Json[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amenities?: string[] | null
          bhk_preferences?: number[] | null
          created_at?: string | null
          deal_breakers?: string[] | null
          home_features?: string[] | null
          id?: string
          lifestyle_cohort?: number | null
          max_budget?: number | null
          notes?: string | null
          preferred_localities?: Json[] | null
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
      visits: {
        Row: {
          agent_id: string | null
          building_id: string
          created_at: string
          id: string
          listing_id: string
          updated_at: string
          user_id: string
          visit_day: string
          visit_status: Database["public"]["Enums"]["visit_status"] | null
          visit_time: string
        }
        Insert: {
          agent_id?: string | null
          building_id: string
          created_at?: string
          id?: string
          listing_id: string
          updated_at?: string
          user_id: string
          visit_day: string
          visit_status?: Database["public"]["Enums"]["visit_status"] | null
          visit_time: string
        }
        Update: {
          agent_id?: string | null
          building_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          updated_at?: string
          user_id?: string
          visit_day?: string
          visit_status?: Database["public"]["Enums"]["visit_status"] | null
          visit_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_user_id_fkey"
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
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_visit_details: {
        Args: { visit_id_param: string }
        Returns: {
          visit_day: string
          visit_time: string
          bedrooms: number
          name: string
          locality: string
          sub_locality: string
          full_name: string
          phone_number: string
          visit_status: string
          map_link: string
          agent_name: string
          property_type: string
          agent_phone: string
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      building_status: "Photos Pending" | "Publish"
      collections:
        | "Affordable"
        | "Gated Apartment"
        | "New Construction"
        | "Child Friendly"
        | "Luxury Community"
        | "Spacious Layout"
        | "Vastu Compliant"
      khata_type: "A" | "B"
      listing_status: "Available" | "Draft" | "Booked" | "Sold" | "Churned"
      occupancy_status:
        | "Vacant"
        | "Owner Occupied"
        | "Tenant Occupied"
        | "Builder Occupied"
      preferred_visit_days:
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
        | "Saturday"
        | "Sunday"
      preferred_visit_times:
        | "Morning (8 am - 12 pm)"
        | "Afternoon (12 pm - 4 pm)"
        | "Evening (4 pm - 8 pm)"
      visit_fulfiller: "Broker" | "Serai"
      visit_status: "confirmed" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      building_status: ["Photos Pending", "Publish"],
      collections: [
        "Affordable",
        "Gated Apartment",
        "New Construction",
        "Child Friendly",
        "Luxury Community",
        "Spacious Layout",
        "Vastu Compliant",
      ],
      khata_type: ["A", "B"],
      listing_status: ["Available", "Draft", "Booked", "Sold", "Churned"],
      occupancy_status: [
        "Vacant",
        "Owner Occupied",
        "Tenant Occupied",
        "Builder Occupied",
      ],
      preferred_visit_days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      preferred_visit_times: [
        "Morning (8 am - 12 pm)",
        "Afternoon (12 pm - 4 pm)",
        "Evening (4 pm - 8 pm)",
      ],
      visit_fulfiller: ["Broker", "Serai"],
      visit_status: ["confirmed", "completed", "cancelled"],
    },
  },
} as const
