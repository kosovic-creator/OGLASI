'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'
import { AdSearch } from '@oglasi/features'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { EditAdButton } from '@/components/edit-ad-button'
import { DeleteAdButton } from '@/components/delete-ad-button'

type AdRow = {
  id: string
  title: string
  category: string
  type: string
  status?: string
  price: number | string | { toString(): string }
  views?: number
  location?: {
    city?: string | null
  } | null
}

export function AdsSearchTable() {
  return (
    <AdSearch
      take={50}
      renderResults={(ads) => {
        const rows = ads as AdRow[]

        return (
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
                  {/* <TableHead className="text-right font-semibold">Akcije</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-32">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p className="text-lg font-medium">Nema oglasa za prikaz</p>
                        <p className="text-sm mt-1">Promijenite filtere ili dodajte novi oglas</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((ad) => (
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
                          {ad.status || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {ad.location?.city || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-blue-600">
                        {formatPrice(ad.price as never)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        <div className="flex items-center justify-end gap-1">
                          <Eye className="h-4 w-4" />
                          {ad.views ?? 0}
                        </div>
                      </TableCell>
                      {/* <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/oglasi/${ad.id}`}>
                            <Button variant="outline" size="sm">
                              Detalji
                            </Button>
                          </Link>
                          <EditAdButton adId={ad.id} />
                          <DeleteAdButton adId={ad.id} />
                        </div>
                      </TableCell> */}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )
      }}
    />
  )
}
