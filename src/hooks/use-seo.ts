
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

interface UseSEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  noindex?: boolean;
  structuredData?: Record<string, any>;
}

export function useSEO({
  title,
  description,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  keywords,
  noindex,
  structuredData,
}: UseSEOProps = {}) {
  const location = useLocation();
  
  return useMemo(() => {
    const siteUrl = 'https://www.cozydwellsearch.com';
    const canonical = `${siteUrl}${location.pathname}`;
    
    // Default structured data for website
    const defaultStructuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Cozy Dwell Search",
      "url": siteUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/buildings?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };
    
    return {
      title: title || 'Cozy Dwell Search | Find Your Perfect Home',
      description: description || 'Search for your dream home with personalized recommendations and detailed listings. Find apartments, villas, and houses that match your preferences.',
      canonical,
      ogImage: image || '/og-image.png',
      type,
      publishedTime,
      modifiedTime,
      keywords: keywords || ['real estate', 'property search', 'apartments', 'homes for sale', 'rental properties'],
      noindex: noindex || false,
      structuredData: structuredData || defaultStructuredData,
    };
  }, [
    title,
    description,
    image,
    type,
    publishedTime,
    modifiedTime,
    keywords,
    noindex,
    structuredData,
    location.pathname
  ]);
}
