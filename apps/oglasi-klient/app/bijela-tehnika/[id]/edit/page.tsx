'use client'

import { useState, useEffect, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { LocationMapPicker } from '@/components/LocationMapPicker'
import { updateWhiteGoods, getWhiteGoodsById, deleteWhiteGoods } from '@oglasi/server-actions'
import { ArrowLeft, Package, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function EditWhiteGoodsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [ad, setAd] = useState<any>(null)

  const [imageUrls, setImageUrls] = useState<string>('')
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)

  const [city, setCity] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [latitude, setLatitude] = useState<number | undefined>()
  const [longitude, setLongitude] = useState<number | undefined>()

  function parseImageUrls(value: string): string[] {
    return value.split(/\r?\n|,/).map((url) => url.trim()).filter(Boolean)
  }
  const previewImageUrls = parseImageUrls(imageUrls)

  async function uploadImageToCloudinary(file: File): Promise<string> {
    const signResponse = await fetch('/api/cloudinary/sign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder: 'oglasi' }) })
    if (!signResponse.ok) throw new Error('Neuspješno dobijanje Cloudinary potpisa.')
    const { cloudName, apiKey, timestamp, folder, signature } = await signResponse.json()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', apiKey)
    formData.append('timestamp', String(timestamp))
    formData.append('signature', signature)
    formData.append('folder', folder)
    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData })
    if (!uploadResponse.ok) throw new Error('Neuspješan upload slike na Cloudinary.')
    const uploadData = await uploadResponse.json()
    if (!uploadData.secure_url) throw new Error('Cloudinary nije vratio URL slike.')
    return uploadData.secure_url
  }

  async function handleImagesSelect(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files || files.length === 0) return
    setUploadError('')
    setUploadingImages(true)
    try {
      const fileList = Array.from(files)
      const invalidFile = fileList.find((file) => !file.type.startsWith('image/'))
      if (invalidFile) throw new Error('Dozvoljen je upload samo slika.')
      const uploadedUrls: string[] = []
      for (const file of fileList) uploadedUrls.push(await uploadImageToCloudinary(file))
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

  function handleLocationSelect(lat: number, lng: number, addr?: string) {
    setLatitude(lat)
    setLongitude(lng)
    if (addr) setAddress(addr)
  }

  function removeImageAtIndex(indexToRemove: number) {
    const currentUrls = parseImageUrls(imageUrls)
    const nextUrls = currentUrls.filter((_, index) => index !== indexToRemove)
    setImageUrls(nextUrls.join('\n'))
  }

  function moveImage(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    const currentUrls = parseImageUrls(imageUrls)
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= currentUrls.length || toIndex >= currentUrls.length) return
    const reorderedUrls = [...currentUrls]
    const [movedItem] = reorderedUrls.splice(fromIndex, 1)
    reorderedUrls.splice(toIndex, 0, movedItem)
    setImageUrls(reorderedUrls.join('\n'))
  }

  useEffect(() => {
    async function loadAd() {
      try {
        const data = await getWhiteGoodsById(params.id)
        if (!data) {
          router.push('/bijela-tehnika')
          return
        }
        if (session?.user?.id !== data.userId) {
          router.push(`/bijela-tehnika/${params.id}`)
          return
        }
        setAd(data)

        if (data.images && data.images.length > 0) {
          const imageUrlsString = data.images
            .sort((a: any, b: any) => a.order - b.order)
            .map((img: any) => img.url)
            .join('\n')
          setImageUrls(imageUrlsString)
        }

        if (data.location) {
          setCity(data.location.city || '')
          setMunicipality(data.location.municipality || '')
          setAddress(data.location.address || '')
          setPostalCode(data.location.postalCode || '')
          if (data.location.latitude && data.location.longitude) {
            setLatitude(Number(data.location.latitude))
            setLongitude(Number(data.location.longitude))
          }
        }
      } catch (err) {
        setError('Greška prilikom učitavanja')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadAd()
    }
  }, [params.id, session, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
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
        status: formData.get('status') as 'AKTIVNO' | 'NEAKTIVNO' | 'PRODATO' | 'IZNAJMLJENO',
        ...(city && {
          location: {
            city,
            municipality,
            address,
            postalCode,
            latitude,
            longitude,
          }
        }),
        images: parseImageUrls(imageUrls).map((url, index) => ({
          url,
          order: index,
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

      await updateWhiteGoods(session.user.id, params.id, adData, whiteGoodsData)
      router.push(`/bijela-tehnika/${params.id}`)
    } catch (err: any) {
      setError(err.message || 'Došlo je do greške')
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Da li ste sigurni da želite obrisati ovaj oglas?')) {
      return
    }

    setDeleting(true)
    try {
      if (!session?.user?.id) {
        throw new Error('Morate biti prijavljeni')
      }

      await deleteWhiteGoods(session.user.id, params.id)
      router.push('/bijela-tehnika')
    } catch (err: any) {
      setError(err.message || 'Došlo je do greške')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Učitavanje...</p>
      </div>
    )
  }

  if (!session || !ad) {
    return null
  }

  const item = ad.whiteGoods

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href={`/bijela-tehnika/${params.id}`}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Nazad
        </Button>
      </Link>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            Izmeni oglas
          </h1>
          <p className="text-gray-600 mt-2">Ažurirajte informacije o uređaju</p>
        </div>
        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
          <Trash2 className="h-4 w-4 mr-2" />
          {deleting ? 'Brisanje...' : 'Obriši oglas'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Osnovne informacije</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Naslov oglasa *</Label>
              <Input id="title" name="title" required defaultValue={ad.title} />
            </div>
            <div>
              <Label htmlFor="description">Opis *</Label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                defaultValue={ad.description}
                className="w-full border rounded-md p-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Cijena (€) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={Number(ad.price)}
                />
              </div>
              <div>
                <Label htmlFor="type">Tip oglasa *</Label>
                <select
                  id="type"
                  name="type"
                  required
                  defaultValue={ad.type}
                  className="w-full border rounded-md p-2 h-10"
                >
                  <option value="PRODAJA">Prodaja</option>
                  <option value="IZNAJMLJIVANJE">Iznajmljivanje</option>
                </select>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  name="status"
                  required
                  defaultValue={ad.status}
                  className="w-full border rounded-md p-2 h-10"
                >
                  <option value="AKTIVNO">Aktivno</option>
                  <option value="NEAKTIVNO">Neaktivno</option>
                  <option value="PRODATO">Prodato</option>
                  <option value="IZNAJMLJENO">Iznajmljeno</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalji proizvoda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Brend *</Label>
                <Input id="brand" name="brand" required defaultValue={item.brand} />
              </div>
              <div>
                <Label htmlFor="model">Model *</Label>
                <Input id="model" name="model" required defaultValue={item.model} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="condition">Stanje *</Label>
                <select
                  id="condition"
                  name="condition"
                  required
                  defaultValue={item.condition}
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
                  defaultValue={item.yearOfManufacture || ''}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="energyClass">Energetska klasa</Label>
                <Input id="energyClass" name="energyClass" defaultValue={item.energyClass || ''} />
              </div>
              <div>
                <Label htmlFor="capacity">Kapacitet</Label>
                <Input id="capacity" name="capacity" defaultValue={item.capacity || ''} />
              </div>
            </div>
            <div>
              <Label htmlFor="features">Dodatne karakteristike</Label>
              <textarea
                id="features"
                name="features"
                rows={3}
                className="w-full border rounded-md p-2"
                defaultValue={item.features || ''}
              />
            </div>
          </CardContent>
        </Card>

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
                defaultChecked={item.warranty}
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
                defaultValue={item.warrantyMonths || ''}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lokacija</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Grad</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="municipality">Opština</Label>
                <Input
                  id="municipality"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Adresa</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Poštanski broj</Label>
              <Input
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <Label>Odaberite lokaciju na mapi</Label>
              <div className="mt-2">
                <LocationMapPicker
                  onLocationSelect={handleLocationSelect}
                  initialLat={latitude}
                  initialLng={longitude}
                  initialAddress={address}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Slike</CardTitle>
            <CardDescription>
              Dodajte slike oglasa (opciono). Možete dodati više slika odjednom.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="images">Odaberi slike</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesSelect}
                disabled={saving || uploadingImages}
                className="mt-2"
              />
              {uploadingImages && (
                <p className="text-sm text-muted-foreground mt-2">
                  Uploadujem {uploadedCount + 1}. sliku...
                </p>
              )}
              {uploadError && (
                <p className="text-sm text-destructive mt-2">{uploadError}</p>
              )}
            </div>

            <div>
              <Label htmlFor="imageUrls">URL-ovi slika (jedan po liniji)</Label>
              <textarea
                id="imageUrls"
                rows={4}
                className="w-full border rounded-md p-2 font-mono text-sm"
                value={imageUrls}
                onChange={(e) => setImageUrls(e.target.value)}
                placeholder="https://primer.com/slika1.jpg&#10;https://primer.com/slika2.jpg"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Jedan URL po liniji
              </p>
            </div>

            {parseImageUrls(imageUrls).length > 0 && (
              <div>
                <Label>Pregled slika</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {parseImageUrls(imageUrls).map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-move"
                      draggable
                      onDragStart={() => setDraggedImageIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (draggedImageIndex !== null) {
                          moveImage(draggedImageIndex, index)
                          setDraggedImageIndex(null)
                        }
                      }}
                    >
                      <Image
                        src={url}
                        alt={`Slika ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => removeImageAtIndex(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center hover:bg-destructive/90 transition-colors"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Prevucite slike da promenite redosled
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={saving} className="flex-1">
            {saving ? 'Čuvanje...' : 'Sačuvaj izmene'}
          </Button>
          <Link href={`/bijela-tehnika/${params.id}`} className="flex-1">
            <Button type="button" variant="outline" size="lg" className="w-full">
              Odustani
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
