'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActivePath = (href: string) => {
    if (href === '/oglasi') {
      return pathname === '/oglasi';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <div className="bg-blue-600 text-white rounded-lg p-1.5">
                <Home className="h-5 w-5" />
              </div>
              Oglasi
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/nekretnine"
                className={cn(
                  'text-sm border-b-2 pb-1 transition-colors',
                  isActivePath('/nekretnine')
                    ? 'text-blue-600 border-blue-600 font-semibold'
                    : 'text-gray-700 border-transparent hover:text-blue-600 hover:border-blue-200 font-medium'
                )}
              >
                Nekretnine
              </Link>
              <Link
                href="/bijela-tehnika"
                className={cn(
                  'text-sm border-b-2 pb-1 transition-colors',
                  isActivePath('/bijela-tehnika')
                    ? 'text-blue-600 border-blue-600 font-semibold'
                    : 'text-gray-700 border-transparent hover:text-blue-600 hover:border-blue-200 font-medium'
                )}
              >
                Bijela tehnika
              </Link>
              <Link
                href="/auti"
                className={cn(
                  'text-sm border-b-2 pb-1 transition-colors',
                  isActivePath('/auti')
                    ? 'text-blue-600 border-blue-600 font-semibold'
                    : 'text-gray-700 border-transparent hover:text-blue-600 hover:border-blue-200 font-medium'
                )}
              >
                Auti
              </Link>
            </div>
          </div>

          {/* Right Side - User Menu & Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Desktop User Info */}
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 border">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || 'Korisnik'}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Odjava
                  </Button>
                </div>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </>
            ) : (
                <div className="flex items-center gap-2">
                  <Link href="/register" className="hidden sm:block">
                    <Button variant="ghost" size="sm">
                      Registracija
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      Prijava
                    </Button>
                  </Link>
                </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && user && (
          <div className="md:hidden border-t py-4 space-y-3">
            <Link
              href="/nekretnine"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActivePath('/nekretnine') ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="text-sm font-medium">Nekretnine</span>
            </Link>
            <Link
              href="/bijela-tehnika"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActivePath('/bijela-tehnika') ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="text-sm font-medium">Bijela tehnika</span>
            </Link>
            <Link
              href="/auti"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActivePath('/auti') ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="text-sm font-medium">Auti</span>
            </Link>
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium">{user.name || 'Korisnik'}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: '/login' });
                }}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <LogOut className="h-4 w-4" />
                Odjava
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
