'use client'

import { useEffect, useState } from 'react'
import { getAdsForClient } from '@oglasi/server-actions/ads'

type SearchAd = {
  id: string
  title: string
  price: number | string | { toString(): string }
  category: string
  type: string
  status?: string
  views?: number
  location?: {
    city?: string | null
  } | null
}

interface AdSearchProps {
  take?: number
  loadInitial?: boolean
  category?: string
  submitLabel?: string
  loadingLabel?: string
  resetLabel?: string
  emptyLabel?: string
  renderResults?: (ads: SearchAd[]) => React.ReactNode
}

export function AdSearch({
  take = 20,
  loadInitial = true,
  category,
  submitLabel = 'Pretraži',
  loadingLabel = 'Pretraga...',
  resetLabel = 'Očisti filtere',
  emptyLabel = 'Nema rezultata za zadate filtere.',
  renderResults,
}: AdSearchProps) {
  const [ads, setAds] = useState<SearchAd[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!loadInitial) {
      return
    }

    let isMounted = true

    async function loadInitialAds() {
      setLoading(true)
      try {
        const initialAds = (await getAdsForClient({
          take,
          category: category || undefined,
        })) as unknown as SearchAd[]
        if (isMounted) {
          setAds(initialAds)
          setSearched(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadInitialAds()

    return () => {
      isMounted = false
    }
  }, [loadInitial, take, category])

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const results = (await getAdsForClient({
        category: (formData.get('category') as string) || undefined,
        type: (formData.get('type') as string) || undefined,
        city: (formData.get('city') as string) || undefined,
        minPrice: formData.get('minPrice')
          ? Number(formData.get('minPrice'))
          : undefined,
        maxPrice: formData.get('maxPrice')
          ? Number(formData.get('maxPrice'))
          : undefined,
        take,
      })) as unknown as SearchAd[]

      setAds(results)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.currentTarget.reset()

    if (!loadInitial) {
      setAds([])
      setSearched(false)
      return
    }

    setLoading(true)
    try {
      const initialAds = (await getAdsForClient({
        take,
        category: category || undefined,
      })) as unknown as SearchAd[]
      setAds(initialAds)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSearch}
        onReset={handleReset}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        <select name="category" className="h-10 rounded-md border bg-background px-3 text-sm">
          <option value="">Sve kategorije</option>
          <option value="NEKRETNINE">Nekretnine</option>
          <option value="BIJELA_TEHNIKA">Bijela tehnika</option>
          <option value="AUTOMOBILI">Automobili</option>
        </select>

        <select name="type" className="h-10 rounded-md border bg-background px-3 text-sm">
          <option value="">Sve vrste</option>
          <option value="PRODAJA">Prodaja</option>
          <option value="IZNAJMLJIVANJE">Iznajmljivanje</option>
        </select>

        <input
          name="city"
          placeholder="Grad"
          className="h-10 rounded-md border bg-background px-3 text-sm"
        />

        <input
          name="minPrice"
          type="number"
          placeholder="Min cena"
          className="h-10 rounded-md border bg-background px-3 text-sm"
        />

        <input
          name="maxPrice"
          type="number"
          placeholder="Max cena"
          className="h-10 rounded-md border bg-background px-3 text-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className="h-10 rounded-md border px-4 text-sm font-medium disabled:opacity-60"
        >
          {loading ? loadingLabel : submitLabel}
        </button>

        <button
          type="reset"
          disabled={loading}
          className="h-10 rounded-md border px-4 text-sm font-medium disabled:opacity-60"
        >
          {resetLabel}
        </button>
      </form>

      {renderResults ? (
        renderResults(ads)
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.map((ad) => (
            <div key={ad.id} className="rounded-lg border p-4 space-y-1">
              <p className="font-semibold line-clamp-2">{ad.title}</p>
              <p className="text-sm text-muted-foreground">{ad.category} • {ad.type}</p>
              <p className="text-sm text-muted-foreground">{ad.location?.city || 'N/A'}</p>
              <p className="font-medium">{String(ad.price)} EUR</p>
            </div>
          ))}

          {searched && ads.length === 0 && (
            <p className="text-sm text-muted-foreground">{emptyLabel}</p>
          )}
        </div>
      )}
    </div>
  )
}
