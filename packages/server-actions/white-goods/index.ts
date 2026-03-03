'use server'

import { prisma, Prisma } from '@oglasi/database'
import type { WhiteGoodsInput } from '@oglasi/validation'

// Kreiranje bijele tehnike sa svim specifičnim detaljima
export async function createWhiteGoods(
  userId: string,
  adData: {
    title: string
    description: string
    price: number
    type: 'PRODAJA' | 'IZNAJMLJIVANJE'
    location?: {
      city: string
      municipality?: string
      address?: string
      postalCode?: string
      country?: string
      latitude?: number
      longitude?: number
    }
    images?: { url: string; alt?: string; order: number }[]
  },
  whiteGoodsData: WhiteGoodsInput
) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  return await prisma.$transaction(async (tx) => {
    let locationId: string | undefined

    if (adData.location?.city) {
      const createdLocation = await tx.location.create({
        data: {
          city: adData.location.city,
          municipality: adData.location.municipality,
          address: adData.location.address,
          postalCode: adData.location.postalCode,
          country: adData.location.country ?? 'Bosna i Hercegovina',
          latitude: adData.location.latitude ? new Prisma.Decimal(adData.location.latitude) : undefined,
          longitude: adData.location.longitude ? new Prisma.Decimal(adData.location.longitude) : undefined,
        },
      })
      locationId = createdLocation.id
    }

    return await tx.ad.create({
      data: {
        title: adData.title,
        description: adData.description,
        price: adData.price,
        category: 'BIJELA_TEHNIKA',
        type: adData.type,
        status: 'AKTIVNO',
        userId,
        locationId,
        whiteGoods: {
          create: whiteGoodsData as any,
        },
        images: adData.images
          ? {
              create: adData.images,
            }
          : undefined,
      },
      include: {
        whiteGoods: true,
        images: true,
        location: true,
      },
    })
  })
}

// Izmena bijele tehnike
export async function updateWhiteGoods(
  userId: string,
  adId: string,
  adData: {
    title?: string
    description?: string
    price?: number
    type?: 'PRODAJA' | 'IZNAJMLJIVANJE'
    status?: 'AKTIVNO' | 'NEAKTIVNO' | 'PRODATO' | 'IZNAJMLJENO'
    location?: {
      city: string
      municipality?: string
      address?: string
      postalCode?: string
      country?: string
      latitude?: number
      longitude?: number
    }
    images?: { url: string; alt?: string; order: number }[]
  },
  whiteGoodsData?: Partial<WhiteGoodsInput>
) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  return await prisma.$transaction(async (tx) => {
    // Verify ownership
    const ad = await tx.ad.findUnique({
      where: { id: adId },
      include: { whiteGoods: true },
    })

    if (!ad || ad.userId !== userId) {
      throw new Error('Unauthorized - You can only update your own ads')
    }

    if (ad.category !== 'BIJELA_TEHNIKA' || !ad.whiteGoods) {
      throw new Error('This ad is not a white goods listing')
    }

    let locationId = ad.locationId

    // Update or create location if provided
    if (adData.location?.city) {
      if (locationId) {
        await tx.location.update({
          where: { id: locationId },
          data: {
            city: adData.location.city,
            municipality: adData.location.municipality,
            address: adData.location.address,
            postalCode: adData.location.postalCode,
            country: adData.location.country ?? 'Bosna i Hercegovina',
            latitude: adData.location.latitude ? new Prisma.Decimal(adData.location.latitude) : undefined,
            longitude: adData.location.longitude ? new Prisma.Decimal(adData.location.longitude) : undefined,
          },
        })
      } else {
        const createdLocation = await tx.location.create({
          data: {
            city: adData.location.city,
            municipality: adData.location.municipality,
            address: adData.location.address,
            postalCode: adData.location.postalCode,
            country: adData.location.country ?? 'Bosna i Hercegovina',
            latitude: adData.location.latitude ? new Prisma.Decimal(adData.location.latitude) : undefined,
            longitude: adData.location.longitude ? new Prisma.Decimal(adData.location.longitude) : undefined,
          },
        })
        locationId = createdLocation.id
      }
    }

    // Update images if provided
    if (adData.images) {
      await tx.image.deleteMany({
        where: { adId },
      })

      if (adData.images.length > 0) {
        await tx.image.createMany({
          data: adData.images.map((img) => ({
            adId,
            url: img.url,
            alt: img.alt,
            order: img.order,
          })),
        })
      }
    }

    return await tx.ad.update({
      where: { id: adId },
      data: {
        title: adData.title,
        description: adData.description,
        price: adData.price,
        type: adData.type,
        status: adData.status,
        locationId,
        whiteGoods: whiteGoodsData
          ? {
              update: whiteGoodsData,
            }
          : undefined,
      },
      include: {
        whiteGoods: true,
        images: true,
        location: true,
      },
    })
  })
}

// Brisanje bijele tehnike
export async function deleteWhiteGoods(userId: string, adId: string) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  const ad = await prisma.ad.findUnique({
    where: { id: adId },
  })

  if (!ad || ad.userId !== userId) {
    throw new Error('Unauthorized - You can only delete your own ads')
  }

  if (ad.category !== 'BIJELA_TEHNIKA') {
    throw new Error('This ad is not a white goods listing')
  }

  return await prisma.ad.delete({
    where: { id: adId },
  })
}

// Dohvatanje sve bijele tehnike
export async function getWhiteGoods(filter?: {
  brand?: string
  condition?: 'NOVO' | 'KAO_NOVO' | 'DOBRO' | 'ZADOVOLJAVAJUCE'
  minPrice?: number
  maxPrice?: number
  warranty?: boolean
  energyClass?: string
  city?: string
  skip?: number
  take?: number
}) {
  const { skip = 0, take = 10, ...where } = filter || {}

  return await prisma.ad.findMany({
    where: {
      category: 'BIJELA_TEHNIKA',
      status: 'AKTIVNO',
      ...(where.minPrice || where.maxPrice
        ? {
            price: {
              ...(where.minPrice && { gte: where.minPrice }),
              ...(where.maxPrice && { lte: where.maxPrice }),
            },
          }
        : {}),
      ...(where.city
        ? {
            location: {
              city: {
                contains: where.city,
                mode: 'insensitive',
              },
            },
          }
        : {}),
      whiteGoods: {
        ...(where.brand && {
          brand: {
            contains: where.brand,
            mode: 'insensitive',
          },
        }),
        ...(where.condition && { condition: where.condition }),
        ...(where.warranty !== undefined && { warranty: where.warranty }),
        ...(where.energyClass && {
          energyClass: {
            contains: where.energyClass,
            mode: 'insensitive',
          },
        }),
      },
    },
    include: {
      whiteGoods: true,
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

// Dohvatanje jedne bijele tehnike
export async function getWhiteGoodsById(adId: string) {
  const ad = await prisma.ad.findUnique({
    where: { id: adId },
    include: {
      whiteGoods: true,
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
    },
  })

  if (!ad || ad.category !== 'BIJELA_TEHNIKA') {
    return null
  }

  // Increment views
  await prisma.ad.update({
    where: { id: adId },
    data: { views: { increment: 1 } },
  })

  return ad
}

// Dohvatanje korisnikove bijele tehnike
export async function getUserWhiteGoods(userId: string, skip = 0, take = 10) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  return await prisma.ad.findMany({
    where: {
      userId,
      category: 'BIJELA_TEHNIKA',
    },
    include: {
      whiteGoods: true,
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
