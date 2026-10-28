import { NextResponse } from 'next/server';
import { getDbClient, initDb, formatPriceDisplay, calculateBudgetBracket } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin login required' }, { status: 401 });
    }

    const params = await context.params;
    const productId = Number(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await request.json();
    await initDb();
    const db = getDbClient();

    // Check existing
    const existing = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [productId],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const current = existing.rows[0];

    const name = body.name ?? current.name;
    const description = body.description ?? current.description;
    const price = body.price ?? current.price;
    const numericPrice = typeof body.numericPrice === 'number'
      ? body.numericPrice
      : (body.price ? parseInt(String(body.price).replace(/\D/g, ''), 10) || 0 : Number(current.numericPrice));
    const category = body.category ?? current.category;
    const budgetBracket = body.budgetBracket || calculateBudgetBracket(numericPrice);
    const imageUrl = body.imageUrl ?? current.imageUrl;
    const badge = body.badge !== undefined ? body.badge : current.badge;
    const batteryHealth = body.batteryHealth !== undefined ? body.batteryHealth : current.batteryHealth;
    const heartNote = body.heartNote !== undefined ? body.heartNote : current.heartNote;
    const inStock = body.inStock !== undefined ? (body.inStock ? 1 : 0) : current.inStock;
    const priceDisplay = body.priceDisplay || formatPriceDisplay(price, numericPrice);
    const updatedAt = new Date().toISOString();

    await db.execute({
      sql: `
        UPDATE products SET
          name = ?,
          description = ?,
          price = ?,
          numericPrice = ?,
          category = ?,
          budgetBracket = ?,
          imageUrl = ?,
          badge = ?,
          batteryHealth = ?,
          heartNote = ?,
          inStock = ?,
          priceDisplay = ?,
          updatedAt = ?
        WHERE id = ?
      `,
      args: [
        name,
        description,
        String(price),
        numericPrice,
        category,
        budgetBracket,
        imageUrl,
        badge,
        batteryHealth,
        heartNote,
        inStock,
        priceDisplay,
        updatedAt,
        productId,
      ],
    });

    return NextResponse.json({
      success: true,
      product: {
        id: productId,
        name,
        description,
        price: String(price),
        numericPrice,
        category,
        budgetBracket,
        imageUrl,
        badge,
        batteryHealth,
        heartNote,
        inStock: Boolean(inStock),
        priceDisplay,
        updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin login required' }, { status: 401 });
    }

    const params = await context.params;
    const productId = Number(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    await initDb();
    const db = getDbClient();

    const result = await db.execute({
      sql: 'DELETE FROM products WHERE id = ?',
      args: [productId],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: productId });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
