import { getServerSession } from 'next-auth';
import { authOptions } from '@oglasi/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export async function Navbar() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <Link href="/" className="text-xl font-bold text-blue-600">
            Oglasi Admin
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-sm text-gray-600">
                {user.name || user.email}
              </div>
              <form action="/api/auth/signout" method="POST">
                <Button type="submit" variant="outline" size="sm">
                  Odjava
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">
                Prijava
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
