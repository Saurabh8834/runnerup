import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://runnerup.in';

  const aggressiveBots = [
    'GPTBot',
    'ChatGPT-User',
    'ClaudeBot',
    'CCBot',
    'Bytespider',
    'PetalBot',
    'AhrefsBot',
    'SemrushBot',
    'DotBot',
    'MJ12bot',
    'Amazonbot',
  ];

  return {
    rules: [
      ...aggressiveBots.map((bot) => ({
        userAgent: bot,
        disallow: ['/'],
      })),
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/sign-in',
          '/sign-up',
          '/unsubscribe',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/sign-in',
          '/sign-up',
          '/unsubscribe',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/sign-in',
          '/sign-up',
          '/unsubscribe',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
