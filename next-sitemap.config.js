/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://dstech.example.com', // Replace with your actual site URL
  generateRobotsTxt: true, // Generate robots.txt based on sitemap
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      // Add disallow rules for specific paths if needed, e.g.,
      // { userAgent: '*', disallow: '/admin' },
      { userAgent: '*', disallow: '/api' }, // Usually good to disallow API routes
    ],
    additionalSitemaps: [
      // If you have other sitemaps, e.g., for a blog hosted elsewhere
      // (process.env.SITE_URL || 'https://dstech.example.com') + '/server-sitemap.xml',
    ],
  },
  // Optional: Default is to exclude /api/* routes. Add other exclusions if needed.
  // exclude: ['/server-sitemap.xml', '/api/*'], // /api/* is already excluded by default
  // Optional: For dynamic routes, you might need a custom transform function or additionalSitemaps
  // See documentation: https://www.npmjs.com/package/next-sitemap
};
