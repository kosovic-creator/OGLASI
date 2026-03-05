'use client';

import Link from 'next/link';
import { Github, Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-100">
      {/* Main Footer Section */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* About Section */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Oglasi.me</h3>
              <p className="text-slate-300 text-sm mb-4">
                Vodeća platforma za kupovinu i prodaju automobila, nekretnina i bele tehnike u Crnoj Gori.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-base font-semibold text-white mb-4">Brzi Linkovi</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/oglasi" className="text-slate-300 hover:text-white transition-colors text-sm">
                    Svi Oglasi
                  </Link>
                </li>
                <li>
                  <Link href="/oglasi/auti" className="text-slate-300 hover:text-white transition-colors text-sm">
                    Automobili
                  </Link>
                </li>
                <li>
                  <Link href="/oglasi/nekretnine" className="text-slate-300 hover:text-white transition-colors text-sm">
                    Nekretnine
                  </Link>
                </li>
                <li>
                  <Link href="/oglasi/bijela-tehnika" className="text-slate-300 hover:text-white transition-colors text-sm">
                    Bela Tehnika
                  </Link>
                </li>
                <li>
                  <Link href="/kontakti" className="text-slate-300 hover:text-white transition-colors text-sm">
                    Kontakt
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-base font-semibold text-white mb-4">Resursi</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                    Uputstvo za Korišćenje
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                    Sigurnost
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                    Politika Privatnosti
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                    Uslovi Korišćenja
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-base font-semibold text-white mb-4">Newsletter</h4>
              <p className="text-slate-300 text-sm mb-4">
                Prijavite se na našu listu za najnovije oglase i vesti.
              </p>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <Input
                  type="email"
                  placeholder="Vaša email adresa"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={subscribed}
                >
                  {subscribed ? '✓ Podaci primljeni' : 'Prijavi se'}
                </Button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t border-slate-800 pt-8 mt-8">
            <h4 className="text-base font-semibold text-white mb-4">Kontakt Informacije</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-400">Telefonski Broj</p>
                  <a href="tel:+38267135355" className="text-white hover:text-blue-400 transition-colors">
                    +382 (67) 135-355
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-400">Email Adresa</p>
                  <a href="mailto:drasko.kosovic@icloud.com" className="text-white hover:text-blue-400 transition-colors">
                    drasko.kosovic@icloud.com
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-400">Adresa</p>
                  <p className="text-white">Podgorica, Crna Gora</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-slate-950 border-t border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              © {currentYear} Drasko Kosovic. Sva prava zadržana.
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                Politika Privatnosti
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                Uslovi Korišćenja
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
