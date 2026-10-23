import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://runnerup.in';

  const privatePaths = [
    '/dashboard/',
    '/admin/',
    '/api/',
    '/sign-in',
    '/sign-up',
    '/unsubscribe',
    '/payment-success',
  ];

  // AI search engines and search crawlers that drive user traffic & citations
  const searchAndAIBots = [
    'Googlebot',
    'Bingbot',
    'GPTBot',
    'ChatGPT-User',
    'PerplexityBot',
    'ClaudeBot',
    'Claude-Web',
    'Applebot',
    'DuckDuckBot',
    'Slurp',
    'Twitterbot',
    'facebookexternalhit',
    'LinkedInBot',
    'WhatsApp',
  ];

  // Low-value scrapers and abusive bots with no search/traffic benefit
  const lowQualityScrapers = [
    'CCBot',
    'Bytespider',
    'PetalBot',
    'DotBot',
    'MJ12bot',
  ];

  return {
    rules: [
      ...lowQualityScrapers.map((bot) => ({
        userAgent: bot,
        disallow: ['/'],
      })),
      ...searchAndAIBots.map((bot) => ({
        userAgent: bot,
        allow: '/',
        disallow: privatePaths,
      })),
      {
        userAgent: '*',
        allow: '/',
        disallow: privatePaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

