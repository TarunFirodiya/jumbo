
import { Filter } from "@/components/ui/filters";
import { Tables } from "@/integrations/supabase/types";

export function getSEODescription(
  localityDisplayName: string,
  selectedCollections: string[],
  activeFilters: Filter[],
  filteredBuildingsCount: number
) {
  let description = `Browse properties in ${localityDisplayName}. `;
  if (selectedCollections.length) {
    description += `Explore ${selectedCollections.join(', ')} properties. `;
  }
  if (activeFilters.length) {
    const filterTypes = activeFilters.map(f => f.type).join(', ');
    description += `Filtered by ${filterTypes}. `;
  }
  description += `${filteredBuildingsCount} properties available. Find your perfect home with detailed listings, amenities, and pricing information.`;
  return description;
}

export function getKeywords(
  localityDisplayName: string,
  selectedCollections: string[],
  activeFilters: Filter[]
) {
  const keywords = [
    `${localityDisplayName} real estate`,
    `${localityDisplayName} property`,
    `${localityDisplayName} apartments`
  ];
  
  if (selectedCollections.length) {
    selectedCollections.forEach(collection => {
      keywords.push(`${collection} in ${localityDisplayName}`);
    });
  }
  
  const bhkFilters = activeFilters.find(f => f.type === 'BHK');
  if (bhkFilters) {
    bhkFilters.value.forEach(bhk => {
      keywords.push(`${bhk} in ${localityDisplayName}`);
    });
  }
  
  return keywords;
}

export function getStructuredData(
  localityDisplayName: string,
  locality: string | undefined,
  filteredBuildingsCount: number
) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Jumbo",
    "description": getSEODescription(localityDisplayName, [], [], filteredBuildingsCount),
    "url": `https://www.jumbohomes.com/buildings/locality/${encodeURIComponent(locality || '')}`,
    "areaServed": {
      "@type": "City",
      "name": localityDisplayName
    },
    "numberOfItems": filteredBuildingsCount,
    "telephone": "+91-8800000000",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `https://www.jumbohomes.com/buildings/locality/${encodeURIComponent(locality || '')}?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}
