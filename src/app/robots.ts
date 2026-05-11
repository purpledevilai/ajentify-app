import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/landing', '/privacy'],
      disallow: ['/agents/', '/tools/', '/sres/', '/contexts/', '/documents/'],
    },
    sitemap: 'https://ajentify.com/sitemap.xml',
  };
}
