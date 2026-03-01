# @oglasi/validation

Validation package za Oglasi monorepo projekat. Sadrži Zod sheme za validaciju podataka.

## Instalacija

Ovaj package je deo monorepo-a i automatski se instalira sa `npm install` u root-u.

## Upotreba

### U Client-Side komponentama (Next.js)

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAdSchema, type CreateAdInput } from '@oglasi/validation'

function CreateAdForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateAdInput>({
    resolver: zodResolver(createAdSchema),
  })

  async function onSubmit(data: CreateAdInput) {
    // data is validated!
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      {/* ... */}
    </form>
  )
}
```

### U Server Actions

```typescript
import { createAdSchema } from '@oglasi/validation'

export async function createAd(data: unknown) {
  // Validate data
  const validated = createAdSchema.parse(data)

  // Use validated data
  const ad = await prisma.ad.create({
    data: validated
  })

  return ad
}
```

## Dostupne Sheme

### Oglasi

- `createAdSchema` - Validacija za kreiranje oglasa
- `updateAdSchema` - Validacija za ažuriranje oglasa (sva polja optional)
- `CreateAdInput` - TypeScript tip za kreiranje oglasa
- `UpdateAdInput` - TypeScript tip za ažuriranje oglasa

### Kategorije

- `realEstateSchema` - Validacija za nekretnine
- `vehicleSchema` - Validacija za vozila
- `whiteGoodsSchema` - Validacija za belu tehniku

### Enumi

- `AdCategoryEnum` - Kategorije oglasa (NEKRETNINE, BIJELA_TEHNIKA, AUTOMOBILI)
- `AdTypeEnum` - Tip oglasa (PRODAJA, IZNAJMLJIVANJE)
- `AdStatusEnum` - Status oglasa (AKTIVNO, NEAKTIVNO, PRODATO, IZNAJMLJENO)

### Ostalo

- `createContactSchema` - Validacija za kontakt formu
- `locationSchema` - Validacija za lokaciju

## Helper Funkcije

### mapZodErrorsToFields

Konvertuje Zod greške u objekat sa field name-ovima kao ključevima.

```typescript
import { mapZodErrorsToFields } from '@oglasi/validation'

try {
  createAdSchema.parse(data)
} catch (error) {
  if (error instanceof z.ZodError) {
    const fieldErrors = mapZodErrorsToFields(error)
    // { title: "Naslov je obavezan", price: "Cijena mora biti pozitivan broj" }
  }
}
```

## Zašto odvojen package?

Validation package je odvojen od `@oglasi/database` kako bi se mogao koristiti u client-side komponentama bez importovanja Prisma Client-a i Node.js dependencija (kao što je `pg`).

## Development

Sve promene u validation shemama automatski se reflektuju u obe aplikacije (klient i admin) jer obje koriste isti package.
