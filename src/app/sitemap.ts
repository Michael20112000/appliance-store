import type { MetadataRoute } from "next";
import { getEnv } from "@/lib/env";
import {
  listCategories,
  listPublicProductSlugsForSitemap,
} from "@/server/services/catalog.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const [categories, productSlugs] = await Promise.all([
    listCategories(),
    listPublicProductSlugsForSitemap(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${baseUrl}/katalog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/katalog/${category.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${baseUrl}/tovar/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
