import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Home } from 'lucide-react'
import { AdsSearchTable } from '@/components/ads-search-table'

export default function NekretninePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Home className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nekretnine</h1>
            <p className="text-muted-foreground mt-1">
              Kuće, stanovi, poslovni prostori
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
          <CardTitle>Oglasi - Nekretnine</CardTitle>
          <CardDescription>
            Pregledajte sve dostupne nekretnine: stanove, kuće i poslovne prostore. Filtrirajte po tipu, gradu i cijeni.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdsSearchTable category="NEKRETNINE" />
        </CardContent>
      </Card>
    </div>
  )
}
