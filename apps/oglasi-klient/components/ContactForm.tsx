'use client'

import { createContact } from '@oglasi/server-actions/contacts'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createContactSchema, type CreateContactInput } from '@oglasi/validation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

export function ContactForm({ adId }: { adId: string }) {
  const { data: session } = useSession()
  const isAuthenticated = Boolean(session?.user?.id)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateContactInput>({
    resolver: zodResolver(createContactSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    shouldFocusError: true,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  })

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    setValue('name', session?.user?.name ?? '')
    setValue('email', session?.user?.email ?? '')
  }, [isAuthenticated, session?.user?.name, session?.user?.email, setValue])

  async function onSubmit(data: CreateContactInput) {
    setLoading(true)
    setError('')

    try {
      await createContact(adId, session?.user?.id || null, data)

      setSubmitted(true)
    } catch (submitError) {
      setError('Došlo je do greške prilikom slanja upita. Molimo pokušajte ponovo.')
      console.error('Greška:', submitError)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Alert>
        Hvala! Tvoji kontakt detalji su poslati vlasniku oglasa.
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="space-y-2">
        <Label htmlFor="name">Ime</Label>
        <Input
          id="name"
          placeholder="Unesite ime"
          {...register('name')}
          readOnly={isAuthenticated}
          className={isAuthenticated ? 'bg-muted' : undefined}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Unesite email"
          {...register('email')}
          readOnly={isAuthenticated}
          className={isAuthenticated ? 'bg-muted' : undefined}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {isAuthenticated && (
        <p className="text-xs text-muted-foreground">
          Ime i email su preuzeti iz tvog profila.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          placeholder="Unesite telefon (opciono)"
          {...register('phone')}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {errors.phone && (
          <p id="phone-error" className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Poruka</Label>
        <textarea
          id="message"
          placeholder="Napišite poruku"
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register('message')}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <p id="message-error" className="text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Slanje...' : 'Pošalji upit'}
      </Button>
    </form>
  )
}