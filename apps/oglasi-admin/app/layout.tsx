import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';
import { RegisterPWA } from './register-pwa';
import { OfflineNotice } from './offline-notice';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

import { PWAMetaTags } from './pwa-meta-tags';

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Oglasi Admin',
  description: 'Admin aplikacija za oglase',
  manifest: '/manifest.webmanifest',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://oglasi-admin.vercel.app'),
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Admin',
  },
  applicationName: 'Oglasi Admin',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'sr_RS',
    url: '/',
    title: 'Oglasi Admin',
    description: 'Admin aplikacija za upravljanje oglasima',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <head>
        <PWAMetaTags />
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); }); }`}
        </Script>
      </head>
      <body className="flex flex-col min-h-screen">
        <Providers>
          <RegisterPWA />
          <OfflineNotice />
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
