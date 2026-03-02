'use client'

import { useState, type ChangeEvent } from 'react'
import { createAdWithDetails } from '@oglasi/server-actions/ads'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAdSchema } from '@oglasi/validation'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

const createAdWithDetailsSchema = createAdSchema
  .extend({
    city: z.string().min(1, 'Grad je obavezan'),
    municipality: z.string().optional(),
    address: z.string().optional(),
    postalCode: z.string().optional(),
    imageUrls: z.string().optional(),
    realEstateType: z.enum(['STAN', 'KUCA', 'POSLOVNI_PROSTOR']).optional(),
    surface: z.coerce.number().positive('Površina mora biti pozitivan broj').optional(),
    rooms: z.coerce.number().int().positive('Broj soba mora biti pozitivan').optional(),
    bathrooms: z.coerce.number().int().positive('Broj kupatila mora biti pozitivan').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === 'NEKRETNINE') {
      if (!data.realEstateType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['realEstateType'],
          message: 'Tip nekretnine je obavezan',
        })
      }

      if (!data.surface) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['surface'],
          message: 'Površina je obavezna za nekretnine',
        })
      }
    }
  })

type CreateAdWithDetailsFormInput = z.infer<typeof createAdWithDetailsSchema>

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

export default function CreateAdPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAdWithDetailsFormInput>({
    resolver: zodResolver(createAdWithDetailsSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category: undefined,
      type: undefined,
      city: '',
      municipality: '',
      address: '',
      postalCode: '',
      imageUrls: '',
    },
  })

  const selectedCategory = watch('category')
  const watchedImageUrls = watch('imageUrls')
  const previewImageUrls = parseImageUrls(watchedImageUrls || '')

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

  function parseImageUrls(value: string): string[] {
    return value
      .split(/\r?\n|,/)
      .map((url) => url.trim())
      .filter(Boolean)
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

  async function onSubmit(data: CreateAdWithDetailsFormInput) {
    setLoading(true)
    setError('')

    try {
      const imageList = (data.imageUrls || '')
        .split(/\r?\n|,/)
        .map((url) => url.trim())
        .filter(Boolean)

      const ad = await createAdWithDetails(session?.user?.id!, {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        type: data.type,
        location: {
          city: data.city,
          municipality: data.municipality || undefined,
          address: data.address || undefined,
          postalCode: data.postalCode || undefined,
        },
        realEstate:
          data.category === 'NEKRETNINE' && data.realEstateType && data.surface
            ? {
              realEstateType: data.realEstateType,
              surface: data.surface,
              rooms: data.rooms || undefined,
              bathrooms: data.bathrooms || undefined,
            }
            : undefined,
        images: imageList.map((url, idx) => ({
          url,
          order: idx,
        })),
      })

      if (!ad) {
        throw new Error('Kreiranje oglasa nije uspjelo')
      }

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

            {selectedCategory === 'NEKRETNINE' && (
              <div className="space-y-4 rounded-md border p-4">
                <p className="font-medium">Detalji nekretnine</p>

                <div className="space-y-2">
                  <Label htmlFor="realEstateType">Tip nekretnine *</Label>
                  <select
                    id="realEstateType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...register('realEstateType')}
                  >
                    <option value="">Izaberite tip</option>
                    <option value="STAN">Stan</option>
                    <option value="KUCA">Kuća</option>
                    <option value="POSLOVNI_PROSTOR">Poslovni prostor</option>
                  </select>
                  {errors.realEstateType && (
                    <p className="text-sm text-red-500">{errors.realEstateType.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="surface">Površina (m²) *</Label>
                    <Input id="surface" type="number" step="0.01" {...register('surface')} />
                    {errors.surface && (
                      <p className="text-sm text-red-500">{errors.surface.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rooms">Sobe</Label>
                    <Input id="rooms" type="number" {...register('rooms')} />
                    {errors.rooms && (
                      <p className="text-sm text-red-500">{errors.rooms.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Kupatila</Label>
                    <Input id="bathrooms" type="number" {...register('bathrooms')} />
                    {errors.bathrooms && (
                      <p className="text-sm text-red-500">{errors.bathrooms.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                    <div key={`${imageUrl}-${index}`} className="overflow-hidden rounded-md border bg-muted">
                      <img
                        src={imageUrl}
                        alt={`Pregled slike ${index + 1}`}
                        className="h-28 w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading || uploadingImages}
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