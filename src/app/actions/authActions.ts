'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/dbSetup';

const SESSION_COOKIE_NAME = 'admin_session';

interface SessionPayload {
  username: string;
  expires: number;
}

/**
 * Sign a session payload using a secure HMAC SHA256 signature.
 */
function signSession(payload: SessionPayload): string {
  const secret = process.env.SESSION_SECRET || 'karma_ayurveda_salt_1937';
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return Buffer.from(data).toString('base64') + '.' + hmac;
}

/**
 * Verify a signed session token. Returns the payload or null if invalid/expired.
 */
function verifySession(token: string): SessionPayload | null {
  const secret = process.env.SESSION_SECRET || 'karma_ayurveda_salt_1937';
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const base64Data = parts[0];
  const hmac = parts[1];

  const data = Buffer.from(base64Data, 'base64').toString('utf-8');
  const expectedHmac = crypto.createHmac('sha256', secret).update(data).digest('hex');

  // Time-constant comparison to protect against timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expectedHmac, 'hex'))) {
    return null;
  }

  try {
    const payload = JSON.parse(data) as SessionPayload;
    if (Date.now() > payload.expires) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Authenticates an administrator and sets a secure cookie.
 */
export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { success: false, error: 'Username and password are required.' };
  }

  try {
    // 1. Fetch admin record
    const result = await query(
      'SELECT password_hash FROM admins WHERE username = ? LIMIT 1',
      [username]
    );

    if (result.length === 0) {
      return { success: false, error: 'Invalid username or password.' };
    }

    const dbHash = result[0].password_hash;
    const inputHash = hashPassword(password);

    // 2. Verify password
    if (dbHash !== inputHash) {
      return { success: false, error: 'Invalid username or password.' };
    }

    // 3. Create session (valid for 1 day)
    const expires = Date.now() + 24 * 60 * 60 * 1000;
    const payload: SessionPayload = { username, expires };
    const sessionToken = signSession(payload);

    // 4. Set secure cookie (Next 16 requires awaiting cookies())
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 1 day in seconds
      path: '/'
    });

    return { success: true };
  } catch (error) {
    console.error('Login action error:', error);
    return { success: false, error: 'An unexpected database error occurred.' };
  }
}

/**
 * Logs out the admin by deleting the session cookie.
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return { success: true };
}

/**
 * Verifies if the admin session cookie is valid.
 */
export async function checkAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return false;

    const payload = verifySession(token);
    return payload !== null;
  } catch {
    return false;
  }
}
