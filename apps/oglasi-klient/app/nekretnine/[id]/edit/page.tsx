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
import { updateRealEstate, getRealEstateById, deleteRealEstate } from '@oglasi/server-actions'
import { ArrowLeft, Home, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function EditRealEstatePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [ad, setAd] = useState<any>(null)

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

  function parseImageUrls(value: string): string[] {
    return value.split(/\r?\n|,/).map((url) => url.trim()).filter(Boolean)
  }

  const previewImageUrls = parseImageUrls(imageUrls)

  async function uploadImageToCloudinary(file: File): Promise<string> {
    const signResponse = await fetch('/api/cloudinary/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'oglasi' }),
    })
    if (!signResponse.ok) throw new Error('Neuspješno dobijanje Cloudinary potpisa.')
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
        const data = await getRealEstateById(params.id)
        if (!data) {
          router.push('/nekretnine')
          return
        }
        if (session?.user?.id !== data.userId) {
          router.push(`/nekretnine/${params.id}`)
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

      const realEstateData = {
        realEstateType: formData.get('realEstateType') as 'STAN' | 'KUCA' | 'POSLOVNI_PROSTOR',
        surface: parseFloat(formData.get('surface') as string),
        rooms: formData.get('rooms') ? parseInt(formData.get('rooms') as string) : undefined,
        bathrooms: formData.get('bathrooms') ? parseInt(formData.get('bathrooms') as string) : undefined,
        floor: formData.get('floor') ? parseInt(formData.get('floor') as string) : undefined,
        totalFloors: formData.get('totalFloors') ? parseInt(formData.get('totalFloors') as string) : undefined,
        yearBuilt: formData.get('yearBuilt') ? parseInt(formData.get('yearBuilt') as string) : undefined,
        heating: formData.get('heating') as any || undefined,
        parking: formData.get('parking') === 'on',
        elevator: formData.get('elevator') === 'on',
        balcony: formData.get('balcony') === 'on',
        terrace: formData.get('terrace') === 'on',
        garden: formData.get('garden') === 'on',
        furnished: formData.get('furnished') === 'on',
      }

      await updateRealEstate(session.user.id, params.id, adData, realEstateData)
      router.push(`/nekretnine/${params.id}`)
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

      await deleteRealEstate(session.user.id, params.id)
      router.push('/nekretnine')
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

  const realEstate = ad.realEstate

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href={`/nekretnine/${params.id}`}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Nazad
        </Button>
      </Link>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Home className="h-8 w-8 text-blue-600" />
            Izmeni oglas
          </h1>
          <p className="text-gray-600 mt-2">Ažurirajte informacije o nekretnini</p>
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
            <CardTitle>Detalji nekretnine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="realEstateType">Tip nekretnine *</Label>
              <select
                id="realEstateType"
                name="realEstateType"
                required
                defaultValue={realEstate.realEstateType}
                className="w-full border rounded-md p-2 h-10"
              >
                <option value="STAN">Stan</option>
                <option value="KUCA">Kuća</option>
                <option value="POSLOVNI_PROSTOR">Poslovni prostor</option>
              </select>
            </div>
            <div>
              <Label htmlFor="surface">Površina (m²) *</Label>
              <Input
                id="surface"
                name="surface"
                type="number"
                step="0.01"
                required
                defaultValue={Number(realEstate.surface)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rooms">Broj soba</Label>
                <Input
                  id="rooms"
                  name="rooms"
                  type="number"
                  min="1"
                  defaultValue={realEstate.rooms || ''}
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Broj kupatila</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="1"
                  defaultValue={realEstate.bathrooms || ''}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="floor">Sprat</Label>
                <Input
                  id="floor"
                  name="floor"
                  type="number"
                  defaultValue={realEstate.floor || ''}
                />
              </div>
              <div>
                <Label htmlFor="totalFloors">Ukupno spratova</Label>
                <Input
                  id="totalFloors"
                  name="totalFloors"
                  type="number"
                  min="1"
                  defaultValue={realEstate.totalFloors || ''}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yearBuilt">Godina izgradnje</Label>
                <Input
                  id="yearBuilt"
                  name="yearBuilt"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  defaultValue={realEstate.yearBuilt || ''}
                />
              </div>
              <div>
                <Label htmlFor="heating">Grijanje</Label>
                <select
                  id="heating"
                  name="heating"
                  defaultValue={realEstate.heating || ''}
                  className="w-full border rounded-md p-2 h-10"
                >
                  <option value="">Odaberite...</option>
                  <option value="CENTRALNO">Centralno</option>
                  <option value="ETAZNO">Etažno</option>
                  <option value="PLIN">Plin</option>
                  <option value="STRUJA">Struja</option>
                  <option value="PELET">Pelet</option>
                  <option value="KRUTO_GORIVO">Kruto gorivo</option>
                  <option value="TOPLOTNA_PUMPA">Toplotna pumpa</option>
                  <option value="KLIMA">Klima</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dodatne karakteristike</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="parking" name="parking" defaultChecked={realEstate.parking} className="rounded" />
                <Label htmlFor="parking" className="font-normal">Parking</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="elevator" name="elevator" defaultChecked={realEstate.elevator} className="rounded" />
                <Label htmlFor="elevator" className="font-normal">Lift</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="balcony" name="balcony" defaultChecked={realEstate.balcony} className="rounded" />
                <Label htmlFor="balcony" className="font-normal">Balkon</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="terrace" name="terrace" defaultChecked={realEstate.terrace} className="rounded" />
                <Label htmlFor="terrace" className="font-normal">Terasa</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="garden" name="garden" defaultChecked={realEstate.garden} className="rounded" />
                <Label htmlFor="garden" className="font-normal">Bašta</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="furnished" name="furnished" defaultChecked={realEstate.furnished} className="rounded" />
                <Label htmlFor="furnished" className="font-normal">Namješteno</Label>
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
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="Sarajevo" />
              </div>
              <div>
                <Label htmlFor="municipality">Opština</Label>
                <Input id="municipality" value={municipality} onChange={(e) => setMunicipality(e.target.value)} placeholder="Centar" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Adresa</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ulica i broj" />
              </div>
              <div>
                <Label htmlFor="postalCode">Poštanski broj</Label>
                <Input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="71000" />
              </div>
            </div>
            <LocationMapPicker onLocationSelect={handleLocationSelect} initialLat={latitude} initialLng={longitude} initialAddress={address} />
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
              <Input id="images" type="file" accept="image/*" multiple onChange={handleImagesSelect} disabled={saving || uploadingImages} />
              {uploadingImages && <p className="text-sm text-muted-foreground mt-2">Upload slika je u toku...</p>}
              {uploadedCount > 0 && <p className="text-sm text-green-600 mt-2">Uspješno uploadovano: {uploadedCount}</p>}
              {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}
            </div>
            <div>
              <Label htmlFor="imageUrls">URL slike (jedan po redu ili odvojeno zarezom)</Label>
              <textarea id="imageUrls" value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} placeholder="https://.../slika1.jpg&#10;https://.../slika2.jpg" className="w-full border rounded-md p-2 min-h-[100px]" />
            </div>
            {previewImageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {previewImageUrls.map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="overflow-hidden rounded-md border bg-muted" draggable onDragStart={() => setDraggedImageIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedImageIndex !== null) { moveImage(draggedImageIndex, index) } setDraggedImageIndex(null) }} onDragEnd={() => setDraggedImageIndex(null)}>
                    <div className="relative h-28 w-full">
                      <Image src={imageUrl} alt={`Pregled slike ${index + 1}`} fill className="object-cover" unoptimized />
                    </div>
                    <div className="p-2">
                      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => removeImageAtIndex(index)}>Obriši sliku</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={saving} className="flex-1">
            {saving ? 'Čuvanje...' : 'Sačuvaj izmene'}
          </Button>
          <Link href={`/nekretnine/${params.id}`} className="flex-1">
            <Button type="button" variant="outline" size="lg" className="w-full">
              Odustani
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
