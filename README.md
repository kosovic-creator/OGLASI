# Oglasi Monorepo

Monorepo projekat za aplikaciju oglasa sa admin i klijent panelima.

## 📁 Struktura

```
oglasi/
├── apps/
│   ├── oglasi-klient/    # Klijentska aplikacija (port 3000)
│   │   ├── app/         # Next.js App Router
│   │   └── middleware.ts
│   └── oglasi-admin/     # Admin aplikacija (port 3001)
│       ├── app/         # Next.js App Router
│       └── middleware.ts
├── packages/
│   ├── database/         # Prisma schema i DB klijent
│   └── auth/            # NextAuth konfiguracija
└── package.json
```

## 🚀 Početak

### Preduslov

- Node.js 18+
- PostgreSQL baza podataka

### Instalacija

```bash
# Instalirajte zavisnosti
npm install

# Kopirajte .env fajlove
cp apps/oglasi-klient/.env.example apps/oglasi-klient/.env
cp apps/oglasi-admin/.env.example apps/oglasi-admin/.env

# Uredite .env fajlove sa svojim database URL i secrets
```

### Setiranje baze podataka

Projekat koristi **Prisma 7** sa PostgreSQL adapterom. Nakon instalacije zavisnosti, prisma.config.ts će automatski učitati DATABASE_URL iz root `.env` fajla.

```bash
# Prilagodite schema i stvorite migraciju
npm run db:migrate

# Ili direktno primenite schema na bazu (ako nema migracija)
npm run db:push
```

### Dostupne Prisma komande

```bash
# Razvoj: pravi migraciju i primenjuje on na bazu
npm run db:migrate

# Produkcija: primeni sve migracije na bazu
npm run db:deploy

# Reset baze na početno stanje (samo razvoj)
npm run db:reset

# Generisanje Prisma klijenta
npm run db:generate

# Otvorite Prisma Studio za prikaz podataka
npm run db:studio

# Pripremi schema u bazi bez migracije
npm run db:push
```

### Generisanje Prisma klijenta

Obično se generisanje dešava automatski, ali ako je potrebno:

```bash
npm run db:generate
```

### Pokretanje aplikacija

```bash
# Klijent aplikacija (port 3000)
npm run dev:klient

# Admin aplikacija (port 3001)
npm run dev:admin

# Obje aplikacije odjednom
npm run dev
```

### Prisma Studio

```bash
npm run db:studio
```

## 🔑 Autentifikacija

Projekat koristi NextAuth sa Credentials providerom. Korisnici imaju role:
- `ADMIN` - Administrator
- `KLIENT` - Klijent

### Kreiranje korisnika

Koristite Prisma Studio ili kreirajte seed script za dodavanje korisnika.

## 📦 Paketi

### @oglasi/database
Sadrži Prisma schema i database klijent koji koriste obje aplikacije.

### @oglasi/auth
NextAuth konfiguracija i tipovi za autentifikaciju.

## 🛠️ Tehnologije

- **Next.js 14** - React framework sa App Router
- **TypeScript** - Tip-sigurni JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Prisma 7** - ORM za PostgreSQL sa PG adapterom
- **NextAuth.js** - Autentifikacija
- **npm workspaces** - Monorepo management

## 📱 PWA (Progressive Web App)

PWA podrška je uključena za obe aplikacije:
- `apps/oglasi-klient` (port `3000`)
- `apps/oglasi-admin` (port `3001`)

Omogućeno je:
- `manifest.webmanifest`
- PWA ikonice (`192x192`, `512x512`)
- Service Worker generisan kroz `next-pwa`

Napomena:
- U development modu (`npm run dev`) PWA je isključen.
- Za realan test PWA funkcionalnosti koristi se production build.

### Testiranje PWA

```bash
# 1) Build aplikacija
npm run build

# 2) Pokretanje klient aplikacije
npm run start --workspace=apps/oglasi-klient

# 3) U drugom terminalu pokretanje admin aplikacije
npm run start --workspace=apps/oglasi-admin -- -p 3001
```

Ako želiš da startuješ admin bez dodatnih argumenata:

```bash
cd apps/oglasi-admin
npx next start -p 3001
```

### Instalacija na uređaj

- Chrome/Edge (desktop): otvori aplikaciju i klikni `Install app` u address baru.
- Android (Chrome): `Add to Home screen`.
- iOS (Safari): `Share` -> `Add to Home Screen`.

Za proveru:
- Otvori DevTools -> `Application` -> proveri da su učitani `Manifest` i `Service Workers`.
- U Network tabu testiraj `Offline` režim i osvežavanje prethodno posećenih strana.

## 📝 Licenca

MIT

lsof -i :3000 -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null; echo "Portovi 3000 i 3001 su zatvoreni"