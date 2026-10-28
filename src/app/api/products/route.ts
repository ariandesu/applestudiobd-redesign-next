import { NextResponse } from 'next/server';
import { getDbClient, initDb, formatPriceDisplay, calculateBudgetBracket } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import initialData from '@/data/data.json';

export async function GET() {
  try {
    await initDb();
    const db = getDbClient();
    const result = await db.execute(`
      SELECT * FROM products ORDER BY id ASC
    `);

    const products = result.rows.map((row: any) => ({
      id: Number(row.id),
      name: String(row.name),
      description: String(row.description || ''),
      price: String(row.price),
      numericPrice: Number(row.numericPrice),
      category: String(row.category),
      budgetBracket: String(row.budgetBracket),
      imageUrl: String(row.imageUrl),
      badge: row.badge ? String(row.badge) : null,
      batteryHealth: row.batteryHealth ? String(row.batteryHealth) : null,
      heartNote: row.heartNote ? String(row.heartNote) : null,
      inStock: Boolean(row.inStock),
      priceDisplay: String(row.priceDisplay),
      createdAt: row.createdAt ? String(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? String(row.updatedAt) : undefined,
    }));

    return NextResponse.json({
      success: true,
      products: products.length > 0 ? products : initialData.products,
    });
  } catch (error) {
    console.error('Error fetching products from db:', error);
    // Graceful fallback to static data if database has transient issue
    return NextResponse.json({
      success: true,
      products: initialData.products,
      fallback: true,
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin login required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description = '',
      price,
      category,
      imageUrl,
      badge = null,
      batteryHealth = null,
      heartNote = null,
      inStock = true,
    } = body;

    if (!name || !price || !category || !imageUrl) {
      return NextResponse.json(
        { error: 'Name, price, category, and imageUrl are required.' },
        { status: 400 }
      );
    }

    await initDb();
    const db = getDbClient();

    // Determine numericPrice
    const numericPrice = typeof body.numericPrice === 'number' && body.numericPrice > 0
      ? body.numericPrice
      : parseInt(String(price).replace(/\D/g, ''), 10) || 0;

    const budgetBracket = body.budgetBracket || calculateBudgetBracket(numericPrice);
    const priceDisplay = body.priceDisplay || formatPriceDisplay(price, numericPrice);

    // Get max id to generate next id
    const maxResult = await db.execute('SELECT MAX(id) as maxId FROM products');
    const nextId = (Number(maxResult.rows[0]?.maxId || 0)) + 1;
    const now = new Date().toISOString();

    await db.execute({
      sql: `
        INSERT INTO products (
          id, name, description, price, numericPrice, category, budgetBracket,
          imageUrl, badge, batteryHealth, heartNote, inStock, priceDisplay,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        nextId,
        name,
        description,
        String(price),
        numericPrice,
        category,
        budgetBracket,
        imageUrl,
        badge || null,
        batteryHealth || null,
        heartNote || null,
        inStock ? 1 : 0,
        priceDisplay,
        now,
        now,
      ],
    });

    const newProduct = {
      id: nextId,
      name,
      description,
      price: String(price),
      numericPrice,
      category,
      budgetBracket,
      imageUrl,
      badge: badge || null,
      batteryHealth: batteryHealth || null,
      heartNote: heartNote || null,
      inStock: Boolean(inStock),
      priceDisplay,
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
