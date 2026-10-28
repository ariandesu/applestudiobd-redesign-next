import { createClient, type Client } from '@libsql/client';
import initialData from '@/data/data.json';
import { type Product } from './constants';

let clientInstance: Client | null = null;

// In-memory fallback for serverless when SQLite local file cannot be written on Vercel ephemeral functions without Turso URL
let memProducts: any[] = [...initialData.products];
let memCategories: any[] = [
  { id: 'macbook_m', label: 'M-Series' },
  { id: 'macbook_intel', label: 'Intel Macs' },
  { id: 'imac', label: 'iMac' },
  { id: 'mac_mini', label: 'Mac Mini' },
  { id: 'ipad', label: 'iPad' },
  { id: 'accessories', label: 'Accessories' },
];
let memModerators: any[] = [];

export function getDbClient(): any {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    // Return mock client backed by memory / global store so Vercel serverless functions never crash on filesystem write locks
    return {
      async execute(query: any) {
        const sql = typeof query === 'string' ? query : query.sql;
        const args = typeof query === 'object' && query.args ? query.args : [];
        
        if (sql.includes('CREATE TABLE')) {
          return { rows: [] };
        }
        if (sql.includes('SELECT COUNT(*) as count FROM products')) {
          return { rows: [{ count: memProducts.length }] };
        }
        if (sql.includes('SELECT * FROM products')) {
          return { rows: memProducts };
        }
        if (sql.includes('INSERT INTO products')) {
          const p = {
            id: args[0],
            name: args[1],
            description: args[2],
            price: args[3],
            numericPrice: args[4],
            category: args[5],
            budgetBracket: args[6],
            imageUrl: args[7],
            badge: args[8],
            batteryHealth: args[9],
            heartNote: args[10],
            inStock: args[11] === 1,
            priceDisplay: args[12],
            createdAt: args[13],
            updatedAt: args[14],
          };
          memProducts.push(p);
          return { rowsAffected: 1 };
        }
        if (sql.includes('UPDATE products')) {
          const id = args[args.length - 1];
          const idx = memProducts.findIndex(p => p.id === id);
          if (idx !== -1) {
            memProducts[idx] = {
              ...memProducts[idx],
              name: args[0],
              description: args[1],
              price: args[2],
              numericPrice: args[3],
              category: args[4],
              budgetBracket: args[5],
              imageUrl: args[6],
              badge: args[7],
              batteryHealth: args[8],
              heartNote: args[9],
              inStock: args[10] === 1,
              priceDisplay: args[11],
              updatedAt: args[12],
            };
          }
          return { rowsAffected: 1 };
        }
        if (sql.includes('DELETE FROM products')) {
          const id = args[0];
          memProducts = memProducts.filter(p => p.id !== id);
          return { rowsAffected: 1 };
        }
        if (sql.includes('SELECT MAX(id)')) {
          const maxId = memProducts.reduce((m, p) => Math.max(m, p.id || 0), 0);
          return { rows: [{ maxId }] };
        }
        if (sql.includes('SELECT * FROM categories')) {
          return { rows: memCategories };
        }
        if (sql.includes('INSERT INTO categories')) {
          memCategories.push({ id: args[0], label: args[1], createdAt: args[2] });
          return { rowsAffected: 1 };
        }
        if (sql.includes('SELECT * FROM moderators')) {
          return { rows: memModerators };
        }
        if (sql.includes('SELECT * FROM moderators WHERE username')) {
          const mod = memModerators.find(m => m.username === args[0]);
          return { rows: mod ? [mod] : [] };
        }
        if (sql.includes('INSERT INTO moderators')) {
          const m = { id: memModerators.length + 1, username: args[0], passwordHash: args[1], createdAt: args[2] };
          memModerators.push(m);
          return { rowsAffected: 1 };
        }
        if (sql.includes('DELETE FROM moderators')) {
          const id = args[0];
          memModerators = memModerators.filter(m => m.id !== id);
          return { rowsAffected: 1 };
        }
        return { rows: [] };
      }
    };
  }

  if (clientInstance) return clientInstance;
  clientInstance = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return clientInstance;
}

export async function initDb(): Promise<void> {
  const db = getDbClient();
  try {
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
  } catch {}
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
