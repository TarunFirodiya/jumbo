
import { Database } from "@/integrations/supabase/types";
import { Json } from "@/integrations/supabase/types";

// Define the shape of completion status for buildings and listings
export interface CompletionStatus {
  basic_info: boolean;
  location: boolean;
  features: boolean;
  media: boolean;
  pricing: boolean;
}

// Define the shape of completion status for listings
export interface ListingCompletionStatus {
  basic_info: boolean;
  floor_plan: boolean;
  pricing: boolean;
  features: boolean;
  media: boolean;
}

// Define the shape of building features
export interface BuildingFeatures {
  amenities: string[];
  security: string[];
  connectivity: string[];
  lifestyle: string[];
}

// Building type aligned with Supabase schema
export type Building = Database['public']['Tables']['buildings']['Row'] & {
  completion_status: CompletionStatus;
  features: BuildingFeatures;
};

// Listing type aligned with Supabase schema
export type Listing = Database['public']['Tables']['listings']['Row'];

// Make properties optional that are required in the database
type ListingRow = Database['public']['Tables']['listings']['Row'];
type OptionalKeys = 'ai_staged_photos' | 'availability' | 'balconies' | 'bathrooms' | 'bedrooms' | 'building_id' | 'building_name' | 'built_up_area' | 'carpet_area' | 'floor';

// Media type for the new property_media table
export interface PropertyMedia {
  id: string;
  building_id: string | null;
  listing_id: string | null;
  type: 'regular' | 'ai_staged' | 'floor_plan' | 'video' | 'street_view';
  url: string;
  is_thumbnail: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

// Enhanced listing with properly typed images and media
export interface EnhancedListing extends Partial<ListingRow> {
  id: string;
  media?: PropertyMedia[];
  images?: string[];
  ai_staged_photos?: string[];
  completion_status?: ListingCompletionStatus;
  variant_options?: {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
  }[];
  floor_plan_image?: string | null;
  building_id?: string;
  building_name?: string;
  bedrooms?: number;
  bathrooms?: number;
  built_up_area?: number;
  carpet_area?: number | null;
  floor?: number;
  price?: number;
  maintenance?: number;
  facing?: string | null;
  parking_spots?: number | null;
  balconies?: number | null;
  furnishing_status?: string | null;
  status?: string;
  availability?: string | null;
}
