'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Navbar() {
    const { data: session } = useSession();
  const user = session?.user;

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <Link href="/" className="text-xl font-bold text-blue-600">
            Oglasi
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-sm text-gray-600">
                {user.name || user.email}
              </div>
                          <Button
                              onClick={() => signOut({ callbackUrl: '/login' })}
                              variant="outline"
                              size="sm"
                          >
                              Odjava
                          </Button>
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
