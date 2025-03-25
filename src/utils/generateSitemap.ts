
import { supabase } from "@/integrations/supabase/client";
import { generateBuildingSlug } from "./slugUtils";
import fs from 'fs';
import path from 'path';

/**
 * Generate a sitemap.xml file for the website
 * @param baseUrl - The base URL of the website
 */
export async function generateSitemap(baseUrl: string = 'https://www.cozydwellsearch.com') {
  try {
    console.log('Generating sitemap...');
    // Fetch all buildings
    const { data: buildings, error } = await supabase
      .from('buildings')
      .select('id, name, locality, bhk_types, updated_at');
    
    if (error) throw error;

    // Fetch all localities
    const { data: localities, error: localitiesError } = await supabase
      .from('buildings')
      .select('locality')
      .not('locality', 'is', null);
    
    if (localitiesError) throw localitiesError;

    // Create unique set of localities
    const uniqueLocalities = new Set<string>();
    localities.forEach(item => {
      if (item.locality) uniqueLocalities.add(item.locality);
    });

    // Start XML content
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/buildings</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    // Add locality pages
    Array.from(uniqueLocalities).forEach((locality) => {
      xmlContent += `
  <url>
    <loc>${baseUrl}/buildings/locality/${encodeURIComponent(locality)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Add building detail pages
    buildings?.forEach((building) => {
      const slug = generateBuildingSlug(
        building.name,
        building.locality,
        building.bhk_types,
        building.id
      );
      const lastmod = building.updated_at 
        ? new Date(building.updated_at).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0];

      xmlContent += `
  <url>
    <loc>${baseUrl}/property/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Close XML
    xmlContent += `
</urlset>`;

    // Write to public directory
    const outputPath = path.resolve('public', 'sitemap.xml');
    fs.writeFileSync(outputPath, xmlContent);
    console.log(`Sitemap generated at ${outputPath}`);
    return { success: true, message: 'Sitemap generated successfully' };
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return { success: false, error };
  }
}
