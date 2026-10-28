import { NextResponse } from 'next/server';
import { initAdminTables } from '@/lib/auth';
import { getDbClient } from '@/lib/db';

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
    const { action, username, password } = body;

    const db = getDbClient();

    if (action === 'register_moderator') {
      if (!username || !password) {
        return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
      }

      const now = new Date().toISOString();

      try {
        await db.execute({
          sql: 'INSERT INTO moderators (username, passwordHash, createdAt) VALUES (?, ?, ?)',
          args: [username.trim(), password, now],
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
      });
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
