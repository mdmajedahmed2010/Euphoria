import { unstable_cache } from 'next/cache'

/**
 * Centralized cache wrapper with tag-based invalidation.
 * TTL values are in seconds.
 */
export const CACHE_TAGS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  SETTINGS: 'settings',
  ANALYTICS: 'analytics',
  NOTIFICATIONS: 'notifications',
  CATEGORIES: 'categories',
  COLLECTIONS: 'collections',
} as const

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  ANALYTICS: 300, // 5 minutes for dashboard data
  SETTINGS: 600, // 10 minutes
} as const

/**
 * Create a cached function with tags and TTL.
 * Usage:
 * const getCachedProducts = createCachedFn(
 *   'products-list',
 *   async () => prisma.product.findMany(),
 *   [CACHE_TAGS.PRODUCTS],
 *   CACHE_TTL.MEDIUM
 * )
 */
export function createCachedFn<T>(
  key: string,
  fn: () => Promise<T>,
  tags: string[],
  revalidateSeconds: number = CACHE_TTL.MEDIUM
): () => Promise<T> {
  return unstable_cache(fn, [key], {
    tags,
    revalidate: revalidateSeconds,
  })
}
