'use client';

import Link from 'next/link';
import { Github, Mail, FileText } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-100 mt-auto border-t border-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Oglasi Admin Panel</h3>
            <p className="text-slate-300 text-sm">
              Admin panela za upravljanje oglasima, korisnicima i sistemom.
            </p>
          </div>

          {/* Admin Links */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">Admin Opcije</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/oglasi" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Svi Oglasi
                </Link>
              </li>
              <li>
                <Link href="/kontakti" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Kontakti
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Postavke
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Izveštaji
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">Podrška</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:admin@oglasi.rs" className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  admin@oglasi.rs
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Dokumentacija
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              © {currentYear} Oglasi.rs Admin. Sva prava zadržana.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                Politika Privatnosti
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                Uslovi Korišćenja
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
