/**
 * Utility functions for processing media files (images, videos, etc.)
 */

/**
 * Processes and normalizes image URLs to ensure they're in a consistent format
 * @param images Image URLs that could be in various formats (string, array, JSON string)
 * @returns Normalized array of image URLs
 */
export const normalizeImageArray = (images: unknown): string[] => {
  // If null or undefined, return empty array
  if (!images) return [];
  
  // If already an array, return it (with type safety check)
  if (Array.isArray(images)) {
    return images.filter(Boolean) as string[];
  }
  
  // If it's a string that looks like JSON, try to parse it
  if (typeof images === 'string' && (images.startsWith('[') || images.startsWith('{'))) {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [images];
    } catch (e) {
      // If parsing fails, treat as a single string
      console.error('Error parsing image JSON:', e);
    }
  }
  
  // If it's a comma-separated string, split it
  if (typeof images === 'string' && images.includes(',')) {
    return images.split(',').map(img => img.trim()).filter(Boolean);
  }
  
  // If it's just a single string
  if (typeof images === 'string') {
    return [images];
  }
  
  // Fallback: return empty array if none of the above
  console.warn('Unhandled image format:', images);
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
  // If there's a specific thumbnail, use it
  if (thumbnailUrl) return thumbnailUrl;
  
  // Next priority: AI-staged photos if available
  const aiPhotos = normalizeImageArray(aiStagedPhotos);
  if (aiPhotos.length > 0) return aiPhotos[0];
  
  // Fall back to regular images
  const normalImages = normalizeImageArray(images);
  if (normalImages.length > 0) return normalImages[0];
  
  // Default fallback to one of the existing lovable uploads
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
    floorPlan: floorPlanImage || null,
    video: videoUrl || null,
    streetView: streetViewUrl || null,
    lastUpdated: new Date().toISOString()
  };
};
