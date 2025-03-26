
/**
 * Utility functions for processing media files (images, videos, etc.)
 */

const GOOGLE_DRIVE_REGEX = /drive\.google\.com\/[^\/]+\/d\/([^\/]+)/;
const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
// Updated to catch more Google Maps URL formats, including maps.app.goo.gl links
const GOOGLE_MAPS_REGEX = /maps\.googleapis\.com|google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i;

/**
 * Detects if a URL is a Google Drive link
 * @param url The URL to check
 * @returns True if the URL is a Google Drive link
 */
export const isGoogleDriveUrl = (url: string): boolean => {
  return !!url && GOOGLE_DRIVE_REGEX.test(url);
};

/**
 * Converts a Google Drive link to a direct download link
 * @param url The Google Drive URL
 * @returns A direct download URL for the file
 */
export const getGoogleDriveDirectUrl = (url: string): string => {
  if (!url) return '';
  
  // Extract the file ID from the URL
  const match = url.match(GOOGLE_DRIVE_REGEX);
  if (!match || !match[1]) return url;
  
  const fileId = match[1];
  console.log(`Converting Google Drive link: File ID = ${fileId} from URL: ${url}`);
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
};

/**
 * Detects if a URL is a YouTube link
 * @param url The URL to check
 * @returns True if the URL is a YouTube link
 */
export const isYoutubeUrl = (url: string): boolean => {
  return !!url && YOUTUBE_REGEX.test(url);
};

/**
 * Converts a YouTube URL to an embed URL
 * @param url The YouTube URL
 * @returns An embed URL for the video
 */
export const getYoutubeEmbedUrl = (url: string): string => {
  if (!url) return '';
  
  const match = url.match(YOUTUBE_REGEX);
  if (!match || !match[1]) return url;
  
  const videoId = match[1];
  console.log(`Converting YouTube link: Video ID = ${videoId} from URL: ${url}`);
  return `https://www.youtube.com/embed/${videoId}`;
};

/**
 * Detects if a URL is a Google Maps link
 * @param url The URL to check
 * @returns True if the URL is a Google Maps link
 */
export const isGoogleMapsUrl = (url: string): boolean => {
  console.log(`Checking if URL is Google Maps: ${url}`);
  const result = !!url && GOOGLE_MAPS_REGEX.test(url);
  console.log(`isGoogleMapsUrl result: ${result}`);
  return result;
};

/**
 * Converts a Google Maps URL to an embed URL
 * @param url The Google Maps URL
 * @returns An embed URL for the map
 */
