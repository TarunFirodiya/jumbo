import { MediaContent, SafeJsonObject } from "@/types/mediaTypes";

/**
 * Processes a media URL to ensure it's in a format that can be displayed
 * @param url The URL to process
 * @returns A processed URL that can be displayed
 */
export const processMediaUrl = (url: string): string => {
  if (!url) return '';
  
  // Handle Google Drive URLs
  if (url.includes('drive.google.com')) {
    const match = url.match(/drive\.google\.com\/[^\/]+\/d\/([^\/]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }
  
  // Handle YouTube URLs
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  
  // For HEIC formats, we might want to convert or handle them specially
  // For now, just log that we're processing a HEIC file
  if (url.toLowerCase().endsWith('.heic')) {
    console.log("Processing HEIC image:", url);
    // In the future, we might want to use a conversion service here
  }
  
  // Return the URL as is if no special processing is needed
  return url;
};

/**
 * Safely converts the Supabase JSON field to a Record<string, string[]>
 * @param jsonData The JSON data from Supabase
 * @returns A safe Record or empty object
 */
export const safeJsonToRecord = (jsonData: SafeJsonObject): Record<string, string[]> => {
  if (!jsonData) {
    console.log("SafeJsonToRecord: jsonData is null or undefined");
    return {};
  }
  
  console.log("SafeJsonToRecord input:", typeof jsonData, jsonData);
  
  // If it's a string, try to parse it
  if (typeof jsonData === 'string') {
    try {
      const parsed = JSON.parse(jsonData);
      console.log("SafeJsonToRecord: parsed string data:", parsed);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return safeJsonToRecord(parsed);
      }
    } catch (e) {
      console.error("SafeJsonToRecord: Failed to parse string as JSON", e);
      return {};
    }
  }
  
  // If it's a number, boolean, null, or array, return empty object
  if (typeof jsonData !== 'object' || Array.isArray(jsonData) || jsonData === null) {
    console.log("SafeJsonToRecord: jsonData is not an object, returning empty object");
    return {};
  }
  
  // If it's already a proper Record<string, string[]>, return it
  const result: Record<string, string[]> = {};
  
  try {
    // Attempt to convert the JSON object to our expected format
    Object.entries(jsonData).forEach(([key, value]) => {
      // Skip null/undefined values
      if (value == null) {
        console.log(`SafeJsonToRecord: Skipping null/undefined value for key ${key}`);
        return;
      }
      
      // If the value is already an array of strings, use it
      if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
        console.log(`SafeJsonToRecord: Using array of strings for key ${key}:`, value);
        result[key] = value;
      }
      // If the value is a string, wrap it in an array
      else if (typeof value === 'string') {
        console.log(`SafeJsonToRecord: Converting string to array for key ${key}:`, value);
        result[key] = [value];
      }
      // Otherwise log what we're skipping
      else {
        console.log(`SafeJsonToRecord: Skipping value with unexpected type for key ${key}:`, typeof value, value);
      }
    });
    
    console.log("SafeJsonToRecord result:", result);
    return result;
  } catch (error) {
    console.error("Error processing JSON data:", error);
    return {};
  }
};

/**
 * Processes the media content structure
 * @param mediaContent The media content object from Supabase
 * @returns Categorized media content
 */
