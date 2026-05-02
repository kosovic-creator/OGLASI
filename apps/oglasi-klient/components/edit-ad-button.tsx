'use client'

import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import Link from 'next/link'

interface EditAdButtonProps {
  adId: string
}

export function EditAdButton({ adId }: EditAdButtonProps) {
  return (
    <Link href={`/oglasi/${adId}/edit`}>
      <Button variant="outline" size="sm" className="h-8 px-3 gap-1.5 font-medium">
        <Edit className="h-4 w-4" />
        Izmijeni
      </Button>
    </Link>
  )
}
