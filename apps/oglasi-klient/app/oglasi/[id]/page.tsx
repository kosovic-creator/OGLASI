import { getAdById, incrementAdViews } from '@oglasi/server-actions/ads'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, MapPin, Phone, Mail, User, Calendar } from 'lucide-react'

export default async function AdDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // Uvećaj broj pregleda
  await incrementAdViews(params.id)

  // Preuzmi oglas sa svim detaljima
  const ad = await getAdById(params.id)

  if (!ad) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Oglas nije pronađen</h1>
        <Link href="/oglasi">
          <Button>Nazad na oglase</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/oglasi">
          <Button variant="ghost" size="sm">
            ← Nazad na oglase
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Badge>{ad.category}</Badge>
                    <Badge variant={ad.type === 'PRODAJA' ? 'default' : 'secondary'}>
                      {ad.type}
                    </Badge>
                    <Badge
                      variant={
                        ad.status === 'AKTIVNO'
                          ? 'default'
                          : ad.status === 'PRODATO'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {ad.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl">{ad.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-lg">
                    <MapPin className="h-4 w-4" />
                    {ad.location?.city || 'Lokacija nije navedena'}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">{formatPrice(ad.price)}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                    <Eye className="h-4 w-4" />
                    {ad.views} pregleda
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Images */}
          {ad.images.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ad.images.map((img, idx) => (
                    <div key={img.id} className={idx === 0 ? 'md:col-span-2' : ''}>
                      <Image
                        src={img.url}
                        alt={img.alt || ad.title}
                        width={800}
                        height={600}
                        className="rounded-lg object-cover w-full h-auto"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Opis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {ad.description}
              </p>
            </CardContent>
          </Card>

          {/* Real Estate Details */}
          {ad.realEstate && (
            <Card>
              <CardHeader>
                <CardTitle>Detalji nekretnine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tip</p>
                    <p className="font-medium">{ad.realEstate.realEstateType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Površina</p>
                    <p className="font-medium">{ad.realEstate.surface.toString()} m²</p>
                  </div>
                  {ad.realEstate.rooms && (
                    <div>
                      <p className="text-sm text-muted-foreground">Sobe</p>
                      <p className="font-medium">{ad.realEstate.rooms}</p>
                    </div>
                  )}
                  {ad.realEstate.bathrooms && (
                    <div>
                      <p className="text-sm text-muted-foreground">Kupatila</p>
                      <p className="font-medium">{ad.realEstate.bathrooms}</p>
                    </div>
                  )}
                  {ad.realEstate.floor && (
                    <div>
                      <p className="text-sm text-muted-foreground">Sprat</p>
                      <p className="font-medium">{ad.realEstate.floor}</p>
                    </div>
                  )}
                  {ad.realEstate.heating && (
                    <div>
                      <p className="text-sm text-muted-foreground">Grijanje</p>
                      <p className="font-medium">{ad.realEstate.heating}</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                  {ad.realEstate.parking && <Badge variant="outline">Parking</Badge>}
                  {ad.realEstate.elevator && <Badge variant="outline">Lift</Badge>}
                  {ad.realEstate.balcony && <Badge variant="outline">Balkon</Badge>}
                  {ad.realEstate.terrace && <Badge variant="outline">Terasa</Badge>}
                  {ad.realEstate.garden && <Badge variant="outline">Bašta</Badge>}
                  {ad.realEstate.furnished && <Badge variant="outline">Namješten</Badge>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vehicle Details */}
          {ad.vehicle && (
            <Card>
              <CardHeader>
                <CardTitle>Detalji vozila</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Marka</p>
                    <p className="font-medium">{ad.vehicle.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p className="font-medium">{ad.vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Godište</p>
                    <p className="font-medium">{ad.vehicle.yearOfManufacture}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kilometraža</p>
                    <p className="font-medium">{ad.vehicle.mileage.toLocaleString()} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gorivo</p>
                    <p className="font-medium">{ad.vehicle.fuelType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mjenjač</p>
                    <p className="font-medium">{ad.vehicle.transmission}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* White Goods Details */}
          {ad.whiteGoods && (
            <Card>
              <CardHeader>
                <CardTitle>Detalji uređaja</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Brend</p>
                    <p className="font-medium">{ad.whiteGoods.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p className="font-medium">{ad.whiteGoods.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stanje</p>
                    <p className="font-medium">{ad.whiteGoods.condition}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Kontakt informacije</CardTitle>
              <CardDescription>Kontaktirajte vlasnika oglasa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ad.user.name && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ime</p>
                    <p className="font-medium">{ad.user.name}</p>
                  </div>
                </div>
              )}
              {ad.user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{ad.user.phone}</p>
                  </div>
                </div>
              )}
              {ad.user.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{ad.user.email}</p>
                  </div>
                </div>
              )}
              <Button className="w-full mt-4">
                <Phone className="h-4 w-4 mr-2" />
                Pozovi
              </Button>
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Pošalji poruku
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informacije</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Objavljeno:</span>
                <span className="font-medium">
                  {new Date(ad.createdAt).toLocaleDateString('bs-BA')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Pregleda:</span>
                <span className="font-medium">{ad.views}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}