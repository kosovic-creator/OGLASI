import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Car } from 'lucide-react'
import { AdsSearchTable } from '@/components/ads-search-table'

export default function AutiPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Car className="h-8 w-8 text-orange-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Automobili</h1>
            <p className="text-muted-foreground mt-1">
              Automobili, motocikli, teretna vozila
            </p>
          </div>
        </div>
        <Link href="/oglasi/dodaj">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Dodaj oglas
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Oglasi - Automobili</CardTitle>
          <CardDescription>
            Pregledajte sve dostupne automobile i vozila. Filtrirajte po marki, godini, gorivima i cijeni.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdsSearchTable category="AUTOMOBILI" />
        </CardContent>
      </Card>
    </div>
  )
}
