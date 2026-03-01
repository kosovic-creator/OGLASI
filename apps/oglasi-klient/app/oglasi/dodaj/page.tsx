'use client'

import { useState } from 'react'
import { createAd } from '@oglasi/server-actions/ads'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAdSchema, type CreateAdInput } from '@oglasi/validation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

export default function CreateAdPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAdInput>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category: undefined,
      type: undefined,
    },
  })

  async function onSubmit(data: CreateAdInput) {
    setLoading(true)
    setError('')

    try {
      const ad = await createAd(session?.user?.id!, data)
      router.push(`/oglasi/${ad.id}`)
    } catch (error) {
      setError('Greška prilikom kreiranja oglasa. Molimo pokušajte ponovo.')
      console.error('Greška:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Dodaj Novi Oglas</CardTitle>
          <CardDescription>
            Popunite formu sa detaljima vašeg oglasa
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
                <Label htmlFor="price">Cijena (BAM) *</Label>
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register('category')}
                >
                  <option value="">Izaberite kategoriju</option>
                  <option value="NEKRETNINE">Nekretnine</option>
                  <option value="BIJELA_TEHNIKA">Bijela tehnika</option>
                  <option value="AUTOMOBILI">Automobili</option>
                </select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tip oglasa *</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Kreiranje...' : 'Kreiraj Oglas'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Otkaži
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}