'use server'

import { prisma } from '@oglasi/database'
import type { Ad, AdCategory, AdType } from '@oglasi/database'

export interface CreateAdInput {
  title: string
  description: string
  price: number
  category: AdCategory
  type: AdType
  locationId?: string
}

export async function createAd(
  userId: string,
  data: CreateAdInput
): Promise<Ad> {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  return await prisma.ad.create({
    data: {
      ...data,
      userId,
    },
  })
}

export interface UpdateAdInput extends Partial<CreateAdInput> {}

export async function updateAd(
  userId: string,
  adId: string,
  data: UpdateAdInput
): Promise<Ad> {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  // Verify ownership
  const ad = await prisma.ad.findUnique({
    where: { id: adId },
  })

  if (!ad || ad.userId !== userId) {
    throw new Error('Unauthorized - You can only update your own ads')
  }

  return await prisma.ad.update({
    where: { id: adId },
    data,
  })
}

export async function deleteAd(userId: string, adId: string): Promise<Ad> {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  // Verify ownership
  const ad = await prisma.ad.findUnique({
    where: { id: adId },
  })

  if (!ad || ad.userId !== userId) {
    throw new Error('Unauthorized - You can only delete your own ads')
  }

  return await prisma.ad.delete({
    where: { id: adId },
  })
}

export async function getAdById(adId: string) {
  return await prisma.ad.findUnique({
    where: { id: adId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      location: true,
      images: {
        orderBy: { order: 'asc' },
      },
      realEstate: true,
      whiteGoods: true,
      vehicle: true,
    },
  })
}

export async function getAds(
  filter?: {
    category?: AdCategory
    type?: AdType
    city?: string
    minPrice?: number
    maxPrice?: number
    featured?: boolean
    skip?: number
    take?: number
  }
) {
  const { skip = 0, take = 10, ...where } = filter || {}

  return await prisma.ad.findMany({
    where: {
      ...(where.category && { category: where.category }),
      ...(where.type && { type: where.type }),
      ...(where.featured !== undefined && { featured: where.featured }),
      ...(where.minPrice || where.maxPrice) && {
        price: {
          ...(where.minPrice && { gte: where.minPrice }),
          ...(where.maxPrice && { lte: where.maxPrice }),
        },
      },
      ...(where.city && {
        location: {
          city: {
            contains: where.city,
            mode: 'insensitive',
          },
        },
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      location: true,
      images: {
        take: 1,
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  })
}

export async function getUserAds(userId: string, skip = 0, take = 10) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  return await prisma.ad.findMany({
    where: { userId },
    include: {
      location: true,
      images: {
        take: 1,
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  })
}

export async function incrementAdViews(adId: string) {
  return await prisma.ad.update({
    where: { id: adId },
    data: {
      views: {
        increment: 1,
      },
    },
  })
}
