# Primeri korišćenja Server Actions

## 1. Kreiranje oglasa

```typescript
// apps/oglasi-klient/app/oglasi/dodaj/page.tsx
'use client'

import { useState } from 'react'
import { createAd } from '@oglasi/server-actions/ads'
import { useSession } from 'next-auth/react'

export default function CreateAdPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const ad = await createAd(session?.user?.id!, {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: Number(formData.get('price')),
        category: formData.get('category') as any,
        type: formData.get('type') as any,
        locationId: formData.get('locationId') as string,
      })

      console.log('Oglas kreiran:', ad)
    } catch (error) {
      console.error('Greška:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Naslov" required />
      <textarea name="description" placeholder="Opis" required />
      <input name="price" type="number" placeholder="Cena" required />
      <select name="category" required>
        <option value="NEKRETNINE">Nekretnine</option>
        <option value="BIJELA_TEHNIKA">Bijela tehnika</option>
        <option value="AUTOMOBILI">Automobili</option>
      </select>
      <select name="type" required>
        <option value="PRODAJA">Prodaja</option>
        <option value="IZNAJMLJIVANJE">Iznajmljivanje</option>
      </select>
      <button disabled={loading}>{loading ? 'Čuvanje...' : 'Kreiraj oglas'}</button>
    </form>
  )
}
```

## 2. Pregled oglasa sa detaljima

```typescript
// apps/oglasi-klient/app/oglasi/[id]/page.tsx
import { getAdById, incrementAdViews } from '@oglasi/server-actions/ads'
import { Card } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'

export default async function AdDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // Uvećaj broj pregleda
  await incrementAdViews(params.id)

  // Preuzmi oglas sa svim detaljima
  const ad = await getAdById(params.id)

  if (!ad) {
    return <div>Oglas nije pronađen</div>
  }

  return (
    <div>
      <h1>{ad.title}</h1>
      <p className="text-2xl font-bold">{formatPrice(ad.price)}</p>
      <p>{ad.description}</p>

      {ad.images.length > 0 && (
        <div className="gallery">
          {ad.images.map((img) => (
            <img key={img.id} src={img.url} alt={img.alt} />
          ))}
        </div>
      )}

      {ad.realEstate && (
        <Card>
          <h2>Detalji nekretnine</h2>
          <p>Tip: {ad.realEstate.realEstateType}</p>
          <p>Površina: {ad.realEstate.surface} m²</p>
          <p>Sobe: {ad.realEstate.rooms}</p>
          <p>Kupatila: {ad.realEstate.bathrooms}</p>
        </Card>
      )}

      <div className="contact-seller">
        <h2>Kontaktiraj vlasnika</h2>
        <p>{ad.user.name}</p>
        <p>{ad.user.phone}</p>
      </div>
    </div>
  )
}
```

## 3. Omiljeni oglasi (client component)

```typescript
// apps/oglasi-klient/components/FavoriteButton.tsx (primer custom komponente)
'use client'

import { useState } from 'react'
import { toggleFavorite, isFavorite } from '@oglasi/server-actions/favorites'
import { useSession } from 'next-auth/react'
import { Heart } from 'lucide-react'
import { useEffect } from 'react'

export function FavoriteButton({ adId }: { adId: string }) {
  const { data: session } = useSession()
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      isFavorite(session.user.id, adId).then(setIsFav)
    }
  }, [session?.user?.id, adId])

  async function handleToggle() {
    if (!session?.user?.id) {
      console.warn('Molim se prijavi prvo')
      return
    }

    setLoading(true)
    try {
      const result = await toggleFavorite(session.user.id, adId)
      setIsFav(result.isFavorite)
    } catch (error) {
      console.error('Greška:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleToggle} disabled={loading}>
      <Heart
        size={24}
        fill={isFav ? 'red' : 'none'}
        color={isFav ? 'red' : 'gray'}
      />
    </button>
  )
}
```

## 4. Kontakt forma za oglas

```typescript
// apps/oglasi-klient/components/ContactForm.tsx (primer custom komponente)
'use client'

import { createContact } from '@oglasi/server-actions/contacts'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

export function ContactForm({ adId }: { adId: string }) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      await createContact(adId, session?.user?.id || null, {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        message: formData.get('message') as string,
      })

      setSubmitted(true)
      e.currentTarget.reset()
    } catch (error) {
      console.error('Greška:', error)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return <p className="text-green-600">Hvala! Tvoji kontakt detalji su poslati vlašniku oglasa.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="name" placeholder="Ime" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="phone" placeholder="Telefon" />
      <textarea name="message" placeholder="Poruka" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Slanje...' : 'Pošalji upit'}
      </button>
    </form>
  )
}
```

## 5. Admin panel - pregled kontakata

```typescript
// apps/oglasi-admin/app/kontakti/page.tsx
import { getAdContacts } from '@oglasi/server-actions/contacts'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@oglasi/auth'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'

export default async function ContactsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const contacts = await getAdContacts(session!.user!.id)

  return (
    <div>
      <h1>Kontakti za vaše oglase</h1>
      <div className="space-y-4">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <div>
              <h3>{contact.name}</h3>
              <p>Email: {contact.email}</p>
              {contact.phone && <p>Telefon: {contact.phone}</p>}
              <p>Za oglas: {contact.ad.title}</p>
              <p className="whitespace-pre-wrap">{contact.message}</p>
              <p>Status: {contact.replied ? '✓ Odgovoren' : 'Čeka odgovor'}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

## 6. Pretraga oglasa sa filterima

```typescript
// packages/features/ads/AdSearch.tsx
'use client'

import { useState } from 'react'
import { getAds } from '@oglasi/server-actions/ads'

export function AdSearch() {
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const results = await getAds({
      category: (formData.get('category') as any) || undefined,
      type: (formData.get('type') as any) || undefined,
      city: formData.get('city') as string,
      minPrice: formData.get('minPrice') ? Number(formData.get('minPrice')) : undefined,
      maxPrice: formData.get('maxPrice') ? Number(formData.get('maxPrice')) : undefined,
      take: 20,
    })

    setAds(results)
    setLoading(false)
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="space-y-4">
        <select name="category">
          <option value="">Sve kategorije</option>
          <option value="NEKRETNINE">Nekretnine</option>
          <option value="BIJELA_TEHNIKA">Bijela tehnika</option>
          <option value="AUTOMOBILI">Automobili</option>
        </select>

        <select name="type">
          <option value="">Sve vrste</option>
          <option value="PRODAJA">Prodaja</option>
          <option value="IZNAJMLJIVANJE">Iznajmljivanje</option>
        </select>

        <input name="city" placeholder="Grad" />
        <input name="minPrice" type="number" placeholder="Min cena" />
        <input name="maxPrice" type="number" placeholder="Max cena" />

        <button type="submit" disabled={loading}>
          {loading ? 'Pretraga...' : 'Pretrazi'}
        </button>
      </form>

      <div className="grid grid-cols-3 gap-4 mt-8">
        {ads.map((ad) => (
          <div key={ad.id}>{ad.title}</div>
        ))}
      </div>
    </div>
  )
}
```

---

## Napomene

- Svi primeri koriste `next-auth` za autentifikaciju
- `userId` se prosleđuje kroz `session.user.id`
- Server actions automatski provere vlasništvo nad resursima
- Sve greške se bacaju kao `Error` sa porukom
- Putanje u komentarima su usklađene sa monorepo strukturom `apps/...`; sekcije 3 i 4 su primeri custom komponenti koje možeš dodati po potrebi
