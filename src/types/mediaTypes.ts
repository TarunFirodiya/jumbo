
// Type for safe JSON objects from Supabase that might be strings, objects, or null
export type SafeJsonObject = Record<string, any> | string | null | undefined;

// Type for processed media content
export interface MediaContent {
  photos: Record<string, string[]>;
  aiStagedPhotos: Record<string, string[]>;
  video: string | null;
  streetView: string | null;
  floorPlan: string | null;
  thumbnail: string | null;
}

// Extended building type with media fields
export interface BuildingWithMedia {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  images?: string[];
  video_thumbnail?: string | null;
  street_view?: string | null;
  media_content?: SafeJsonObject;
  [key: string]: any; // Allow for other fields
}

// Extended listing type with media fields
export interface ListingWithMedia {
  id: string;
  created_at: string;
  building_id?: string;
  building_name?: string;
  images?: string[];
  ai_staged_photos?: string[];
  floor_plan_image?: string | null;
  thumbnail_image?: string | null;
  media_content?: SafeJsonObject;
  [key: string]: any; // Allow for other fields
}
