
import { Tables } from "@/integrations/supabase/types";
import { Json } from "@/integrations/supabase/types";

// MediaCategory represents different types of media content
export type MediaCategory = 'photos' | 'aiStaged' | 'video' | 'streetView' | 'floorPlan';

// Define the structure of media content
export interface MediaContent {
  // Regular photos organized by room/category
  photos: Record<string, string[]>;
  // AI-staged photos organized by room/category
  aiStagedPhotos: Record<string, string[]>;
  // Video URL (YouTube or direct)
  video: string | null;
  // Street view URL (Google Maps)
  streetView: string | null;
  // Floor plan image URL
  floorPlan: string | null;
  // Thumbnail image URL
  thumbnail: string | null;
}

// Helper type for safely managing Supabase JSON field - expanded to accept all possible JSON values
export type SafeJsonObject = Json | Record<string, string[]> | Record<string, any> | null;

// Type for buildings with media_content field
export interface BuildingWithMedia extends Tables<"buildings"> {
  media_content: SafeJsonObject;
}

// Type for listings with media_content field
export interface ListingWithMedia extends Tables<"listings"> {
  media_content: SafeJsonObject;
}
