import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@oglasi/auth';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home as HomeIcon, Zap, Car } from 'lucide-react';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;

  const categories = [
    {
      id: 'nekretnine',
      title: 'Nekretnine',
      description: 'Kuće, stanovi, poslovni prostori',
      icon: HomeIcon,
      href: '/oglasi/nekretnine',
      color: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      id: 'bijela-tehnika',
      title: 'Bijela Tehnika',
      description: 'Frižideri, pećnice, perilice...',
      icon: Zap,
      href: '/oglasi/bijela-tehnika',
      color: 'bg-gray-50 dark:bg-gray-950',
    },
    {
      id: 'auti',
      title: 'Automobili',
      description: 'Vozila, automobili, motocikli',
      icon: Car,
      href: '/oglasi/auti',
      color: 'bg-orange-50 dark:bg-orange-950',
    },
  ];

  return (
    <main className="min-h-screen">
      <div className="container mx-auto py-12 px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Dobrodošli, {user.name || user.email}!</h1>
          <p className="text-lg text-muted-foreground">Pregledajte oglase po kategorijama</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link key={category.id} href={category.href}>
                <Card className={`h-full cursor-pointer hover:shadow-lg transition-shadow ${category.color}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle>{category.title}</CardTitle>
                      <IconComponent className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Pogledaj oglase</Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* <Card>
          <CardHeader>
            <CardTitle>Vaš profil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="mb-2">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="mb-2">
                <strong>Ime:</strong> {user.name || 'N/A'}
              </p>
              <p className="mb-2">
                <strong>Rola:</strong> {user.role}
              </p>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </main>
  );
}
