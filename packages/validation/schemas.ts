import { z } from 'zod'

// Enums
export const AdCategoryEnum = z.enum(['NEKRETNINE', 'BIJELA_TEHNIKA', 'AUTOMOBILI'])
export const AdTypeEnum = z.enum(['PRODAJA', 'IZNAJMLJIVANJE'])
export const AdStatusEnum = z.enum(['AKTIVNO', 'NEAKTIVNO', 'PRODATO', 'IZNAJMLJENO'])

// Create Ad Schema
export const createAdSchema = z.object({
  title: z
    .string()
    .min(1, 'Naslov je obavezan')
    .min(5, 'Naslov mora imati najmanje 5 karaktera')
    .max(200, 'Naslov ne smije biti duži od 200 karaktera'),
  
  description: z
    .string()
    .min(1, 'Opis je obavezan')
    .min(20, 'Opis mora imati najmanje 20 karaktera')
    .max(5000, 'Opis ne smije biti duži od 5000 karaktera'),
  
  price: z.coerce
    .number()
    .positive('Cijena mora biti pozitivan broj')
    .max(999999999, 'Cijena je prevelika'),
  
  category: AdCategoryEnum,
  
  type: AdTypeEnum,
  
  locationId: z.string().optional(),
})

// Update Ad Schema (all fields optional)
export const updateAdSchema = createAdSchema.partial()

// Real Estate Schema
export const realEstateSchema = z.object({
  realEstateType: z.enum(['STAN', 'KUCA', 'POSLOVNI_PROSTOR']),
  surface: z
    .number()
    .positive('Površina mora biti pozitivan broj')
    .max(100000, 'Površina je prevelika'),
  rooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().positive().optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  heating: z.enum(['CENTRALNO', 'ETAZNO', 'PLIN', 'STRUJA', 'PELET', 'KRUTO_GORIVO', 'TOPLOTNA_PUMPA', 'KLIMA']).optional(),
  parking: z.boolean().default(false),
  elevator: z.boolean().default(false),
  balcony: z.boolean().default(false),
  terrace: z.boolean().default(false),
  garden: z.boolean().default(false),
  furnished: z.boolean().default(false),
})

// Vehicle Schema
export const vehicleSchema = z.object({
  vehicleType: z.enum(['AUTOMOBIL', 'TERETNO', 'MOTOCIKL']),
  brand: z.string().min(1, 'Marka je obavezna'),
  model: z.string().min(1, 'Model je obavezan'),
  yearOfManufacture: z
    .number()
    .int()
    .min(1900, 'Godište ne može biti prije 1900')
    .max(new Date().getFullYear() + 1, 'Godište ne može biti u budućnosti'),
  mileage: z.number().int().min(0, 'Kilometraža ne može biti negativna'),
  fuelType: z.enum(['BENZIN', 'DIZEL', 'HIBRID', 'ELEKTRICNI', 'PLIN']),
  transmission: z.enum(['MANUELNI', 'AUTOMATIK']),
  enginePower: z.number().int().positive().optional(),
  engineVolume: z.number().int().positive().optional(),
  condition: z.enum(['NOVO', 'KAO_NOVO', 'DOBRO', 'ZADOVOLJAVAJUCE']),
  registeredUntil: z.date().optional(),
  color: z.string().optional(),
  doors: z.number().int().positive().max(6).optional(),
  seats: z.number().int().positive().max(100).optional(),
  airbags: z.boolean().default(false),
  abs: z.boolean().default(false),
  airConditioning: z.boolean().default(false),
  parkingSensors: z.boolean().default(false),
  cruiseControl: z.boolean().default(false),
})

// White Goods Schema
export const whiteGoodsSchema = z.object({
  brand: z.string().min(1, 'Brend je obavezan'),
  model: z.string().min(1, 'Model je obavezan'),
  condition: z.enum(['NOVO', 'KAO_NOVO', 'DOBRO', 'ZADOVOLJAVAJUCE']),
  yearOfManufacture: z
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear())
    .optional(),
  warranty: z.boolean().default(false),
  warrantyMonths: z.number().int().positive().max(120).optional(),
  energyClass: z.string().max(10).optional(),
  capacity: z.string().max(50).optional(),
  features: z.string().max(1000).optional(),
})

// Contact Schema
export const createContactSchema = z.object({
  name: z
    .string()
    .min(1, 'Ime je obavezno')
    .min(2, 'Ime mora imati najmanje 2 karaktera')
    .max(100, 'Ime ne smije biti duže od 100 karaktera'),
  
  email: z
    .string()
    .min(1, 'Email je obavezan')
    .email('Unesite validnu email adresu'),
  
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im, 'Unesite validan broj telefona')
    .optional()
    .or(z.literal('')),
  
  message: z
    .string()
    .min(1, 'Poruka je obavezna')
    .min(10, 'Poruka mora imati najmanje 10 karaktera')
    .max(2000, 'Poruka ne smije biti duža od 2000 karaktera'),
})

// Location Schema
export const locationSchema = z.object({
  country: z.string().default('Bosna i Hercegovina'),
  city: z.string().min(1, 'Grad je obavezan'),
  municipality: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

// Helper function to map Zod errors to field errors
export function mapZodErrorsToFields(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}

  error.issues.forEach((issue) => {
    const path = issue.path.join('.')
    if (path) {
      fieldErrors[path] = issue.message
    }
  })

  return fieldErrors
}

// Type exports
export type CreateAdInput = z.infer<typeof createAdSchema>
export type UpdateAdInput = z.infer<typeof updateAdSchema>
export type RealEstateInput = z.infer<typeof realEstateSchema>
export type VehicleInput = z.infer<typeof vehicleSchema>
export type WhiteGoodsInput = z.infer<typeof whiteGoodsSchema>
export type CreateContactInput = z.infer<typeof createContactSchema>
export type LocationInput = z.infer<typeof locationSchema>
