import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';

export async function GET() {
  try {
    await initDb();
    const db = getDbClient();
    const result = await db.execute('SELECT * FROM categories ORDER BY label ASC');
    const categories = result.rows.map((r: any) => ({
      id: String(r.id),
      label: String(r.label),
    }));
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: true, categories: [
      { id: 'macbook_m', label: 'M-Series' },
      { id: 'macbook_intel', label: 'Intel Macs' },
      { id: 'imac', label: 'iMac' },
      { id: 'mac_mini', label: 'Mac Mini' },
      { id: 'ipad', label: 'iPad' },
      { id: 'accessories', label: 'Accessories' },
    ]});
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, label } = body;
    if (!id || !label) {
      return NextResponse.json({ error: 'Category ID and label are required' }, { status: 400 });
    }

    await initDb();
    const db = getDbClient();
    const now = new Date().toISOString();

    await db.execute({
      sql: 'INSERT OR IGNORE INTO categories (id, label, createdAt) VALUES (?, ?, ?)',
      args: [id.toLowerCase().trim().replace(/\s+/g, '_'), label.trim(), now],
    });

    return NextResponse.json({ success: true, category: { id: id.toLowerCase().trim().replace(/\s+/g, '_'), label: label.trim() } });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
