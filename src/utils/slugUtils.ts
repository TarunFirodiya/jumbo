
/**
 * Utility functions for generating and handling URL slugs
 */

/**
 * Creates a URL-friendly slug from building information
 * @param buildingName - The name of the building
 * @param locality - The locality/area of the building
 * @param bhkTypes - Array of BHK types available in the building
 * @param id - The building ID (used as fallback and for uniqueness)
 */
export function generateBuildingSlug(
  buildingName: string, 
  locality?: string | null, 
  bhkTypes?: (string | number)[] | null,
  id?: string
): string {
  // Create parts for the slug
  const parts: string[] = [];
  
  // Add BHK types if available (e.g., "2-3-bhk")
  if (bhkTypes && bhkTypes.length > 0) {
    const uniqueBhks = [...new Set(bhkTypes)].sort();
    if (uniqueBhks.length === 1) {
      parts.push(`${uniqueBhks[0]}-bhk`);
    } else {
      parts.push(`${uniqueBhks.join("-")}-bhk`);
    }
  }
  
  // Add building name
  if (buildingName) {
    parts.push(buildingName);
  }
  
  // Add locality if available
  if (locality) {
    parts.push(locality);
  }
  
  // Convert to slug format
  let slug = parts
    .join("-")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars except hyphen
    .replace(/\s+/g, "-")     // Replace spaces with hyphens
    .replace(/-+/g, "-")      // Replace multiple hyphens with single hyphen
    .trim();
  
  // Add a portion of the ID at the end for uniqueness (last 6 chars)
  if (id) {
    slug += `-${id.slice(-6)}`;
  }
  
  return slug;
}

/**
 * Extracts the building ID from a slug
 * @param slug - The building slug
 * @returns The building ID if found in the slug
 */
export function extractIdFromSlug(slug: string): string | null {
  // The ID is the last 6 characters after the last hyphen
  const match = slug.match(/-([a-zA-Z0-9]{6})$/);
  return match ? match[1] : null;
}
