import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@oglasi/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function AdminHome() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;

  if (user.role !== 'ADMIN') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Pristup odbijen</CardTitle>
            <CardDescription>
              Nemate administratorske privilegije za pristup ovoj sekciji.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dobrodošli u Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upravljajte vašom platformom sa jednostavnim i intuitivnim interfejsom.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informacije o nalogu</CardTitle>
            <CardDescription>Vaši detalji administratora</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Email adresa</p>
              <p className="text-lg font-medium">{user.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Ime</p>
              <p className="text-lg font-medium">{user.name || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Rola</p>
              <div className="flex items-center gap-2">
                <Badge variant="default">{user.role}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
