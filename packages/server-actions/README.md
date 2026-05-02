# @oglasi/server-actions

Deljene server akcije za sve aplikacije u Oglasi monorepo-u. Omogućavaju siguran pristup bazi podataka sa obe client i admin aplikacije.

## Struktura

```
server-actions/
├── ads/           # Akcije za oglase
├── users/         # Akcije za korisnike
├── favorites/     # Akcije za omiljene oglase
├── contacts/      # Akcije za kontakte/upite
```

## Korišćenje

### U Next.js komponentama:

```typescript
import { createAd, getAds } from '@oglasi/server-actions/ads'
import { toggleFavorite } from '@oglasi/server-actions/favorites'
import { updateProfile } from '@oglasi/server-actions/users'

export default function MyComponent() {
  async function handleCreateAd() {
    const ad = await createAd(userId, {
      title: 'Stan za prodaju',
      description: 'Lep stan...',
      price: 50000,
      category: 'NEKRETNINE',
      type: 'PRODAJA',
    })
  }

  return // ...
}
```

## Dostupne akcije

### Ads (`@oglasi/server-actions/ads`)
- `createAd(userId, data)` - Kreiraj oglas
- `updateAd(userId, adId, data)` - Ažuriraj oglas
- `deleteAd(userId, adId)` - Obriši oglas
- `getAdById(adId)` - Preuzmi jedan oglas sa detaljima
- `getAds(filter?)` - Preuzmi oglase sa filterom
- `getUserAds(userId, skip, take)` - Preuzmi korisnukove oglase
- `incrementAdViews(adId)` - Uvećaj broj pregleda

### Users (`@oglasi/server-actions/users`)
- `updateProfile(userId, data)` - Ažuriraj profil
- `getUserProfile(userId)` - Preuzmi profil korisnika

### Favorites (`@oglasi/server-actions/favorites`)
- `toggleFavorite(userId, adId)` - Dodaj/ukloni iz omiljenih
- `isFavorite(userId, adId)` - Proveri da li je oglas u omiljenim
- `getUserFavorites(userId, skip, take)` - Preuzmi omiljene oglase

### Contacts (`@oglasi/server-actions/contacts`)
- `createContact(adId, userId, data)` - Kreiraj upit/kontakt
- `getAdContacts(userId)` - Preuzmi sve kontakte za oglase korisnika
- `markContactAsReplied(contactId, userId)` - Označi kao odgovoreno
- `deleteContact(contactId, userId)` - Obriši kontakt

## Sigurnost

Sve akcije:
- ✅ Provere `userId` pre nego što dozvolе pristup
- ✅ Provere vlasništva (korisnik može samo vlastite resurse)
- ✅ Bacaju `Error` za neautorizovane zahteve
- ✅ Koriste Prisma sa type-safety-em

## Instalacija u aplikacijama

1. Dodaj u `package.json`:
```json
"@oglasi/server-actions": "*"
```

2. Instaliraj zavisnosti:
```bash
npm install
```

3. Koristi u komponentama:
```typescript
import { createAd } from '@oglasi/server-actions/ads'
```

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev
```
