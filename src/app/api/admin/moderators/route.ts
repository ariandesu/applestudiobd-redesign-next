import { NextResponse } from 'next/server';
import { getDbClient, initAdminTables, generateTotpSecret, verifyTotpToken, signAdminToken, verifyPassword, COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  try {
    await initAdminTables();
    const db = getDbClient();
    const result = await db.execute('SELECT id, username, createdAt FROM moderators ORDER BY id DESC');
    const moderators = result.rows.map(r => ({
      id: Number(r.id),
      username: String(r.username),
      createdAt: String(r.createdAt),
    }));
    return NextResponse.json({ success: true, moderators });
  } catch (error) {
    console.error('Error fetching moderators:', error);
    return NextResponse.json({ error: 'Failed to fetch moderators' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initAdminTables();
    const body = await request.json();
    const { action, username, password, totpCode } = body;

    const db = getDbClient();

    if (action === 'register_moderator') {
      if (!username || !password) {
        return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
      }

      // Generate TOTP secret for this moderator
      const { secret, uri } = generateTotpSecret();
      const now = new Date().toISOString();

      try {
        await db.execute({
          sql: 'INSERT INTO moderators (username, passwordHash, totpSecret, createdAt) VALUES (?, ?, ?, ?)',
          args: [username.trim(), password, secret, now],
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('UNIQUE')) {
          return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
        }
        throw err;
      }

      return NextResponse.json({
        success: true,
        message: 'Moderator created successfully',
        totpSecret: secret,
        totpUri: uri,
      });
    }

    if (action === 'verify_2fa_login') {
      if (!username || !password || !totpCode) {
        return NextResponse.json({ error: 'Username, password, and 2FA code required' }, { status: 400 });
      }

      // Check primary master admin first
      if (username === 'admin') {
        const isValid = await verifyPassword(password);
        if (!isValid) {
          return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        const token = await signAdminToken({ username: 'admin', role: 'admin' });
        const res = NextResponse.json({ success: true, user: { username: 'admin', role: 'admin' } });
        res.cookies.set({
          name: COOKIE_NAME,
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
        return res;
      }

      // Check moderator table
      const modResult = await db.execute({
        sql: 'SELECT * FROM moderators WHERE username = ?',
        args: [username.trim()],
      });

      if (modResult.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const mod = modResult.rows[0];
      if (mod.passwordHash !== password) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }

      const isValidTotp = verifyTotpToken(String(mod.totpSecret), totpCode);
      if (!isValidTotp) {
        return NextResponse.json({ error: 'Invalid Google Authenticator 2FA code' }, { status: 401 });
      }

      const token = await signAdminToken({ username: String(mod.username), role: 'moderator' });
      const res = NextResponse.json({ success: true, user: { username: String(mod.username), role: 'moderator' } });
      res.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Moderator auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await initAdminTables();
    const db = getDbClient();
    await db.execute({
      sql: 'DELETE FROM moderators WHERE id = ?',
      args: [Number(id)],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting moderator:', error);
    return NextResponse.json({ error: 'Failed to delete moderator' }, { status: 500 });
  }
}
