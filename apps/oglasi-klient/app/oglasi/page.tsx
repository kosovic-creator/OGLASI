import { getAds } from '@oglasi/server-actions/ads'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Eye } from 'lucide-react'

export default async function OglasiPage() {
  const ads = await getAds({ take: 50 })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Svi Oglasi</h1>
          <p className="text-muted-foreground mt-2">
            Pregledajte sve aktivne oglase ({ads.length} oglasa)
          </p>
        </div>
        <Link href="/oglasi/dodaj">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Dodaj Oglas
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista Oglasa</CardTitle>
          <CardDescription>
            Svi oglasi sortirati po datumu kreiranja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[300px] font-semibold">Naslov</TableHead>
                  <TableHead className="font-semibold">Kategorija</TableHead>
                  <TableHead className="font-semibold">Tip</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Lokacija</TableHead>
                  <TableHead className="text-right font-semibold">Cijena</TableHead>
                  <TableHead className="text-right font-semibold">Pregledi</TableHead>
                  <TableHead className="text-right font-semibold">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-32">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p className="text-lg font-medium">Nema oglasa za prikaz</p>
                        <p className="text-sm mt-1">Dodajte prvi oglas klikom na dugme iznad</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  ads.map((ad) => (
                    <TableRow key={ad.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <Link
                          href={`/oglasi/${ad.id}`}
                          className="hover:underline text-blue-600 hover:text-blue-800 transition-colors line-clamp-2"
                        >
                          {ad.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {ad.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={ad.type === 'PRODAJA' ? 'default' : 'secondary'}
                          className="whitespace-nowrap"
                        >
                          {ad.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ad.status === 'AKTIVNO'
                              ? 'default'
                              : ad.status === 'PRODATO'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="whitespace-nowrap"
                        >
                          {ad.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {ad.location?.city || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-blue-600">
                        {formatPrice(ad.price)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        <div className="flex items-center justify-end gap-1">
                          <Eye className="h-4 w-4" />
                          {ad.views}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/oglasi/${ad.id}`}>
                          <Button variant="outline" size="sm">
                            Detalji
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
