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
import { createVehicle } from '@oglasi/server-actions'
import { ArrowLeft, Car } from 'lucide-react'
import Link from 'next/link'

export default function AddVehiclePage() {
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

      const vehicleData = {
        vehicleType: formData.get('vehicleType') as 'AUTOMOBIL' | 'TERETNO' | 'MOTOCIKL',
        brand: formData.get('brand') as string,
        model: formData.get('model') as string,
        yearOfManufacture: parseInt(formData.get('yearOfManufacture') as string),
        mileage: parseInt(formData.get('mileage') as string),
        fuelType: formData.get('fuelType') as 'BENZIN' | 'DIZEL' | 'HIBRID' | 'ELEKTRICNI' | 'PLIN',
        transmission: formData.get('transmission') as 'MANUELNI' | 'AUTOMATIK',
        condition: formData.get('condition') as 'NOVO' | 'KAO_NOVO' | 'DOBRO' | 'ZADOVOLJAVAJUCE',
        enginePower: formData.get('enginePower') ? parseInt(formData.get('enginePower') as string) : undefined,
        engineVolume: formData.get('engineVolume') ? parseInt(formData.get('engineVolume') as string) : undefined,
        color: formData.get('color') as string || undefined,
        doors: formData.get('doors') ? parseInt(formData.get('doors') as string) : undefined,
        seats: formData.get('seats') ? parseInt(formData.get('seats') as string) : undefined,
        airbags: formData.get('airbags') === 'on',
        abs: formData.get('abs') === 'on',
        airConditioning: formData.get('airConditioning') === 'on',
        parkingSensors: formData.get('parkingSensors') === 'on',
        cruiseControl: formData.get('cruiseControl') === 'on',
      }

      const result = await createVehicle(session.user.id, adData, vehicleData)
      router.push(`/auti/${result.id}`)
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
      <Link href="/auti">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Nazad
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Car className="h-8 w-8 text-blue-600" />
          Dodaj automobil
        </h1>
        <p className="text-gray-600 mt-2">Popunite sve potrebne informacije o vozilu</p>
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
                placeholder="npr. Volkswagen Golf 7 GTI"
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
                placeholder="Detaljan opis vozila..."
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
                  placeholder="15000"
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

        {/* Vehicle Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalji vozila</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vehicleType">Tip vozila *</Label>
              <select
                id="vehicleType"
                name="vehicleType"
                required
                className="w-full border rounded-md p-2 h-10"
              >
                <option value="AUTOMOBIL">Automobil</option>
                <option value="TERETNO">Teretno vozilo</option>
                <option value="MOTOCIKL">Motocikl</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marka *</Label>
                <Input
                  id="brand"
                  name="brand"
                  required
                  placeholder="Volkswagen"
                />
              </div>

              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  name="model"
                  required
                  placeholder="Golf 7"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yearOfManufacture">Godina proizvodnje *</Label>
                <Input
                  id="yearOfManufacture"
                  name="yearOfManufacture"
                  type="number"
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  placeholder="2020"
                />
              </div>

              <div>
                <Label htmlFor="mileage">Kilometraža *</Label>
                <Input
                  id="mileage"
                  name="mileage"
                  type="number"
                  required
                  min="0"
                  placeholder="50000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fuelType">Gorivo *</Label>
                <select
                  id="fuelType"
                  name="fuelType"
                  required
                  className="w-full border rounded-md p-2 h-10"
                >
                  <option value="BENZIN">Benzin</option>
                  <option value="DIZEL">Dizel</option>
                  <option value="HIBRID">Hibrid</option>
                  <option value="ELEKTRICNI">Električni</option>
                  <option value="PLIN">Plin</option>
                </select>
              </div>

              <div>
                <Label htmlFor="transmission">Transmisija *</Label>
                <select
                  id="transmission"
                  name="transmission"
                  required
                  className="w-full border rounded-md p-2 h-10"
                >
                  <option value="MANUELNI">Manuelni</option>
                  <option value="AUTOMATIK">Automatik</option>
                </select>
              </div>
            </div>

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
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Tehničke specifikacije</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="enginePower">Snaga motora (KW)</Label>
                <Input
                  id="enginePower"
                  name="enginePower"
                  type="number"
                  min="0"
                  placeholder="110"
                />
              </div>

              <div>
                <Label htmlFor="engineVolume">Zapremina motora (cm³)</Label>
                <Input
                  id="engineVolume"
                  name="engineVolume"
                  type="number"
                  min="0"
                  placeholder="2000"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="color">Boja</Label>
                <Input
                  id="color"
                  name="color"
                  placeholder="Crna"
                />
              </div>

              <div>
                <Label htmlFor="doors">Broj vrata</Label>
                <Input
                  id="doors"
                  name="doors"
                  type="number"
                  min="2"
                  max="6"
                  placeholder="5"
                />
              </div>

              <div>
                <Label htmlFor="seats">Broj sedišta</Label>
                <Input
                  id="seats"
                  name="seats"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>Dodatna oprema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="airbags"
                  name="airbags"
                  className="rounded"
                />
                <Label htmlFor="airbags" className="font-normal">
                  Airbag
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="abs"
                  name="abs"
                  className="rounded"
                />
                <Label htmlFor="abs" className="font-normal">
                  ABS
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="airConditioning"
                  name="airConditioning"
                  className="rounded"
                />
                <Label htmlFor="airConditioning" className="font-normal">
                  Klima uređaj
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="parkingSensors"
                  name="parkingSensors"
                  className="rounded"
                />
                <Label htmlFor="parkingSensors" className="font-normal">
                  Parking senzori
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="cruiseControl"
                  name="cruiseControl"
                  className="rounded"
                />
                <Label htmlFor="cruiseControl" className="font-normal">
                  Tempomat
                </Label>
              </div>
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
          <Link href="/auti" className="flex-1">
            <Button type="button" variant="outline" size="lg" className="w-full">
              Odustani
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
