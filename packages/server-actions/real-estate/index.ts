'use server'

import { prisma, Prisma } from '@oglasi/database'
import type { RealEstateInput } from '@oglasi/validation'

// Kreiranje nekretnine sa svim specifičnim detaljima
export async function createRealEstate(
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
  realEstateData: RealEstateInput
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
        category: 'NEKRETNINE',
        type: adData.type,
        status: 'AKTIVNO',
        userId,
        locationId,
        realEstate: {
          create: realEstateData as any,
        },
        images: adData.images
          ? {
              create: adData.images,
            }
          : undefined,
      },
      include: {
        realEstate: true,
        images: true,
        location: true,
      },
    })
  })
}

// Izmena nekretnine
export async function updateRealEstate(
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
  realEstateData?: Partial<RealEstateInput>
) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  return await prisma.$transaction(async (tx) => {
    // Verify ownership
    const ad = await tx.ad.findUnique({
      where: { id: adId },
      include: { realEstate: true },
    })

    if (!ad || ad.userId !== userId) {
      throw new Error('Unauthorized - You can only update your own ads')
    }

    if (ad.category !== 'NEKRETNINE' || !ad.realEstate) {
      throw new Error('This ad is not a real estate listing')
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
        realEstate: realEstateData
          ? {
              update: realEstateData,
            }
          : undefined,
      },
      include: {
        realEstate: true,
        images: true,
        location: true,
      },
    })
  })
}

// Brisanje nekretnine
export async function deleteRealEstate(userId: string, adId: string) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  const ad = await prisma.ad.findUnique({
    where: { id: adId },
  })

  if (!ad || ad.userId !== userId) {
    throw new Error('Unauthorized - You can only delete your own ads')
  }

  if (ad.category !== 'NEKRETNINE') {
    throw new Error('This ad is not a real estate listing')
  }

  return await prisma.ad.delete({
    where: { id: adId },
  })
}

// Dohvatanje svih nekretnina
export async function getRealEstates(filter?: {
  realEstateType?: 'STAN' | 'KUCA' | 'POSLOVNI_PROSTOR'
  minSurface?: number
  maxSurface?: number
  minRooms?: number
  maxRooms?: number
  minPrice?: number
  maxPrice?: number
  heating?: string
  parking?: boolean
  elevator?: boolean
  furnished?: boolean
  city?: string
  skip?: number
  take?: number
}) {
  const { skip = 0, take = 10, ...where } = filter || {}

  return await prisma.ad.findMany({
    where: {
      category: 'NEKRETNINE',
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
      realEstate: {
        ...(where.realEstateType && { realEstateType: where.realEstateType }),
        ...(where.minSurface || where.maxSurface
          ? {
              surface: {
                ...(where.minSurface && { gte: where.minSurface }),
                ...(where.maxSurface && { lte: where.maxSurface }),
              },
            }
          : {}),
        ...(where.minRooms || where.maxRooms
          ? {
              rooms: {
                ...(where.minRooms && { gte: where.minRooms }),
                ...(where.maxRooms && { lte: where.maxRooms }),
              },
            }
          : {}),
        ...(where.heating && { heating: where.heating as any }),
        ...(where.parking !== undefined && { parking: where.parking }),
        ...(where.elevator !== undefined && { elevator: where.elevator }),
        ...(where.furnished !== undefined && { furnished: where.furnished }),
      },
    },
    include: {
      realEstate: true,
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

// Dohvatanje jedne nekretnine
export async function getRealEstateById(adId: string) {
  const ad = await prisma.ad.findUnique({
    where: { id: adId },
    include: {
      realEstate: true,
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

  if (!ad || ad.category !== 'NEKRETNINE') {
    return null
  }

  // Increment views
  await prisma.ad.update({
    where: { id: adId },
    data: { views: { increment: 1 } },
  })

  return ad
}

// Dohvatanje korisnikovih nekretnina
export async function getUserRealEstates(userId: string, skip = 0, take = 10) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  return await prisma.ad.findMany({
    where: {
      userId,
      category: 'NEKRETNINE',
    },
    include: {
      realEstate: true,
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
