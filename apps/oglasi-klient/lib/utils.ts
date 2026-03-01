import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string | any): string {
  let numPrice: number

  if (typeof price === 'string') {
    numPrice = parseFloat(price)
  } else if (typeof price === 'number') {
    numPrice = price
  } else if (price && typeof price.toNumber === 'function') {
    // Handle Prisma Decimal type
    numPrice = price.toNumber()
  } else {
    numPrice = Number(price)
  }

  return new Intl.NumberFormat('bs-BA', {
    style: 'currency',
    currency: 'EUR',
  }).format(numPrice)
}
