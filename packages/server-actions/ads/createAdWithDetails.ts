'use server'

import { prisma, Prisma } from '@oglasi/database'
import type { CreateAdInput } from '@oglasi/validation'

type CreateAdWithDetailsInput = CreateAdInput & {
  location?: {
    city: string
    municipality?: string
    address?: string
    postalCode?: string
    country?: string
        latitude?: number
        longitude?: number
  }
  realEstate?: {
    realEstateType: 'STAN' | 'KUCA' | 'POSLOVNI_PROSTOR'
    surface: number
    rooms?: number
    bathrooms?: number
    floor?: number
    totalFloors?: number
    yearBuilt?: number
    heating?: 'CENTRALNO' | 'ETAZNO' | 'PLIN' | 'STRUJA' | 'PELET' | 'KRUTO_GORIVO' | 'TOPLOTNA_PUMPA' | 'KLIMA'
    parking?: boolean
    elevator?: boolean
    balcony?: boolean
    terrace?: boolean
    garden?: boolean
    furnished?: boolean
  }
  images?: Array<{
    url: string
    alt?: string
    order?: number
  }>
}

export async function createAdWithDetails(
  userId: string,
  data: CreateAdWithDetailsInput
) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  const { location, realEstate, images = [], ...adData } = data

  return prisma.$transaction(async (tx) => {
    let locationId: string | undefined

    if (location?.city) {
      const createdLocation = await tx.location.create({
        data: {
          city: location.city,
          municipality: location.municipality,
          address: location.address,
          postalCode: location.postalCode,
          country: location.country ?? 'Bosna i Hercegovina',
              latitude: location.latitude ? new Prisma.Decimal(location.latitude) : undefined,
              longitude: location.longitude ? new Prisma.Decimal(location.longitude) : undefined,
        },
      })

      locationId = createdLocation.id
    }

      const createAdData = {
          ...adData,
          userId,
          ...(locationId ? { locationId } : {}),
      }

      const ad = await tx.ad.create({
          data: createAdData as any,
    })

    if (ad.category === 'NEKRETNINE' && realEstate) {
      await tx.realEstate.create({
        data: {
          adId: ad.id,
          ...realEstate,
        },
      })
    }

    if (images.length > 0) {
      await tx.image.createMany({
        data: images.map((img, idx) => ({
          adId: ad.id,
          url: img.url,
          alt: img.alt,
          order: img.order ?? idx,
        })),
      })
    }

    return tx.ad.findUnique({
      where: { id: ad.id },
      include: {
        location: true,
        realEstate: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    })
  })
}
