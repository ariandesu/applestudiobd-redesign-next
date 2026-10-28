import { NextResponse } from 'next/server';
import { signAdminToken, verifyPassword, COOKIE_NAME, initAdminTables } from '@/lib/auth';
import { getDbClient } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username = 'admin', password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    await initAdminTables();

    // If master admin
    if (username === 'admin') {
      const isValid = await verifyPassword(password);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }

      const token = await signAdminToken({
        username: 'admin',
        role: 'admin',
      });

      const response = NextResponse.json({
        success: true,
        user: { username: 'admin', role: 'admin' },
      });

      response.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // Moderator login (direct password verification without 2FA)
    const db = getDbClient();
    const modResult = await db.execute({
      sql: 'SELECT * FROM moderators WHERE username = ?',
      args: [username],
    });

    if (modResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const mod = modResult.rows[0];
    if (mod.passwordHash !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = await signAdminToken({
      username: String(mod.username),
      role: 'moderator',
    });

    const response = NextResponse.json({
      success: true,
      user: { username: String(mod.username), role: 'moderator' },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
