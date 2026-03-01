'use server'

import { prisma, type Contact } from '@oglasi/database'

export interface CreateContactInput {
  name: string
  email: string
  phone?: string
  message: string
}

export async function createContact(
  adId: string,
  userId: string | null,
  data: CreateContactInput
): Promise<Contact> {
  return await prisma.contact.create({
    data: {
      ...data,
      adId,
      userId: userId || undefined,
    },
  })
}

export async function getAdContacts(userId: string) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  return await prisma.contact.findMany({
    where: {
      ad: {
        userId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      ad: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function markContactAsReplied(contactId: string, userId: string) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  // Verify ownership
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: { ad: true },
  })

  if (!contact || contact.ad.userId !== userId) {
    throw new Error('Unauthorized - You can only mark your contacts as replied')
  }

  return await prisma.contact.update({
    where: { id: contactId },
    data: { replied: true },
  })
}

export async function deleteContact(contactId: string, userId: string) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  // Verify ownership
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: { ad: true },
  })

  if (!contact || contact.ad.userId !== userId) {
    throw new Error('Unauthorized - You can only delete your contacts')
  }

  return await prisma.contact.delete({
    where: { id: contactId },
  })
}
