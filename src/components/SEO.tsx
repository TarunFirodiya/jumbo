
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  type?: 'website' | 'article';
  structuredData?: Record<string, any>;
  noindex?: boolean;
  keywords?: string[];
  language?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export function SEO({
  title = 'Cozy Dwell Search | Find Your Perfect Home',
  description = 'Search for your dream home with personalized recommendations and detailed listings. Find apartments, villas, and houses that match your preferences.',
  canonical,
  ogImage = '/og-image.png',
  type = 'website',
  structuredData,
  noindex = false,
  keywords = ['real estate', 'property search', 'apartments', 'homes for sale', 'rental properties'],
  language = 'en',
  author = 'Cozy Dwell Search',
  publishedTime,
  modifiedTime,
}: SEOProps) {
  const siteUrl = 'https://www.cozydwellsearch.com';
  
  return (
    <Helmet>
      <html lang={language} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      
      {canonical && <link rel="canonical" href={canonical.startsWith('http') ? canonical : `${siteUrl}${canonical}`} />}
      
      {/* Robots meta tag for noindex */}
      {noindex && <meta name="robots" content="noindex" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical ? (canonical.startsWith('http') ? canonical : `${siteUrl}${canonical}`) : siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content="Cozy Dwell Search" />
      <meta property="og:locale" content={language === 'en' ? 'en_US' : language} />
      
      {/* Additional Open Graph article tags */}
      {type === 'article' && publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {type === 'article' && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {type === 'article' && <meta property="article:author" content={author} />}
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical ? (canonical.startsWith('http') ? canonical : `${siteUrl}${canonical}`) : siteUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Mobile viewport optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      
      {/* Additional mobile optimization */}
      <meta name="theme-color" content="#ffffff" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </Helmet>
  );
}
