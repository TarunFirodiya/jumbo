
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Sitemap() {
  const { data: buildings } = useQuery({
    queryKey: ['buildings-sitemap'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('id, name, locality, updated_at');
      if (error) throw error;
      return data;
    },
  });

  const generateSitemap = () => {
    const baseUrl = 'https://yourdomain.com'; // Replace with actual domain
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/buildings</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${buildings?.map(building => `
  <url>
    <loc>${baseUrl}/buildings/${building.id}</loc>
    <lastmod>${new Date(building.updated_at).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('')}
</urlset>`;
  };

  return (
    <pre>
      {generateSitemap()}
    </pre>
  );
}
