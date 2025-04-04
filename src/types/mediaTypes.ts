
import { Tables } from "@/integrations/supabase/types";

// Extend the Buildings type to include media_content
export interface BuildingWithMedia extends Tables<"buildings"> {
  media_content?: Record<string, string[]> | null;
}

// Extend the Listings type to include media_content
export interface ListingWithMedia extends Tables<"listings"> {
  media_content?: Record<string, string[]> | null;
}
