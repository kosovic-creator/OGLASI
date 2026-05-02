'use server'

import { prisma } from '@oglasi/database'

export interface UpdateProfileInput {
  name?: string
  phone?: string
}

export async function updateProfile(
  userId: string,
  data: UpdateProfileInput
) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  return await prisma.user.update({
    where: { id: userId },
    data,
  })
}

export async function getUserProfile(userId: string) {
  if (!userId) {
    throw new Error('Unauthorized - No user ID')
  }

  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  })
}
