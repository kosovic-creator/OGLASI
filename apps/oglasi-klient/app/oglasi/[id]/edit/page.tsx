'use client'

import { useState, useEffect, type ChangeEvent } from 'react'
import { getAdById, updateAdWithDetails } from '@oglasi/server-actions/ads'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateAdSchema } from '@oglasi/validation'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { LocationMapPicker } from '@/components/LocationMapPicker'
import Link from 'next/link'

const editAdWithDetailsSchema = updateAdSchema.extend({
  city: z.string().min(1, 'Grad je obavezan'),
  municipality: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  imageUrls: z.string().optional(),
})

type EditAdWithDetailsInput = z.infer<typeof editAdWithDetailsSchema>

type CloudinarySignResponse = {
  cloudName: string
  apiKey: string
  timestamp: number
  folder: string
  signature: string
}

type CloudinaryUploadResponse = {
  secure_url: string
}

export default function EditAdPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [adData, setAdData] = useState<any>(null)
  const [isLoadingAd, setIsLoadingAd] = useState(true)

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<EditAdWithDetailsInput>({
    resolver: zodResolver(editAdWithDetailsSchema),
  })

  const watchedImageUrls = watch('imageUrls')
  const previewImageUrls = parseImageUrls(watchedImageUrls || '')

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
            city: ad.location?.city || '',
            municipality: ad.location?.municipality || '',
            address: ad.location?.address || '',
            postalCode: ad.location?.postalCode || '',
            latitude: ad.location?.latitude ? Number(ad.location.latitude) : undefined,
            longitude: ad.location?.longitude ? Number(ad.location.longitude) : undefined,
            imageUrls: ad.images?.map((image: any) => image.url).join('\n') || '',
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

  function parseImageUrls(value: string): string[] {
    return value
      .split(/\r?\n|,/)
      .map((url) => url.trim())
      .filter(Boolean)
  }

  async function uploadImageToCloudinary(file: File): Promise<string> {
    const signResponse = await fetch('/api/cloudinary/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folder: 'oglasi' }),
    })

    if (!signResponse.ok) {
      throw new Error('Neuspješno dobijanje Cloudinary potpisa.')
    }

    const { cloudName, apiKey, timestamp, folder, signature } =
      (await signResponse.json()) as CloudinarySignResponse

    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', apiKey)
    formData.append('timestamp', String(timestamp))
    formData.append('signature', signature)
    formData.append('folder', folder)

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!uploadResponse.ok) {
      throw new Error('Neuspješan upload slike na Cloudinary.')
    }

    const uploadData = (await uploadResponse.json()) as CloudinaryUploadResponse
    if (!uploadData.secure_url) {
      throw new Error('Cloudinary nije vratio URL slike.')
    }

    return uploadData.secure_url
  }

  async function handleImagesSelect(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files || files.length === 0) {
      return
    }

    setUploadError('')
    setUploadingImages(true)

    try {
      const fileList = Array.from(files)
      const invalidFile = fileList.find((file) => !file.type.startsWith('image/'))

      if (invalidFile) {
        throw new Error('Dozvoljen je upload samo slika.')
      }

      const uploadedUrls: string[] = []
      for (const file of fileList) {
        const uploadedUrl = await uploadImageToCloudinary(file)
        uploadedUrls.push(uploadedUrl)
      }

      const existingUrls = parseImageUrls(getValues('imageUrls') || '')
      const mergedUrls = [...existingUrls, ...uploadedUrls]

      setValue('imageUrls', mergedUrls.join('\n'), {
        shouldDirty: true,
        shouldValidate: true,
      })

      setUploadedCount((currentCount) => currentCount + uploadedUrls.length)
      event.target.value = ''
    } catch (uploadError) {
      setUploadError(uploadError instanceof Error ? uploadError.message : 'Greška pri uploadu slika.')
    } finally {
      setUploadingImages(false)
    }
  }

  function handleLocationSelect(lat: number, lng: number, address?: string) {
    setValue('latitude', lat, { shouldDirty: true, shouldValidate: true })
    setValue('longitude', lng, { shouldDirty: true, shouldValidate: true })
    if (address) {
      setValue('address', address, { shouldDirty: true })
    }
  }

  function removeImageAtIndex(indexToRemove: number) {
    const currentUrls = parseImageUrls(getValues('imageUrls') || '')
    const nextUrls = currentUrls.filter((_, index) => index !== indexToRemove)
    setValue('imageUrls', nextUrls.join('\n'), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  function moveImage(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) {
      return
    }

    const currentUrls = parseImageUrls(getValues('imageUrls') || '')
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= currentUrls.length || toIndex >= currentUrls.length) {
      return
    }

    const reorderedUrls = [...currentUrls]
    const [movedItem] = reorderedUrls.splice(fromIndex, 1)
    reorderedUrls.splice(toIndex, 0, movedItem)

    setValue('imageUrls', reorderedUrls.join('\n'), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  async function onSubmit(data: EditAdWithDetailsInput) {
    if (!session?.user?.id) {
      setError('Morate biti prijavljeni')
      return
    }

    setLoading(true)
    setError('')

    try {
      const imageList = parseImageUrls(data.imageUrls || '')
      const title = data.title ?? adData?.title ?? ''
      const description = data.description ?? adData?.description ?? ''
      const price = data.price ?? Number(adData?.price ?? 0)
      const category = data.category ?? adData?.category
      const type = data.type ?? adData?.type
      const city = data.city ?? adData?.location?.city ?? ''

      if (!category || !type || !city) {
        throw new Error('Nedostaju obavezni podaci za ažuriranje oglasa.')
      }

      await updateAdWithDetails(session.user.id, params.id as string, {
        title,
        description,
        price,
        category,
        type,
        location: {
          city,
          municipality: data.municipality || adData?.location?.municipality || undefined,
          address: data.address || adData?.location?.address || undefined,
          postalCode: data.postalCode || adData?.location?.postalCode || undefined,
          latitude: data.latitude ?? (adData?.location?.latitude ? Number(adData.location.latitude) : undefined),
          longitude: data.longitude ?? (adData?.location?.longitude ? Number(adData.location.longitude) : undefined),
        },
        images: imageList.map((url, idx) => ({
          url,
          order: idx,
        })),
      })

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Grad *</Label>
                <Input id="city" placeholder="npr. Sarajevo" {...register('city')} />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipality">Opština</Label>
                <Input id="municipality" placeholder="npr. Centar" {...register('municipality')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adresa</Label>
                <Input id="address" placeholder="Ulica i broj" {...register('address')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Poštanski broj</Label>
                <Input id="postalCode" placeholder="71000" {...register('postalCode')} />
              </div>
            </div>

            <LocationMapPicker
              onLocationSelect={handleLocationSelect}
              initialLat={getValues('latitude')}
              initialLng={getValues('longitude')}
              initialAddress={getValues('address')}
            />

            <div className="space-y-2">
              <Label htmlFor="imageUrls">Slike (URL, jedan po redu ili odvojeno zarezom)</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesSelect}
                disabled={loading || uploadingImages}
              />
              {uploadingImages && (
                <p className="text-sm text-muted-foreground">Upload slika je u toku...</p>
              )}
              {uploadedCount > 0 && (
                <p className="text-sm text-green-600">Uspješno uploadovano: {uploadedCount}</p>
              )}
              {uploadError && (
                <p className="text-sm text-red-500">{uploadError}</p>
              )}
              <textarea
                id="imageUrls"
                placeholder="https://.../slika1.jpg&#10;https://.../slika2.jpg"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('imageUrls')}
              />
              {previewImageUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
                  {previewImageUrls.map((imageUrl, index) => (
                    <div
                      key={`${imageUrl}-${index}`}
                      className="overflow-hidden rounded-md border bg-muted"
                      draggable
                      onDragStart={() => setDraggedImageIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (draggedImageIndex !== null) {
                          moveImage(draggedImageIndex, index)
                        }
                        setDraggedImageIndex(null)
                      }}
                      onDragEnd={() => setDraggedImageIndex(null)}
                    >
                      <img
                        src={imageUrl}
                        alt={`Pregled slike ${index + 1}`}
                        className="h-28 w-full object-cover"
                        loading="lazy"
                      />
                      <div className="p-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => removeImageAtIndex(index)}
                        >
                          Obriši sliku
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading || uploadingImages}>
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
