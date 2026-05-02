'use server'

import { prisma, Prisma } from '@oglasi/database'
import nodemailer from 'nodemailer'
import type { CreateAdInput } from '@oglasi/validation'

type AdCreatedEmailPayload = {
    to: string
    name?: string | null
    title: string
    category: string
    type: string
    price: number
    city?: string | null
}

async function sendAdCreatedEmail(payload: AdCreatedEmailPayload) {
    const host = process.env.EMAIL_HOST
    const port = process.env.EMAIL_PORT
    const secureRaw = process.env.EMAIL_SECURE
    const user = process.env.EMAIL_USER
    const pass = process.env.EMAIL_PASSWORD
    const from = process.env.EMAIL_FROM

    if (!host || !port || !user || !pass || !from) {
        console.warn('Email config nije potpuna. Preskačem potvrdu emailom za oglas.')
        return
    }

    const secure = secureRaw === 'true'
    const transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure,
        auth: {
            user,
            pass,
        },
    })

    const subject = 'Potvrda: Oglas je uspješno dodat'
    const recipientName = payload.name?.trim() || 'Korisniče'
    const price = payload.price.toLocaleString('sr-RS', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

    const html = `
    <div style="background:#f5f7fb;padding:24px;font-family:Arial,sans-serif;color:#111827;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:#2563eb;color:#ffffff;padding:20px 24px;">
          <h1 style="margin:0;font-size:20px;line-height:1.3;">Oglas je uspješno objavljen</h1>
          <p style="margin:8px 0 0;font-size:14px;opacity:0.95;">Hvala što koristite Oglasi platformu.</p>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 12px;font-size:15px;">Zdravo, <strong>${recipientName}</strong> 👋</p>
          <p style="margin:0 0 18px;font-size:14px;color:#374151;">Vaš oglas je uspješno dodat i sada je vidljiv na platformi.</p>

          <div style="border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;background:#fafafa;">
            <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#111827;">${payload.title}</p>
            <p style="margin:0 0 4px;font-size:13px;color:#4b5563;"><strong>Kategorija:</strong> ${payload.category}</p>
            <p style="margin:0 0 4px;font-size:13px;color:#4b5563;"><strong>Tip:</strong> ${payload.type}</p>
            <p style="margin:0 0 4px;font-size:13px;color:#4b5563;"><strong>Cijena:</strong> ${price} EUR</p>
            <p style="margin:0;font-size:13px;color:#4b5563;"><strong>Grad:</strong> ${payload.city || 'Nije navedeno'}</p>
          </div>

          <p style="margin:18px 0 0;font-size:13px;color:#6b7280;">Ako ovo niste vi dodali, kontaktirajte podršku.</p>
        </div>
      </div>
    </div>
  `

    const text = `
Zdravo ${recipientName},

Vaš oglas je uspješno dodat.

Naslov: ${payload.title}
Kategorija: ${payload.category}
Tip: ${payload.type}
Cijena: ${price} EUR
Grad: ${payload.city || 'Nije navedeno'}
  `.trim()

    await transporter.sendMail({
        from,
        to: payload.to,
        subject,
        html,
        text,
    })
}

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

    const createdAd = await prisma.$transaction(async (tx) => {
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
          user: {
              select: {
                  email: true,
                  name: true,
              },
          },
        location: true,
        realEstate: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    })
  })

    if (createdAd?.user?.email) {
        try {
            await sendAdCreatedEmail({
                to: createdAd.user.email,
                name: createdAd.user.name,
                title: createdAd.title,
                category: createdAd.category,
                type: createdAd.type,
                price: Number(createdAd.price),
                city: createdAd.location?.city,
            })
        } catch (error) {
            console.error('Slanje email potvrde nije uspjelo:', error)
        }
    }

    return createdAd
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
