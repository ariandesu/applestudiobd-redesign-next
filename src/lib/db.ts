import { createClient, type Client } from '@libsql/client';
import initialData from '@/data/data.json';
import { type Product } from './constants';

let clientInstance: Client | null = null;

export function getDbClient(): Client {
  if (clientInstance) return clientInstance;

  // In production serverless (Vercel), if TURSO_DATABASE_URL is not set, fallback to a local in-memory/file or allow json fallback
  const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
  const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

  clientInstance = createClient({
    url,
    authToken,
  });

  return clientInstance;
}

let isInitialized = false;

export async function initDb(): Promise<void> {
  if (isInitialized) return;

  try {
    const db = getDbClient();

    // Create products table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price TEXT NOT NULL,
        numericPrice INTEGER NOT NULL,
        category TEXT NOT NULL,
        budgetBracket TEXT NOT NULL,
        imageUrl TEXT NOT NULL,
        badge TEXT,
        batteryHealth TEXT,
        heartNote TEXT,
        inStock INTEGER NOT NULL DEFAULT 1,
        priceDisplay TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Create admin users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);

    // Check if products exist; if not, seed with initialData
    const countResult = await db.execute('SELECT COUNT(*) as count FROM products');
    const count = Number(countResult.rows[0]?.count || 0);

    if (count === 0 && initialData.products && initialData.products.length > 0) {
      const now = new Date().toISOString();
      for (const p of initialData.products as Product[]) {
        await db.execute({
          sql: `
            INSERT INTO products (
              id, name, description, price, numericPrice, category, budgetBracket,
              imageUrl, badge, batteryHealth, heartNote, inStock, priceDisplay,
              createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            p.id,
            p.name,
            p.description || '',
            p.price,
            p.numericPrice || 0,
            p.category,
            p.budgetBracket || 'under_30k',
            p.imageUrl,
            p.badge || null,
            p.batteryHealth || null,
            p.heartNote || null,
            p.inStock !== false ? 1 : 0,
            p.priceDisplay || `৳ ${p.numericPrice?.toLocaleString() || p.price}`,
            now,
            now,
          ],
        });
      }
    }
  } catch (e) {
    console.warn('DB Init warning (read-only filesystem or missing credentials):', e);
  }

  isInitialized = true;
}

export function formatPriceDisplay(price: string | number, numericPrice?: number): string {
  if (typeof price === 'string' && price.includes('৳')) return price;
  const num = numericPrice || (typeof price === 'number' ? price : parseInt(String(price).replace(/\D/g, ''), 10));
  if (!isNaN(num) && num > 0) {
    return `৳ ${num.toLocaleString('en-IN')}`;
  }
  return `৳ ${price}`;
}

export function calculateBudgetBracket(numericPrice: number): string {
  if (numericPrice < 30000) return 'under_30k';
  if (numericPrice <= 50000) return '30_50k';
  if (numericPrice <= 90000) return '50_90k';
  if (numericPrice <= 130000) return '90_130k';
  return 'above_130k';
}
