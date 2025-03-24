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
          bank: string[] | null
          bhk_types: number[] | null
          building_status: Database["public"]["Enums"]["building_status"] | null
          city: string | null
          collections: string[] | null
          created_at: string | null
          data_source: string | null
          google_rating: number | null
          id: string
          images: string[] | null
          latitude: number | null
          lifestyle_cohort: number | null
          locality: string | null
          longitude: number | null
          map_link: string | null
          max_price: number | null
          min_price: number | null
          name: string
          nearby_places: Json | null
          price_psqft: number | null
          street_view: string | null
          sub_locality: string | null
          total_floors: number | null
          total_units: number | null
          type: string | null
          updated_at: string | null
          user_id: string | null
          video_thumbnail: string | null
          water: string[] | null
        }
        Insert: {
          age?: number | null
          amenities?: string[] | null
          bank?: string[] | null
          bhk_types?: number[] | null
          building_status?:
            | Database["public"]["Enums"]["building_status"]
            | null
          city?: string | null
          collections?: string[] | null
          created_at?: string | null
          data_source?: string | null
          google_rating?: number | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          lifestyle_cohort?: number | null
          locality?: string | null
          longitude?: number | null
          map_link?: string | null
          max_price?: number | null
          min_price?: number | null
          name: string
          nearby_places?: Json | null
          price_psqft?: number | null
          street_view?: string | null
          sub_locality?: string | null
          total_floors?: number | null
          total_units?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_thumbnail?: string | null
          water?: string[] | null
        }
        Update: {
          age?: number | null
          amenities?: string[] | null
          bank?: string[] | null
          bhk_types?: number[] | null
          building_status?:
            | Database["public"]["Enums"]["building_status"]
            | null
          city?: string | null
          collections?: string[] | null
          created_at?: string | null
          data_source?: string | null
          google_rating?: number | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          lifestyle_cohort?: number | null
          locality?: string | null
          longitude?: number | null
          map_link?: string | null
          max_price?: number | null
          min_price?: number | null
          name?: string
          nearby_places?: Json | null
          price_psqft?: number | null
          street_view?: string | null
          sub_locality?: string | null
          total_floors?: number | null
          total_units?: number | null
          type?: string | null
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
      get_visit_details: {
        Args: {
          visit_id_param: string
        }
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
