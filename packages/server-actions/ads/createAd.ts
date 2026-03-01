'use server'

import { prisma } from '@oglasi/database'
import type { CreateAdInput, UpdateAdInput } from '@oglasi/validation'

export async function createAd(
  userId: string,
  data: CreateAdInput
) {
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

export async function updateAd(
  userId: string,
  adId: string,
  data: UpdateAdInput
) {
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

export async function deleteAd(userId: string, adId: string) {
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
    category?: string
    type?: string
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
      ...(where.category && { category: where.category as any }),
      ...(where.type && { type: where.type as any }),
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
