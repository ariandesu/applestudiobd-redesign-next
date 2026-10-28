import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getDbClient, initDb } from './db';
import * as OTPAuth from 'otpauth';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'apple-studio-bd-secure-admin-jwt-key-32-chars-min-2026'
);

export const COOKIE_NAME = 'admin_session';

export interface AdminSession {
  username: string;
  role: 'admin' | 'moderator';
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
    if ((payload.role === 'admin' || payload.role === 'moderator') && typeof payload.username === 'string') {
      return {
        username: payload.username,
        role: payload.role as 'admin' | 'moderator',
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

export async function initAdminTables(): Promise<void> {
  await initDb();
  const db = getDbClient();
  
  // Table for custom categories
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  // Table for moderator accounts
  await db.execute(`
    CREATE TABLE IF NOT EXISTS moderators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      totpSecret TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  // Seed default categories if empty
  const catCheck = await db.execute('SELECT COUNT(*) as count FROM categories');
  if (Number(catCheck.rows[0]?.count || 0) === 0) {
    const defaultCats = [
      { id: 'macbook_m', label: 'M-Series' },
      { id: 'macbook_intel', label: 'Intel Macs' },
      { id: 'imac', label: 'iMac' },
      { id: 'mac_mini', label: 'Mac Mini' },
      { id: 'ipad', label: 'iPad' },
      { id: 'accessories', label: 'Accessories' },
    ];
    const now = new Date().toISOString();
    for (const c of defaultCats) {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO categories (id, label, createdAt) VALUES (?, ?, ?)',
        args: [c.id, c.label, now],
      });
    }
  }
}

export function generateTotpSecret(): { secret: string; uri: string } {
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({
    issuer: 'AppleStudioBD',
    label: 'AdminPortal',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  });
  return {
    secret: secret.base32,
    uri: totp.toString(),
  };
}

export function verifyTotpToken(secret: string, token: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: 'AppleStudioBD',
      label: 'AdminPortal',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  } catch {
    return false;
  }
}
