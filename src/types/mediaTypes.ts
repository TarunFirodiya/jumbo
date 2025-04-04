
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

// Type for buildings with media_content field
export interface BuildingWithMedia extends Tables<"buildings"> {
  media_content: Record<string, string[]> | Json | null;
}

// Type for listings with media_content field
export interface ListingWithMedia extends Tables<"listings"> {
  media_content: Record<string, string[]> | Json | null;
}
