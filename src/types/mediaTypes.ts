
import { Tables } from "@/integrations/supabase/types";
import { Json } from "@/integrations/supabase/types";

// Extend the Buildings type with media_content as an optional field
export interface BuildingWithMedia extends Omit<Tables<"buildings">, "media_content"> {
  media_content?: Record<string, string[]> | Json | null;
}

// Extend the Listings type with media_content as an optional field
export interface ListingWithMedia extends Omit<Tables<"listings">, "media_content"> {
  media_content?: Record<string, string[]> | Json | null;
}
