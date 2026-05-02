'use client'

import { deleteAd } from '@oglasi/server-actions/ads'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface DeleteAdButtonProps {
  adId: string
}

export function DeleteAdButton({ adId }: DeleteAdButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const handleDelete = async () => {
    if (!session?.user?.id) {
      alert('Morate biti prijavljeni da biste obrisali oglas')
      return
    }

    setIsLoading(true)
    try {
      await deleteAd(session.user.id, adId)
      setShowConfirm(false)
      router.refresh()
      router.push('/oglasi')
    } catch (error: any) {
      alert(error.message || 'Greška pri brisanju oglasa')
    } finally {
      setIsLoading(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          className="h-8 px-3 font-medium"
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? 'Brisanje...' : 'Obriši'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 font-medium"
          onClick={() => setShowConfirm(false)}
          disabled={isLoading}
        >
          Otkaži
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setShowConfirm(true)}
      className="h-8 px-3 gap-1.5 font-medium"
    >
      <Trash2 className="h-4 w-4" />
      Obriši
    </Button>
  )
}
