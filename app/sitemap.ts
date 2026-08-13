/**
 * Euphoria — Sitemap
 * SOP §৭ — SEO Infrastructure
 * Auto-generated sitemap for search engines
 *
 * TODO: Add dynamic product/collection URLs from DB (Phase 3)
 */

import type { MetadataRoute } from "next";

const BASE_URL = "https://euphoriabd.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/about",
    "/contact",
    "/terms",
    "/refund-policy",
    "/track-order",
    "/login",
    "/register",
  ];

  const collections = [
    "/collections/kundan-bridal-sets",
    "/collections/polki-necklaces",
    "/collections/pearl-jewellery",
    "/collections/long-chains",
    "/collections/choker-sets",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const collectionEntries: MetadataRoute.Sitemap = collections.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  // TODO: Add product URLs dynamically from DB
  // const products = await getActiveProducts();
  // const productEntries = products.map(...)

  return [...staticEntries, ...collectionEntries];
}
