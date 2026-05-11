import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Coarse, advisory gate. The cookie is forgeable; an attacker setting it
// manually would see a dashboard whose every API call returns 401, and the
// interceptor would log them right back out. Real auth lives in the backend
// + the API client interceptor (Project 10, deliverable F.4). Promote to
// HttpOnly server-validated session cookies via `runWithAmplifyServerContext`
// if/when the Nice-to-ship server-cookie item is taken.
export function middleware(req: NextRequest) {
  const signedIn = req.cookies.get('aj_signed_in')?.value;
  const { pathname } = req.nextUrl;

  // Root path → redirect based on auth state
  if (pathname === '/') {
    return NextResponse.redirect(new URL(signedIn ? '/agents' : '/landing', req.url));
  }

  // Signed-in user landing on auth pages → bounce to dashboard
  const isAuthPath = pathname === '/signin' || pathname.startsWith('/signup');
  if (isAuthPath && signedIn) {
    return NextResponse.redirect(new URL('/agents', req.url));
  }

  // Unauthenticated user accessing dashboard → redirect to signin
  const isDashboardPath = !isAuthPath && !isPublicPath(pathname);
  if (isDashboardPath && !signedIn) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  return NextResponse.next();
}

function isPublicPath(pathname: string): boolean {
  const publicPrefixes = ['/', '/landing', '/privacy', '/chat-page'];
  return publicPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'));
}

export const config = {
  matcher: [
    // Public
    '/',

    // Auth
    '/signin', '/signup',

    // Authenticated
    '/agents/:path*', '/tools/:path*', '/sres/:path*', '/contexts/:path*',
    '/documents/:path*', '/stages/:path*', '/integrations/:path*',
    '/agent-builder/:path*', '/tool-builder/:path*', '/sre-builder/:path*',
    '/json-document-builder/:path*', '/chat/:path*',
    '/api-keys/:path*', '/usage/:path*', '/profile/:path*', '/create-team/:path*',
    '/gmail/:path*', '/google-calendar/:path*', '/outlook/:path*',
  ],
};
