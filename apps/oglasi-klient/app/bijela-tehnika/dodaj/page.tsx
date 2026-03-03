'use client'

import { useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { LocationMapPicker } from '@/components/LocationMapPicker'
import { createWhiteGoods } from '@oglasi/server-actions'
import { ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'

export default function AddWhiteGoodsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Image upload state
  const [imageUrls, setImageUrls] = useState<string>('')
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)

  // Location state
  const [city, setCity] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [latitude, setLatitude] = useState<number | undefined>()
  const [longitude, setLongitude] = useState<number | undefined>()

  // Parse image URLs from string
  function parseImageUrls(value: string): string[] {
    return value
      .split(/\r?\n|,/)
      .map((url) => url.trim())
      .filter(Boolean)
  }

  const previewImageUrls = parseImageUrls(imageUrls)

  // Upload image to Cloudinary
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

    const { cloudName, apiKey, timestamp, folder, signature } = await signResponse.json()

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

    const uploadData = await uploadResponse.json()
    if (!uploadData.secure_url) {
      throw new Error('Cloudinary nije vratio URL slike.')
    }

    return uploadData.secure_url
  }

  // Handle image file selection
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

      const existingUrls = parseImageUrls(imageUrls)
      const mergedUrls = [...existingUrls, ...uploadedUrls]

      setImageUrls(mergedUrls.join('\n'))
      setUploadedCount((currentCount) => currentCount + uploadedUrls.length)
      event.target.value = ''
    } catch (uploadErr) {
      setUploadError(uploadErr instanceof Error ? uploadErr.message : 'Greška pri uploadu slika.')
    } finally {
      setUploadingImages(false)
    }
  }

  // Handle location selection from map
  function handleLocationSelect(lat: number, lng: number, addr?: string) {
    setLatitude(lat)
    setLongitude(lng)
    if (addr) {
      setAddress(addr)
    }
  }

  // Remove image at specific index
  function removeImageAtIndex(indexToRemove: number) {
    const currentUrls = parseImageUrls(imageUrls)
    const nextUrls = currentUrls.filter((_, index) => index !== indexToRemove)
    setImageUrls(nextUrls.join('\n'))
  }

  // Move image in preview
  function moveImage(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) {
      return
    }

    const currentUrls = parseImageUrls(imageUrls)
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= currentUrls.length || toIndex >= currentUrls.length) {
      return
    }

    const reorderedUrls = [...currentUrls]
    const [movedItem] = reorderedUrls.splice(fromIndex, 1)
    reorderedUrls.splice(toIndex, 0, movedItem)

    setImageUrls(reorderedUrls.join('\n'))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    try {
      if (!session?.user?.id) {
        throw new Error('Morate biti prijavljeni')
      }

      const adData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        type: formData.get('type') as 'PRODAJA' | 'IZNAJMLJIVANJE',
        location: city ? {
          city,
          municipality: municipality || undefined,
          address: address || undefined,
          postalCode: postalCode || undefined,
          latitude,
          longitude,
        } : undefined,
        images: parseImageUrls(imageUrls).map((url, idx) => ({
          url,
          order: idx,
        })),
      }

      const whiteGoodsData = {
        brand: formData.get('brand') as string,
        model: formData.get('model') as string,
        condition: formData.get('condition') as 'NOVO' | 'KAO_NOVO' | 'DOBRO' | 'ZADOVOLJAVAJUCE',
        yearOfManufacture: formData.get('yearOfManufacture') ? parseInt(formData.get('yearOfManufacture') as string) : undefined,
        warranty: formData.get('warranty') === 'on',
        warrantyMonths: formData.get('warrantyMonths') ? parseInt(formData.get('warrantyMonths') as string) : undefined,
        energyClass: formData.get('energyClass') as string || undefined,
        capacity: formData.get('capacity') as string || undefined,
        features: formData.get('features') as string || undefined,
      }

      const result = await createWhiteGoods(session.user.id, adData, whiteGoodsData)
      router.push(`/bijela-tehnika/${result.id}`)
    } catch (err: any) {
      setError(err.message || 'Došlo je do greške')
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          Morate biti prijavljeni da biste dodali oglas.
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/bijela-tehnika">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Nazad
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8 text-blue-600" />
          Dodaj bijelu tehniku
        </h1>
        <p className="text-gray-600 mt-2">Popunite informacije o uređaju</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Osnovne informacije</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Naslov oglasa *</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="npr. Samsung frižider"
              />
            </div>

            <div>
              <Label htmlFor="description">Opis *</Label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                className="w-full border rounded-md p-2"
                placeholder="Detaljan opis uređaja..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Cijena (€) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  placeholder="200"
                />
              </div>

              <div>
                <Label htmlFor="type">Tip oglasa *</Label>
                <select
                  id="type"
                  name="type"
                  required
                  className="w-full border rounded-md p-2 h-10"
                >
                  <option value="PRODAJA">Prodaja</option>
                  <option value="IZNAJMLJIVANJE">Iznajmljivanje</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalji proizvoda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Brend *</Label>
                <Input
                  id="brand"
                  name="brand"
                  required
                  placeholder="Samsung"
                />
              </div>

              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  name="model"
                  required
                  placeholder="Model XYZ-123"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="condition">Stanje *</Label>
                <select
                  id="condition"
                  name="condition"
                  required
                  className="w-full border rounded-md p-2 h-10"
                >
                  <option value="NOVO">Novo</option>
                  <option value="KAO_NOVO">Kao novo</option>
                  <option value="DOBRO">Dobro</option>
                  <option value="ZADOVOLJAVAJUCE">Zadovoljavajuće</option>
                </select>
              </div>

              <div>
                <Label htmlFor="yearOfManufacture">Godina proizvodnje</Label>
                <Input
                  id="yearOfManufacture"
                  name="yearOfManufacture"
                  type="number"
                  min="1950"
                  max={new Date().getFullYear()}
                  placeholder="2022"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="energyClass">Energetska klasa</Label>
                <Input
                  id="energyClass"
                  name="energyClass"
                  placeholder="A+++"
                />
              </div>

              <div>
                <Label htmlFor="capacity">Kapacitet</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  placeholder="npr. 7kg, 250L"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="features">Dodatne karakteristike</Label>
              <textarea
                id="features"
                name="features"
                rows={3}
                className="w-full border rounded-md p-2"
                placeholder="Opišite dodatne funkcije i karakteristike..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Warranty */}
        <Card>
          <CardHeader>
            <CardTitle>Garancija</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="warranty"
                name="warranty"
                className="rounded"
              />
              <Label htmlFor="warranty" className="font-normal">
                Uređaj ima garanciju
              </Label>
            </div>

            <div>
              <Label htmlFor="warrantyMonths">Trajanje garancije (mjeseci)</Label>
              <Input
                id="warrantyMonths"
                name="warrantyMonths"
                type="number"
                min="1"
                max="120"
                placeholder="12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Lokacija</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Grad *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder="Sarajevo"
                />
              </div>

              <div>
                <Label htmlFor="municipality">Opština</Label>
                <Input
                  id="municipality"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  placeholder="Centar"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Adresa</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ulica i broj"
                />
              </div>

              <div>
                <Label htmlFor="postalCode">Poštanski broj</Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="71000"
                />
              </div>
            </div>

            <LocationMapPicker
              onLocationSelect={handleLocationSelect}
              initialLat={latitude}
              initialLng={longitude}
              initialAddress={address}
            />
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Slike</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="images">Dodaj slike</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesSelect}
                disabled={loading || uploadingImages}
              />
              {uploadingImages && (
                <p className="text-sm text-muted-foreground mt-2">Upload slika je u toku...</p>
              )}
              {uploadedCount > 0 && (
                <p className="text-sm text-green-600 mt-2">Uspješno uploadovano: {uploadedCount}</p>
              )}
              {uploadError && (
                <p className="text-sm text-red-500 mt-2">{uploadError}</p>
              )}
            </div>

            <div>
              <Label htmlFor="imageUrls">URL slike (jedan po redu ili odvojeno zarezom)</Label>
              <textarea
                id="imageUrls"
                value={imageUrls}
                onChange={(e) => setImageUrls(e.target.value)}
                placeholder="https://.../slika1.jpg&#10;https://.../slika2.jpg"
                className="w-full border rounded-md p-2 min-h-[100px]"
              />
            </div>

            {previewImageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                    <div className="relative h-28 w-full">
                      <Image
                        src={imageUrl}
                        alt={`Pregled slike ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
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
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={loading} className="flex-1">
            {loading ? 'Objavljivanje...' : 'Objavi oglas'}
          </Button>
          <Link href="/bijela-tehnika" className="flex-1">
            <Button type="button" variant="outline" size="lg" className="w-full">
              Odustani
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
