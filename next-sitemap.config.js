/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  generateRobotsTxt: false, // We already have a custom robots.txt
  generateIndexSitemap: true,
  exclude: ['/api/*', '/login', '/register', '/profile', '/settings'],
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api', '/login', '/register', '/profile', '/settings'],
      },
    ],
  },
}
