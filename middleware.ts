import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const token = req.cookies.get('fc_session')?.value;
  const session = token ? verifyToken(token) : null;

  // Redirect logged-in users away from auth pages
  if (isPublic && session) {
    const dest = session.role === 'system_admin' ? '/admin' : '/customer';
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Redirect unauthenticated users to login
  if (!isPublic && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Role-based protection
  if (session) {
    if (pathname.startsWith('/admin') && session.role !== 'system_admin') {
      return NextResponse.redirect(new URL('/customer', req.url));
    }
    if (pathname.startsWith('/customer') && session.role !== 'customer') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
