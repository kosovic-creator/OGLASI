import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

export default withAuth(
  function middleware(request: NextRequest) {
    const token = request.nextauth.token;

    // Ako nema admin uloge, preusmerite na login
    if (token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token && token.role === 'ADMIN',
    },
  }
);

export const config = {
  matcher: ['/((?!api/auth|login|register|_next/static|_next/image|favicon.ico).*)'],
};
