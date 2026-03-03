import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getVehicleById } from '@oglasi/server-actions'
import {
  ArrowLeft,
  Car,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  MapPin,
  Eye,
  Phone,
  Mail,
  Check,
  X
} from 'lucide-react'
import { ContactForm } from '@/components/ContactForm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@oglasi/auth'

export default async function VehicleDetailsPage({ params }: { params: { id: string } }) {
  const ad = await getVehicleById(params.id)
  const session = await getServerSession(authOptions)

  if (!ad || !ad.vehicle) {
    notFound()
  }

  const vehicle = ad.vehicle
  const isOwner = session?.user?.id === ad.userId

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/auti">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Nazad na listu
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardContent className="p-0">
              {ad.images.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 p-4">
                  <div className="relative h-96 w-full">
                    <Image
                      src={ad.images[0].url}
                      alt={ad.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  {ad.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {ad.images.slice(1, 5).map((image, idx) => (
                        <div key={idx} className="relative h-24">
                          <Image
                            src={image.url}
                            alt={`${ad.title} - ${idx + 2}`}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-gray-200 flex items-center justify-center">
                  <Car className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Title and Price */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl mb-2">{ad.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{ad.type}</Badge>
                    <Badge variant="outline">{ad.status}</Badge>
                    <Badge variant="outline">{vehicle.vehicleType}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    {Number(ad.price).toLocaleString('bs-BA')} €
                  </p>
                  {isOwner && (
                    <Link href={`/auti/${ad.id}/edit`}>
                      <Button className="mt-2" size="sm">
                        Izmeni
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{ad.description}</p>
            </CardContent>
          </Card>

          {/* Vehicle Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Osnovne informacije
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Marka i model</p>
                  <p className="font-semibold">{vehicle.brand} {vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Godina proizvodnje</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {vehicle.yearOfManufacture}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kilometraža</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Gauge className="h-4 w-4" />
                    {vehicle.mileage.toLocaleString()} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gorivo</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Fuel className="h-4 w-4" />
                    {vehicle.fuelType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transmisija</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    {vehicle.transmission}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stanje</p>
                  <p className="font-semibold">{vehicle.condition}</p>
                </div>
                {vehicle.enginePower && (
                  <div>
                    <p className="text-sm text-gray-600">Snaga motora</p>
                    <p className="font-semibold">{vehicle.enginePower} KW</p>
                  </div>
                )}
                {vehicle.engineVolume && (
                  <div>
                    <p className="text-sm text-gray-600">Zapremina motora</p>
                    <p className="font-semibold">{vehicle.engineVolume} cm³</p>
                  </div>
                )}
                {vehicle.color && (
                  <div>
                    <p className="text-sm text-gray-600">Boja</p>
                    <p className="font-semibold">{vehicle.color}</p>
                  </div>
                )}
                {vehicle.doors && (
                  <div>
                    <p className="text-sm text-gray-600">Broj vrata</p>
                    <p className="font-semibold">{vehicle.doors}</p>
                  </div>
                )}
                {vehicle.seats && (
                  <div>
                    <p className="text-sm text-gray-600">Broj sedišta</p>
                    <p className="font-semibold">{vehicle.seats}</p>
                  </div>
                )}
                {vehicle.registeredUntil && (
                  <div>
                    <p className="text-sm text-gray-600">Registrovan do</p>
                    <p className="font-semibold">
                      {new Date(vehicle.registeredUntil).toLocaleDateString('bs-BA')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Features */}
          <Card>
            <CardHeader>
              <CardTitle>Dodatna oprema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  {vehicle.airbags ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={vehicle.airbags ? 'text-gray-900' : 'text-gray-400'}>
                    Airbag
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {vehicle.abs ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={vehicle.abs ? 'text-gray-900' : 'text-gray-400'}>
                    ABS
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {vehicle.airConditioning ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={vehicle.airConditioning ? 'text-gray-900' : 'text-gray-400'}>
                    Klima
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {vehicle.parkingSensors ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={vehicle.parkingSensors ? 'text-gray-900' : 'text-gray-400'}>
                    Parking senzori
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {vehicle.cruiseControl ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={vehicle.cruiseControl ? 'text-gray-900' : 'text-gray-400'}>
                    Tempomat
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle>Kontakt informacije</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ime</p>
                <p className="font-semibold">{ad.user.name || 'Korisnik'}</p>
              </div>
              {ad.user.phone && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Telefon</p>
                  <a
                    href={`tel:${ad.user.phone}`}
                    className="font-semibold flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {ad.user.phone}
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <a
                  href={`mailto:${ad.user.email}`}
                  className="font-semibold flex items-center gap-2 text-blue-600 hover:underline break-all"
                >
                  <Mail className="h-4 w-4" />
                  {ad.user.email}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          {ad.location && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Lokacija
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{ad.location.city}</p>
                {ad.location.municipality && (
                  <p className="text-sm text-gray-600">{ad.location.municipality}</p>
                )}
                {ad.location.address && (
                  <p className="text-sm text-gray-600 mt-2">{ad.location.address}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Eye className="h-4 w-4" />
                <span className="text-sm">{ad.views} pregleda</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Objavljeno: {new Date(ad.createdAt).toLocaleDateString('bs-BA')}
              </p>
            </CardContent>
          </Card>

          {/* Contact Form */}
          {!isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Pošalji poruku</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactForm adId={ad.id} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
