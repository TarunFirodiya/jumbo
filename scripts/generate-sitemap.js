
// This script runs during build to generate the sitemap.xml file
const { generateSitemap } = require('../dist/utils/generateSitemap');

// Get the base URL from environment or use default
const baseUrl = process.env.SITE_URL || 'https://www.cozydwellsearch.com';

// Generate the sitemap
generateSitemap(baseUrl)
  .then(result => {
    if (result.success) {
      console.log(result.message);
      process.exit(0);
    } else {
      console.error('Failed to generate sitemap:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Error in sitemap generation script:', error);
    process.exit(1);
  });
