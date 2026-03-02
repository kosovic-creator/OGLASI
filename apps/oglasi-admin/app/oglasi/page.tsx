import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { AdsSearchTable } from '@/components/ads-search-table'

export default function OglasiPage() {

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Svi Oglasi</h1>
          <p className="text-muted-foreground mt-2">
            Pregledajte i filtrirajte sve aktivne oglase
          </p>
        </div>
        {/* <Link href="/oglasi/dodaj">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Dodaj Oglas
          </Button>
        </Link> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pretraga i lista oglasa</CardTitle>
          <CardDescription>
            Filtriraj oglase po kategoriji, tipu, gradu i cijeni. Tabela ispod prikazuje iste rezultate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdsSearchTable />
        </CardContent>
      </Card>
    </div>
  )
}
