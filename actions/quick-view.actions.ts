'use server'

/**
 * BIBAZ — Quick View Server Actions
 * Fetches real product variants from DB for the Quick View modal.
 */

import { prisma } from '@/lib/db'

export interface QuickViewVariant {
  id: string
  sku: string
  size: string | null
  color: string | null
  price: number
  stock: number
  images: string[]
}

export async function getProductVariants(productId: string): Promise<{
  success: boolean
  data: QuickViewVariant[]
}> {
  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId, isActive: true },
      select: {
        id: true,
        sku: true,
        size: true,
        color: true,
        price: true,
        stock: true,
        images: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return {
      success: true,
      data: variants.map((v) => ({
        ...v,
        price: Number(v.price),
        images: (v.images as string[]) || [],
      })),
    }
  } catch (error) {
    console.error('[QUICK-VIEW] Failed to fetch variants:', error)
    return { success: false, data: [] }
  }
}
