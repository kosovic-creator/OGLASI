'use client'

import { useState, useEffect } from 'react'
import { getAdById, updateAd } from '@oglasi/server-actions/ads'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateAdSchema, type UpdateAdInput } from '@oglasi/validation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import Link from 'next/link'

export default function EditAdPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [adData, setAdData] = useState<any>(null)
  const [isLoadingAd, setIsLoadingAd] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateAdInput>({
    resolver: zodResolver(updateAdSchema),
  })

  // Preuzmi podatke oglasa
  useEffect(() => {
    async function fetchAd() {
      try {
        const ad = await getAdById(params.id as string)
        if (ad) {
          setAdData(ad)
          reset({
            title: ad.title,
            description: ad.description,
            price: Number(ad.price),
            category: ad.category,
            type: ad.type,
          })
        }
      } catch (error) {
        setError('Greška pri učitavanju oglasa')
        console.error('Greška:', error)
      } finally {
        setIsLoadingAd(false)
      }
    }

    if (params.id) {
      fetchAd()
    }
  }, [params.id, reset])

  async function onSubmit(data: UpdateAdInput) {
    if (!session?.user?.id) {
      setError('Morate biti prijavljeni')
      return
    }

    setLoading(true)
    setError('')

    try {
      await updateAd(session.user.id, params.id as string, data)
      router.push(`/oglasi/${params.id}`)
    } catch (error: any) {
      setError(error.message || 'Greška pri ažuriranju oglasa. Molimo pokušajte ponovo.')
      console.error('Greška:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoadingAd) {
    return (
      <div className="container mx-auto py-10 max-w-2xl">
        <p>Učitavanje...</p>
      </div>
    )
  }

  if (!adData) {
    return (
      <div className="container mx-auto py-10 max-w-2xl">
        <Alert variant="destructive">Oglas nije pronađen</Alert>
        <Link href="/oglasi">
          <Button className="mt-4">Nazad na oglase</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <div className="mb-6">
        <Link href={`/oglasi/${params.id}`}>
          <Button variant="ghost" size="sm">
            ← Nazad na oglas
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Izmijeni Oglas</CardTitle>
          <CardDescription>
            Ažurirajte detalje vašeg oglasa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                {error}
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Naslov oglasa *</Label>
              <Input
                id="title"
                placeholder="Unesite naslov oglasa"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis *</Label>
              <textarea
                id="description"
                placeholder="Detaljno opišite vaš oglas"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Cijena (EUR) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategorija *</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('category')}
                >
                  <option value="">Izaberite kategoriju</option>
                  <option value="NEKRETNINE">Nekretnine</option>
                  <option value="BIJELA_TEHNIKA">Bijela Tehnika</option>
                  <option value="AUTOMOBILI">Automobili</option>
                </select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tip *</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('type')}
              >
                <option value="">Izaberite tip</option>
                <option value="PRODAJA">Prodaja</option>
                <option value="IZNAJMLJIVANJE">Iznajmljivanje</option>
              </select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Ažuriranje...' : 'Ažuriraj Oglas'}
              </Button>
              <Link href={`/oglasi/${params.id}`}>
                <Button type="button" variant="outline">
                  Otkaži
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
