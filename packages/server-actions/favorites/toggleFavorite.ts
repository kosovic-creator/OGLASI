'use server'

import { prisma } from '@oglasi/database'

export async function toggleFavorite(
  userId: string,
  adId: string
) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_adId: {
        userId,
        adId,
      },
    },
  })

  if (existing) {
    await prisma.favorite.delete({
      where: {
        userId_adId: {
          userId,
          adId,
        },
      },
    })
    return { isFavorite: false }
  } else {
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        adId,
      },
    })
    return { isFavorite: true, favorite }
  }
}

export async function isFavorite(userId: string, adId: string): Promise<boolean> {
  if (!userId) {
    return false
  }

  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_adId: {
        userId,
        adId,
      },
    },
  })

  return !!favorite
}

export async function getUserFavorites(userId: string, skip = 0, take = 10) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  return await prisma.favorite.findMany({
    where: { userId },
    include: {
      ad: {
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
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  })
}
