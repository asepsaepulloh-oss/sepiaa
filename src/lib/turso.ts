import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

export const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });

/**
 * Otomatis memastikan tabel terbuat dan mengisi seed data awal
 * jika database masih kosong.
 */
let isInitialized = false;

export async function ensureDbReady() {
  if (isInitialized) return;

  try {
    // 1. Buat tabel jika belum ada
    await client.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        badge TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        name TEXT NOT NULL,
        duration_days INTEGER NOT NULL DEFAULT 30,
        price INTEGER NOT NULL,
        original_price INTEGER NOT NULL,
        description TEXT
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS product_stocks (
        id TEXT PRIMARY KEY,
        variant_id TEXT NOT NULL,
        account_data TEXT NOT NULL,
        is_sold INTEGER NOT NULL DEFAULT 0,
        order_id TEXT,
        sold_at INTEGER,
        created_at INTEGER NOT NULL
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL UNIQUE,
        product_id TEXT NOT NULL,
        variant_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        variant_name TEXT NOT NULL,
        amount INTEGER NOT NULL,
        fee INTEGER NOT NULL DEFAULT 0,
        total_payment INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        customer_whatsapp TEXT NOT NULL,
        customer_email TEXT,
        payment_method TEXT NOT NULL DEFAULT 'qris',
        payment_number TEXT,
        txn_id TEXT,
        qr_string TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        account_delivered TEXT,
        expired_at INTEGER,
        created_at INTEGER NOT NULL,
        completed_at INTEGER
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        token TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        expires_at INTEGER NOT NULL
      );
    `);

    // Tambah kolom txn_id jika database lama belum memilikinya
    try {
      await client.execute('ALTER TABLE orders ADD COLUMN txn_id TEXT;');
    } catch {
      // Abaikan jika kolom sudah ada
    }

    // 2. Cek apakah kategori sudah ada
    const existingCat = await client.execute('SELECT COUNT(*) as count FROM categories');
    const catCount = Number(existingCat.rows[0]?.count || 0);

    if (catCount === 0) {
      // Seed Kategori
      const seedCategories = [
        { id: 'cat-streaming', name: 'Streaming', slug: 'streaming', icon: 'Tv', sortOrder: 1 },
        { id: 'cat-music', name: 'Musik & Audio', slug: 'music', icon: 'Music', sortOrder: 2 },
        { id: 'cat-design', name: 'Desain & Kreatif', slug: 'design', icon: 'Palette', sortOrder: 3 },
        { id: 'cat-ai', name: 'AI & Produktivitas', slug: 'ai', icon: 'Sparkles', sortOrder: 4 },
        { id: 'cat-vpn', name: 'VPN & Security', slug: 'vpn', icon: 'Shield', sortOrder: 5 },
      ];

      for (const cat of seedCategories) {
        await client.execute({
          sql: 'INSERT INTO categories (id, name, slug, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
          args: [cat.id, cat.name, cat.slug, cat.icon, cat.sortOrder],
        });
      }

      // Seed Produk & Varian
      const now = Date.now();

      const seedProducts = [
        {
          id: 'prod-netflix',
          categoryId: 'cat-streaming',
          name: 'Netflix Premium 4K UHD',
          slug: 'netflix-premium',
          description: 'Nonton film & serial TV tanpa batas resolusi 4K Ultra HD. Akun legal, garansi full sesuai masa aktif.',
          imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80',
          badge: 'TERLARIS',
          variants: [
            {
              id: 'var-netflix-1m-sharing',
              name: '1 Bulan (1 Profil Sharing)',
              duration: 30,
              price: 28000,
              originalPrice: 45000,
              desc: '1 Profil khusus 1 user, bebas pin/kunci profil, anti screen limit.',
              stocks: [
                'Email: netflix.user1@gmail.com | Pass: SepiaNet#2026 | Profil: 2 (PIN: 1234)',
                'Email: netflix.user2@gmail.com | Pass: SepiaNet#2026 | Profil: 3 (PIN: 8899)',
              ],
            },
            {
              id: 'var-netflix-1m-private',
              name: '1 Bulan (Akun Private 4 Screen)',
              duration: 30,
              price: 135000,
              originalPrice: 186000,
              desc: 'Akun private full 5 profil milik sendiri, bisa invite email pribadi.',
              stocks: [
                'Email: netflix.private1@sepia.id | Pass: PrivateSepia#99 | Note: Private 5 Profile Bebas Pakai',
              ],
            },
          ],
        },
        {
          id: 'prod-spotify',
          categoryId: 'cat-music',
          name: 'Spotify Premium Individual',
          slug: 'spotify-premium',
          description: 'Streaming lagu bebas iklan kualitas sangat tinggi (320kbps), download offline, skip lagu unlimited.',
          imageUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=600&auto=format&fit=crop&q=80',
          badge: 'HOT',
          variants: [
            {
              id: 'var-spotify-1m-plan',
              name: '1 Bulan Family Head / Invite',
              duration: 30,
              price: 15000,
              originalPrice: 30000,
              desc: 'Plan upgrade akun pribadi Anda atau akun baru siap pakai.',
              stocks: [
                'Link Invite: https://spotify.com/family/join/sepia-token-abc123 | Alamat: Jl. Sudirman No 45 Jakarta',
                'Email: spotify.user9@gmail.com | Pass: SpotSepia#88 | Plan: Individual 1 Bulan',
              ],
            },
            {
              id: 'var-spotify-3m-plan',
              name: '3 Bulan Plan Hemat',
              duration: 90,
              price: 39000,
              originalPrice: 85000,
              desc: 'Langsung aktif 90 hari tanpa gonta-ganti akun.',
              stocks: [
                'Email: spot.3m.sepia@gmail.com | Pass: PremiumSepia#33 | Masa Aktif 3 Bulan',
              ],
            },
          ],
        },
        {
          id: 'prod-youtube',
          categoryId: 'cat-streaming',
          name: 'YouTube Premium + YouTube Music',
          slug: 'youtube-premium',
          description: 'Bebas iklan di semua video, pemutaran latar belakang di HP, dan akses YouTube Music Premium.',
          imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
          badge: 'INSTANT',
          variants: [
            {
              id: 'var-youtube-1m-invite',
              name: '1 Bulan (Invite Email Pribadi)',
              duration: 30,
              price: 12000,
              originalPrice: 25000,
              desc: 'Link undangan Google Family langsung masuk ke email Gmail Anda.',
              stocks: [
                'Link Undangan Family: https://families.google.com/join/sepia-yt-inv-781',
                'Link Undangan Family: https://families.google.com/join/sepia-yt-inv-782',
              ],
            },
          ],
        },
        {
          id: 'prod-canva',
          categoryId: 'cat-design',
          name: 'Canva Pro Edu / Team Lifetime',
          slug: 'canva-pro',
          description: 'Akses 100 juta+ template premium, font, elemen grafis, magic resize, dan background remover instan.',
          imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80',
          badge: 'FAVORIT',
          variants: [
            {
              id: 'var-canva-1y-invite',
              name: '1 Tahun Akses Pro Tim',
              duration: 365,
              price: 25000,
              originalPrice: 75000,
              desc: 'Undangan invite tim ke email pribadi Canva Anda, desain aman tersimpan.',
              stocks: [
                'Link Invite Tim Canva: https://www.canva.com/brand/join?token=sepia-pro-team-access',
              ],
            },
          ],
        },
        {
          id: 'prod-chatgpt',
          categoryId: 'cat-ai',
          name: 'ChatGPT Plus (GPT-4o & Canvas)',
          slug: 'chatgpt-plus',
          description: 'Akses prioritas GPT-4o, kemampuan coding Canvas, DALL-E 3 image generation, analisis dokumen mendalam.',
          imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80',
          badge: 'PRO',
          variants: [
            {
              id: 'var-chatgpt-1m-shared',
              name: '1 Bulan Akun Sharing Bersih',
              duration: 30,
              price: 49000,
              originalPrice: 110000,
              desc: 'Maksimal 2 user per akun, history tersimpan rapi, garansi 30 hari.',
              stocks: [
                'Email: chatgpt.user@sepia.org | Pass: OpenAISepia#2026 | Note: Jangan ubah password',
              ],
            },
          ],
        },
      ];

      for (const prod of seedProducts) {
        await client.execute({
          sql: `INSERT INTO products (id, category_id, name, slug, description, image_url, badge, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
          args: [prod.id, prod.categoryId, prod.name, prod.slug, prod.description, prod.imageUrl, prod.badge, now],
        });

        for (const v of prod.variants) {
          await client.execute({
            sql: `INSERT INTO product_variants (id, product_id, name, duration_days, price, original_price, description)
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [v.id, prod.id, v.name, v.duration, v.price, v.originalPrice, v.desc],
          });

          for (const s of v.stocks) {
            const stockId = `stk-${Math.random().toString(36).substring(2, 9)}`;
            await client.execute({
              sql: `INSERT INTO product_stocks (id, variant_id, account_data, is_sold, created_at)
                    VALUES (?, ?, ?, 0, ?)`,
              args: [stockId, v.id, s, now],
            });
          }
        }
      }
    }

    isInitialized = true;
  } catch (err: any) {
    console.error('Database initialization error:', err.message);
  }
}
