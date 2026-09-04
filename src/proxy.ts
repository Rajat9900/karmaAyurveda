import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'admin_session';

interface SessionPayload {
  username: string;
  expires: number;
}

/**
 * Edge-compatible session validation using standard Web Crypto APIs.
 */
async function verifySessionEdge(token: string): Promise<SessionPayload | null> {
  const secret = process.env.SESSION_SECRET || 'karma_ayurveda_salt_1937';
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const base64Data = parts[0];
  const hmac = parts[1];

  try {
    // Decode base64 data
    const rawData = atob(base64Data);
    
    // Import key for HMAC SHA-256
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Compute expected HMAC
    const dataBuffer = encoder.encode(rawData);
    const signature = await crypto.subtle.sign('HMAC', key, dataBuffer);

    // Hex encode signature
    const hashArray = Array.from(new Uint8Array(signature));
    const expectedHmac = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hmac !== expectedHmac) {
      return null;
    }

    const payload = JSON.parse(rawData) as SessionPayload;
    if (Date.now() > payload.expires) {
      return null;
    }
    return payload;
  } catch (error) {
    console.error('Edge session verification failed:', error);
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const isValidSession = token ? (await verifySessionEdge(token)) !== null : false;

    if (!isValidSession) {
      // Redirect to login page
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Config to specify matching routes
export const config = {
  matcher: ['/admin/:path*'],
};
