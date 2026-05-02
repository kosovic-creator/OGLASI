import { getAdContacts } from '@oglasi/server-actions/contacts'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@oglasi/auth'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'

export default async function ContactsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const contacts = await getAdContacts(session!.user!.id)

  return (
    <div>
      <h1>Kontakti za vaše oglase</h1>
      <div className="space-y-4">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <div>
              <h3>{contact.name}</h3>
              <p>Email: {contact.email}</p>
              {contact.phone && <p>Telefon: {contact.phone}</p>}
              <p>Za oglas: {contact.ad.title}</p>
              <p className="whitespace-pre-wrap">{contact.message}</p>
              <p>Status: {contact.replied ? '✓ Odgovoren' : 'Čeka odgovor'}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}