export const processMediaContent = (mediaContent: SafeJsonObject): MediaContent => {
  console.log("Processing media content (input):", mediaContent);
  
  // Initialize default result
  const result: MediaContent = {
    photos: {},
    aiStagedPhotos: {},
    video: null,
    streetView: null,
    floorPlan: null,
    thumbnail: null
  };
  
  // If there's no content, return the default structure
  if (!mediaContent) {
    console.log("No media_content provided, returning empty structure");
    return result;
  }

  // Get the safe record from the JSON content
  const safeContent = safeJsonToRecord(mediaContent);
  
  // If we got no safe content, return the default result
  if (Object.keys(safeContent).length === 0) {
    console.log("No safe content found in media_content");
    return result;
  }
  
  console.log("Safe content after conversion:", safeContent);
  
  // Process each key in the media content
  Object.entries(safeContent).forEach(([key, urls]) => {
    if (!Array.isArray(urls) || urls.length === 0) {
      console.log(`Skipping empty or non-array value for key ${key}`);
      return;
    }
    
    const lowerKey = key.toLowerCase();
    console.log(`Processing media key: ${key} with ${urls.length} URLs`);
    
    // Process special categories first
    if (lowerKey.includes('video')) {
      result.video = processMediaUrl(urls[0]);
      console.log(`Set video URL to: ${result.video}`);
      return;
    }
    
    if (lowerKey.includes('streetview') || lowerKey === 'street view') {
      result.streetView = processMediaUrl(urls[0]);
      console.log(`Set street view URL to: ${result.streetView}`);
      return;
    }
    
    if (lowerKey.includes('floorplan') || lowerKey === 'floor plan') {
      result.floorPlan = processMediaUrl(urls[0]);
      console.log(`Set floor plan URL to: ${result.floorPlan}`);
      return;
    }
    
    if (lowerKey === 'thumbnail') {
      result.thumbnail = processMediaUrl(urls[0]);
      console.log(`Set thumbnail URL to: ${result.thumbnail}`);
      return;
    }
    
    // Process room-based imagery
    if (lowerKey.endsWith('_imagine') || lowerKey.includes('imagine')) {
      const roomName = key.replace('_Imagine', '').replace('_imagine', '');
      result.aiStagedPhotos[roomName] = urls.map(processMediaUrl);
      console.log(`Added ${urls.length} AI staged photos for room ${roomName}`);
      return;
    }
    
    // All other keys are treated as regular photos with room names
    result.photos[key] = urls.map(processMediaUrl);
    console.log(`Added ${urls.length} regular photos for category ${key}`);
  });
  
  console.log("Processed media content result:", result);
  return result;
};

/**
 * Extracts regular photos array from categorized media content
 * @param content Processed media content
 * @returns Array of regular photo URLs
 */
export const extractRegularPhotos = (content: MediaContent): string[] => {
  const photos: string[] = [];
  
  // Flatten all room photos into a single array
  Object.values(content.photos).forEach(roomPhotos => {
    photos.push(...roomPhotos);
  });
  
  console.log("Extracted regular photos:", photos);
  return photos;
};

/**
 * Extracts AI staged photos array from categorized media content
 * @param content Processed media content
 * @returns Array of AI staged photo URLs
 */
export const extractAiStagedPhotos = (content: MediaContent): string[] => {
  const aiPhotos: string[] = [];
  
  // Flatten all AI staged room photos into a single array
  Object.values(content.aiStagedPhotos).forEach(roomPhotos => {
    aiPhotos.push(...roomPhotos);
  });
  
  console.log("Extracted AI staged photos:", aiPhotos);
  return aiPhotos;
};

/**
 * Gets a default placeholder image for missing content
 * @returns URL to a placeholder image
 */
export const getPlaceholderImage = (): string => {
  return "/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png";
};

/**
 * Determines if a URL is a valid image URL
 * @param url The URL to check
 * @returns True if the URL appears to be a valid image
 */
export const isImageUrl = (url: string): boolean => {
  return !!url && /\.(jpeg|jpg|gif|png|webp|avif|svg|heic)(\?.*)?$/i.test(url);
};

/**
 * Determines if a URL is a YouTube video
 * @param url The URL to check
 * @returns True if the URL is a YouTube link
 */
export const isYoutubeUrl = (url: string): boolean => {
  return !!url && (url.includes('youtube.com') || url.includes('youtu.be'));
};

/**
 * Determines if a URL is a Google Maps link
 * @param url The URL to check
 * @returns True if the URL is a Google Maps link
 */
export const isGoogleMapsUrl = (url: string): boolean => {
  return !!url && /maps\.googleapis\.com|google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(url);
};
