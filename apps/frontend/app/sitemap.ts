import { MetadataRoute } from 'next';
import { getSitemapData } from '@/lib/cms/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://visiontechsolutions.co.in';
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/projects`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  try {
    const data = await getSitemapData();
    const serviceUrls = (data.services || []).map((s: any) => ({
      url: `${baseUrl}/services/${s.slug}`,
      lastModified: new Date(s.updatedAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));
    const projectUrls = (data.projects || []).map((p: any) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: new Date(p.updatedAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));
    return [...staticRoutes, ...serviceUrls, ...projectUrls];
  } catch {
    return staticRoutes;
  }
}
