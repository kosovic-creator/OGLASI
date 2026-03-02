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

type UpdateAdWithDetailsInput = {
    title: string
    description: string
    price: number
    category: 'NEKRETNINE' | 'BIJELA_TEHNIKA' | 'AUTOMOBILI'
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
    images?: Array<{
        url: string
        alt?: string
        order?: number
    }>
}

export async function updateAdWithDetails(
    userId: string,
    adId: string,
    data: UpdateAdWithDetailsInput,
) {
    if (!userId) {
        throw new Error('Unauthorized - No user ID')
    }

    const existingAd = await prisma.ad.findUnique({
        where: { id: adId },
        include: {
            location: true,
            images: true,
        },
    })

    if (!existingAd || existingAd.userId !== userId) {
        throw new Error('Unauthorized - You can only update your own ads')
    }

    const { location, images = [], ...adData } = data

    return prisma.$transaction(async (tx) => {
        let locationId = existingAd.locationId

        if (location?.city) {
            if (existingAd.locationId) {
                await tx.location.update({
                    where: { id: existingAd.locationId },
                    data: {
                        city: location.city,
                        municipality: location.municipality,
                        address: location.address,
                        postalCode: location.postalCode,
                        country: location.country ?? 'Bosna i Hercegovina',
                        latitude: location.latitude ? new Prisma.Decimal(location.latitude) : null,
                        longitude: location.longitude ? new Prisma.Decimal(location.longitude) : null,
                    },
                })
            } else {
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
        }

        await tx.ad.update({
            where: { id: adId },
            data: {
                ...adData,
                ...(locationId ? { locationId } : {}),
            } as any,
        })

        await tx.image.deleteMany({
            where: { adId },
        })

        if (images.length > 0) {
            await tx.image.createMany({
                data: images.map((image, idx) => ({
                    adId,
                    url: image.url,
                    alt: image.alt,
                    order: image.order ?? idx,
                })),
            })
        }

        return tx.ad.findUnique({
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
    })
}
