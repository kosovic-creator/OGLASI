/* This component ensures that PWA meta tags are present in the HTML head.
   It's a safety fallback in case Next.js metadata API doesn't generate them. */

export function PWAMetaTags() {
  return (
    <>
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Admin" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#0f172a" />
      <meta name="color-scheme" content="dark light" />
      <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.webmanifest" />
    </>
  );
}
