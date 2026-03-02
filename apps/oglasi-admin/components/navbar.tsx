'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Shield,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  Settings
} from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold hover:opacity-90 transition-opacity"
            >
              <div className="bg-white text-blue-600 rounded-lg p-1.5">
                <Shield className="h-5 w-5" />
              </div>
              <span>Oglasi Admin</span>
              <Badge variant="secondary" className="ml-2 bg-blue-800 text-white hover:bg-blue-800">
                Admin Panel
              </Badge>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/kontakti"
                className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                <Users className="h-4 w-4" />
                Kontakti
              </Link>
              <Link
                href="/oglasi"
                className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                <FileText className="h-4 w-4" />
                Oglasi
              </Link>
              <Link
                href="/postavke"
                className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                <Settings className="h-4 w-4" />
                Postavke
              </Link>
            </div>
          </div>

          {/* Right Side - User Menu & Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Desktop User Info */}
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-blue-600 text-sm font-semibold">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">
                        {user.name || 'Administrator'}
                      </p>
                      <p className="text-xs text-white/70">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    variant="secondary"
                    size="sm"
                    className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Odjava
                  </Button>
                </div>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden text-white hover:bg-white/20"
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
                    <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                      Registracija
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="sm" className="bg-white text-blue-600 hover:bg-white/90">
                      Prijava
                    </Button>
                  </Link>
                </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && user && (
          <div className="md:hidden border-t border-white/20 py-4 space-y-3">
            <Link
              href="/korisnici"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Korisnici</span>
            </Link>
            <Link
              href="/oglasi"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Oglasi</span>
            </Link>
            <Link
              href="/postavke"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Postavke</span>
            </Link>
            <div className="border-t border-white/20 pt-3 mt-3">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-blue-600 text-sm font-semibold">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.name || 'Administrator'}</p>
                  <p className="text-xs text-white/70">{user.email}</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: '/login' });
                }}
                variant="secondary"
                size="sm"
                className="w-full gap-2 bg-white/20 hover:bg-white/30 text-white"
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
