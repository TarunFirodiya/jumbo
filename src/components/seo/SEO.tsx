
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  structuredData?: object;
  type?: 'website' | 'article';
}

export function SEO({ 
  title, 
  description, 
  canonical, 
  ogImage, 
  structuredData,
  type = 'website' 
}: SEOProps) {
  const siteUrl = 'https://yourdomain.com'; // Replace with actual domain
  const fullUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const imageUrl = ogImage ? `${siteUrl}${ogImage}` : `${siteUrl}/og-image.png`;

  return (
    <Helmet>
      {/* Basic metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={imageUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