export const getGoogleMapsEmbedUrl = (url: string): string => {
  if (!url) return '';
  
  console.log(`Processing Google Maps URL: ${url}`);
  
  // Handle short URLs (goo.gl/maps or maps.app.goo.gl)
  if (url.includes('goo.gl/')) {
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sin!4v1633935892999!5m2!1sen!2sin&q=${encodeURIComponent(url)}`;
  }
  
  // If it's already an embed URL, return as is
  if (url.includes('/embed')) {
    return url;
  }
  
  // Try to extract location from the URL
  try {
    // For regular Google Maps URLs that contain a location param
    const locationMatch = url.match(/[?&]q=([^&]+)/);
    if (locationMatch && locationMatch[1]) {
      const location = decodeURIComponent(locationMatch[1]);
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sin!4v1633935892999!5m2!1sen!2sin&q=${encodeURIComponent(location)}`;
    }
    
    // For Google Maps URLs that have coordinates
    const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordsMatch && coordsMatch[1] && coordsMatch[2]) {
      const lat = coordsMatch[1];
      const lng = coordsMatch[2];
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sin!4v1633935892999!5m2!1sen!2sin&q=${lat},${lng}`;
    }
  } catch (e) {
    console.error('Error processing Google Maps URL:', e);
  }
  
  // If all else fails, use the original URL in an iframe src
  return url;
};

/**
 * Processes a URL to ensure it's in a format that can be displayed
 * @param url The URL to process
 * @returns A processed URL that can be displayed
 */
export const processMediaUrl = (url: string): string => {
  if (!url) return '';
  
  console.log(`Processing media URL: ${url}`);
  
  if (isGoogleDriveUrl(url)) {
    return getGoogleDriveDirectUrl(url);
  }
  
  if (isYoutubeUrl(url)) {
    return getYoutubeEmbedUrl(url);
  }
  
  if (isGoogleMapsUrl(url)) {
    return getGoogleMapsEmbedUrl(url);
  }
  
  return url;
};

/**
 * Determines the type of media from a URL
 * @param url The URL to analyze
 * @returns The type of media ('image', 'video', 'map', or 'unknown')
 */
export const getMediaType = (url: string): 'image' | 'video' | 'map' | 'unknown' => {
  if (!url) return 'unknown';
  
  const lowerUrl = url.toLowerCase();
  
  if (isYoutubeUrl(url)) return 'video';
  if (isGoogleMapsUrl(url)) return 'map';
  
  if (lowerUrl.match(/\.(jpeg|jpg|gif|png|webp|avif|svg)(\?.*)?$/)) return 'image';
  if (lowerUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/)) return 'video';
  
  // For Google Drive, try to guess based on context or fallback to image
  if (isGoogleDriveUrl(url)) return 'image';
  
  return 'unknown';
};

/**
 * Processes and normalizes image URLs to ensure they're in a consistent format
 * @param images Image URLs that could be in various formats (string, array, JSON string)
 * @returns Normalized array of image URLs
 */
export const normalizeImageArray = (images: unknown): string[] => {
  // If null or undefined, return empty array
  if (!images) {
    console.log("normalizeImageArray: Input is null or undefined, returning empty array");
    return [];
  }
  
  console.log("normalizeImageArray: Processing input:", images);
  
  // If already an array, return it (with type safety check)
  if (Array.isArray(images)) {
    console.log("normalizeImageArray: Input is already an array");
    const filteredArray = images.filter(Boolean).map(img => {
      if (typeof img === 'string') {
        return processMediaUrl(img);
      }
      return String(img);
    });
    console.log("normalizeImageArray: Filtered array:", filteredArray);
    return filteredArray;
  }
  
  // If it's a string that looks like JSON, try to parse it
  if (typeof images === 'string' && (images.startsWith('[') || images.startsWith('{'))) {
    try {
      console.log("normalizeImageArray: Input looks like JSON, attempting to parse");
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        const filteredArray = parsed.filter(Boolean).map(img => {
          if (typeof img === 'string') {
            return processMediaUrl(img);
          }
          return String(img);
        });
        console.log("normalizeImageArray: Successfully parsed as array:", filteredArray);
        return filteredArray;
      } else {
        console.log("normalizeImageArray: Parsed JSON is not an array, treating as single string");
        return [processMediaUrl(images)];
      }
    } catch (e) {
      // If parsing fails, treat as a single string
      console.error('normalizeImageArray: Error parsing image JSON:', e);
      return [processMediaUrl(images)];
    }
  }
  
  // If it's a comma-separated string, split it
  if (typeof images === 'string' && images.includes(',')) {
    console.log("normalizeImageArray: Input is comma-separated string, splitting");
    const splitArray = images.split(',').map(img => processMediaUrl(img.trim())).filter(Boolean);
    console.log("normalizeImageArray: Split result:", splitArray);
    return splitArray;
  }
  
  // If it's just a single string
  if (typeof images === 'string') {
    console.log("normalizeImageArray: Input is a single string");
    return [processMediaUrl(images)];
  }
  
  // Fallback: return empty array if none of the above
  console.warn('normalizeImageArray: Unhandled image format:', images);
  return [];
};

/**
 * Gets a thumbnail image URL either from the designated thumbnail or the first available image
 * @param thumbnailUrl Specific thumbnail URL if available
 * @param images Array of image URLs to use as fallback
 * @param aiStagedPhotos Array of AI-staged photos to prioritize over regular images
 * @returns The most appropriate thumbnail URL
 */
export const getThumbnailUrl = (
  thumbnailUrl: string | null | undefined, 
  images: string[] | null | undefined, 
  aiStagedPhotos: string[] | null | undefined
): string => {
  console.log("getThumbnailUrl: Input params:", { thumbnailUrl, imagesCount: images?.length, aiPhotosCount: aiStagedPhotos?.length });
  
  // If there's a specific thumbnail, use it
  if (thumbnailUrl) {
    console.log("getThumbnailUrl: Using explicit thumbnail:", thumbnailUrl);
    return processMediaUrl(thumbnailUrl);
  }
  
  // Next priority: AI-staged photos if available
  const aiPhotos = normalizeImageArray(aiStagedPhotos);
  if (aiPhotos.length > 0) {
    console.log("getThumbnailUrl: Using first AI staged photo:", aiPhotos[0]);
    return aiPhotos[0];
  }
  
  // Fall back to regular images
  const normalImages = normalizeImageArray(images);
  if (normalImages.length > 0) {
    console.log("getThumbnailUrl: Using first regular image:", normalImages[0]);
    return normalImages[0];
  }
  
  // Default fallback to one of the existing lovable uploads
  console.log("getThumbnailUrl: No images found, using default fallback");
  return "/lovable-uploads/df976f06-4486-46b6-9664-1022c080dd75.png";
};

/**
 * Creates a media metadata object to categorize and organize different types of media
 * @param images Regular images
 * @param aiStagedPhotos AI-generated staged photos
 * @param floorPlanImage Floor plan image
 * @param videoUrl Video URL
 * @param streetViewUrl Street view URL
 * @returns Structured media metadata object
 */
export const createMediaMetadata = (
  images: string[] | null | undefined,
  aiStagedPhotos: string[] | null | undefined,
  floorPlanImage: string | null | undefined,
  videoUrl: string | null | undefined,
  streetViewUrl: string | null | undefined
) => {
  return {
    regularImages: normalizeImageArray(images),
    aiStagedPhotos: normalizeImageArray(aiStagedPhotos),
    floorPlan: floorPlanImage ? processMediaUrl(floorPlanImage) : null,
    video: videoUrl ? processMediaUrl(videoUrl) : null,
    streetView: streetViewUrl ? processMediaUrl(streetViewUrl) : null,
    lastUpdated: new Date().toISOString()
  };
};
