import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getRealEstates } from '@oglasi/server-actions'
import { PlusCircle, Home, Eye, MapPin, Maximize, BedDouble } from 'lucide-react'
import Image from 'next/image'

export default async function NekretninePageComponent() {
  const realEstates = await getRealEstates({ take: 20 })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Home className="h-10 w-10 text-blue-600" />
            Nekretnine
          </h1>
          <p className="text-gray-600 mt-2">Pronađite savršen stan, kuću ili poslovni prostor</p>
        </div>
        <Link href="/nekretnine/dodaj">
          <Button size="lg" className="gap-2">
            <PlusCircle className="h-5 w-5" />
            Dodaj nekretninu
          </Button>
        </Link>
      </div>

      {/* Filter section - TODO: Implement filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <p className="text-sm text-gray-600">Filteri će biti dodani uskoro...</p>
      </div>

      {realEstates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Home className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nema nekretnina</h3>
            <p className="text-gray-600 mb-6">Trenutno nema objavljenih nekretnina.</p>
            <Link href="/nekretnine/dodaj">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Dodaj prvu nekretninu
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {realEstates.map((ad) => {
            const realEstate = ad.realEstate
            if (!realEstate) return null

            return (
              <Link key={ad.id} href={`/nekretnine/${ad.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative h-48 w-full">
                    {ad.images[0] ? (
                      <Image
                        src={ad.images[0].url}
                        alt={ad.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
                        <Home className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge className="bg-blue-600">{ad.type}</Badge>
                      <Badge variant="secondary">{realEstate.realEstateType}</Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-1">{ad.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{ad.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-blue-600">
                        {Number(ad.price).toLocaleString('bs-BA')} €
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Maximize className="h-4 w-4" />
                          <span>{Number(realEstate.surface)} m²</span>
                        </div>
                        {realEstate.rooms && (
                          <div className="flex items-center gap-1">
                            <BedDouble className="h-4 w-4" />
                            <span>{realEstate.rooms} soba</span>
                          </div>
                        )}
                      </div>
                      {ad.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{ad.location.city}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="text-sm text-gray-500 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{ad.views} pregleda</span>
                  </CardFooter>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
