import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'apple-studio-bd-secure-admin-jwt-key-32-chars-min-2026'
);

export const COOKIE_NAME = 'admin_session';

export interface AdminSession {
  username: string;
  role: 'admin';
}

export async function signAdminToken(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role === 'admin' && typeof payload.username === 'string') {
      return {
        username: payload.username,
        role: 'admin',
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function verifyPassword(password: string): Promise<boolean> {
  const configuredPassword = process.env.ADMIN_PASSWORD || 'applestudio2026!';
  return password === configuredPassword;
}
