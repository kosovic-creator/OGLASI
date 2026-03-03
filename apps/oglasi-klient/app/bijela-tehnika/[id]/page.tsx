import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getWhiteGoodsById } from '@oglasi/server-actions'
import {
  ArrowLeft,
  Package,
  Award,
  Calendar,
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

export default async function WhiteGoodsDetailsPage({ params }: { params: { id: string } }) {
  const ad = await getWhiteGoodsById(params.id)
  const session = await getServerSession(authOptions)

  if (!ad || !ad.whiteGoods) {
    notFound()
  }

  const item = ad.whiteGoods
  const isOwner = session?.user?.id === ad.userId

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/bijela-tehnika">
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
                  <Package className="h-24 w-24 text-gray-400" />
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
                    <Badge variant="outline">{item.condition}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    {Number(ad.price).toLocaleString('bs-BA')} €
                  </p>
                  {isOwner && (
                    <Link href={`/bijela-tehnika/${ad.id}/edit`}>
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

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Specifikacije
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Brend</p>
                  <p className="font-semibold">{item.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Model</p>
                  <p className="font-semibold">{item.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stanje</p>
                  <p className="font-semibold">{item.condition}</p>
                </div>
                {item.yearOfManufacture && (
                  <div>
                    <p className="text-sm text-gray-600">Godina proizvodnje</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {item.yearOfManufacture}
                    </p>
                  </div>
                )}
                {item.energyClass && (
                  <div>
                    <p className="text-sm text-gray-600">Energetska klasa</p>
                    <p className="font-semibold">{item.energyClass}</p>
                  </div>
                )}
                {item.capacity && (
                  <div>
                    <p className="text-sm text-gray-600">Kapacitet</p>
                    <p className="font-semibold">{item.capacity}</p>
                  </div>
                )}
              </div>

              {item.warranty && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <Award className="h-5 w-5" />
                    <span className="font-semibold">
                      Garancija{item.warrantyMonths && `: ${item.warrantyMonths} mjeseci`}
                    </span>
                  </div>
                </div>
              )}

              {item.features && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Dodatne karakteristike</p>
                  <p className="text-gray-700">{item.features}</p>
                </div>
              )}
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
