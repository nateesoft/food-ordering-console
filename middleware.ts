import { NextRequest, NextResponse } from 'next/server';
import { SessionPayload } from '@/types';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];
const SECRET = process.env.JWT_SECRET || 'food-ordering-console-secret-key-2024';

function base64UrlDecode(str: string): Uint8Array<ArrayBuffer> {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function verifyJWT(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlDecode(signatureB64),
      encoder.encode(`${headerB64}.${payloadB64}`)
    );
    if (!isValid) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64)));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;

    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const token = req.cookies.get('fc_session')?.value;
  const session = token ? await verifyJWT(token) : null;

  // Redirect logged-in users away from auth pages
  if (isPublic && session) {
    const dest = req.nextUrl.clone();
    dest.pathname = session.role === 'system_admin' ? '/admin' : '/customer';
    return NextResponse.redirect(dest);
  }

  // Redirect unauthenticated users to login
  if (!isPublic && !session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // Role-based protection
  if (session) {
    if (pathname.startsWith('/admin') && session.role !== 'system_admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/customer';
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith('/customer') && session.role !== 'customer') {
      const url = req.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
