import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ['/((?!api/auth|login|register|offline|_next/static|_next/image|favicon.ico|sw.js|sww|manifest.webmanifest|workbox-|apple-touch-icon).*)'],
};
