'use server'

import { prisma, Prisma } from '@oglasi/database'
import type { VehicleInput } from '@oglasi/validation'

// Kreiranje automobila sa svim specifičnim detaljima
export async function createVehicle(
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
  vehicleData: VehicleInput
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
        category: 'AUTOMOBILI',
        type: adData.type,
        status: 'AKTIVNO',
        userId,
        locationId,
        vehicle: {
          create: vehicleData as any,
        },
        images: adData.images
          ? {
              create: adData.images,
            }
          : undefined,
      },
      include: {
        vehicle: true,
        images: true,
        location: true,
      },
    })
  })
}

// Izmena automobila
export async function updateVehicle(
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
  vehicleData?: Partial<VehicleInput>
) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  return await prisma.$transaction(async (tx) => {
    // Verify ownership
    const ad = await tx.ad.findUnique({
      where: { id: adId },
      include: { vehicle: true },
    })

    if (!ad || ad.userId !== userId) {
      throw new Error('Unauthorized - You can only update your own ads')
    }

    if (ad.category !== 'AUTOMOBILI' || !ad.vehicle) {
      throw new Error('This ad is not a vehicle listing')
    }

    let locationId = ad.locationId

    // Update or create location if provided
    if (adData.location?.city) {
      if (locationId) {
        // Update existing location
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
        // Create new location
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
      // Delete existing images
      await tx.image.deleteMany({
        where: { adId },
      })

      // Create new images
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

    // Update ad and vehicle data
    return await tx.ad.update({
      where: { id: adId },
      data: {
        title: adData.title,
        description: adData.description,
        price: adData.price,
        type: adData.type,
        status: adData.status,
        locationId,
        vehicle: vehicleData
          ? {
              update: vehicleData,
            }
          : undefined,
      },
      include: {
        vehicle: true,
        images: true,
        location: true,
      },
    })
  })
}

// Brisanje automobila
export async function deleteVehicle(userId: string, adId: string) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  const ad = await prisma.ad.findUnique({
    where: { id: adId },
  })

  if (!ad || ad.userId !== userId) {
    throw new Error('Unauthorized - You can only delete your own ads')
  }

  if (ad.category !== 'AUTOMOBILI') {
    throw new Error('This ad is not a vehicle listing')
  }

  return await prisma.ad.delete({
    where: { id: adId },
  })
}

// Dohvatanje svih automobila
export async function getVehicles(filter?: {
  vehicleType?: 'AUTOMOBIL' | 'TERETNO' | 'MOTOCIKL'
  brand?: string
  fuelType?: 'BENZIN' | 'DIZEL' | 'HIBRID' | 'ELEKTRICNI' | 'PLIN'
  transmission?: 'MANUELNI' | 'AUTOMATIK'
  minYear?: number
  maxYear?: number
  minPrice?: number
  maxPrice?: number
  maxMileage?: number
  city?: string
  skip?: number
  take?: number
}) {
  const { skip = 0, take = 10, ...where } = filter || {}

  return await prisma.ad.findMany({
    where: {
      category: 'AUTOMOBILI',
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
      vehicle: {
        ...(where.vehicleType && { vehicleType: where.vehicleType }),
        ...(where.brand && {
          brand: {
            contains: where.brand,
            mode: 'insensitive',
          },
        }),
        ...(where.fuelType && { fuelType: where.fuelType }),
        ...(where.transmission && { transmission: where.transmission }),
        ...(where.minYear || where.maxYear
          ? {
              yearOfManufacture: {
                ...(where.minYear && { gte: where.minYear }),
                ...(where.maxYear && { lte: where.maxYear }),
              },
            }
          : {}),
        ...(where.maxMileage && { mileage: { lte: where.maxMileage } }),
      },
    },
    include: {
      vehicle: true,
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

// Dohvatanje jednog automobila
export async function getVehicleById(adId: string) {
  const ad = await prisma.ad.findUnique({
    where: { id: adId },
    include: {
      vehicle: true,
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

  if (!ad || ad.category !== 'AUTOMOBILI') {
    return null
  }

  // Increment views
  await prisma.ad.update({
    where: { id: adId },
    data: { views: { increment: 1 } },
  })

  return ad
}

// Dohvatanje korisnikovih automobila
export async function getUserVehicles(userId: string, skip = 0, take = 10) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  return await prisma.ad.findMany({
    where: {
      userId,
      category: 'AUTOMOBILI',
    },
    include: {
      vehicle: true,
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
