import type { MetadataRoute } from 'next';

// Static for now. Docs/landing rewrite (project 09) will populate with real entries.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://ajentify.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://ajentify.com/landing',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
