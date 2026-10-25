import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';

export async function POST(req: NextRequest) {
  try {
    await ensureDbReady();

    // Validasi sesi admin
    const token = req.cookies.get('sepia_admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionRes = await client.execute({
      sql: 'SELECT * FROM admin_sessions WHERE token = ? AND expires_at > ? LIMIT 1',
      args: [token, Date.now()],
    });

    if (sessionRes.rows.length === 0) {
      return NextResponse.json({ error: 'Sesi telah kedaluwarsa' }, { status: 401 });
    }

    const body = await req.json();
    const { name, categoryId, description, imageUrl, badge, variants } = body;

    if (!name || !categoryId || !description) {
      return NextResponse.json(
        { error: 'Nama produk, kategori, dan deskripsi wajib diisi' },
        { status: 400 }
      );
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: 'Minimal harus ada 1 varian paket langganan' },
        { status: 400 }
      );
    }

    // Buat slug
    const cleanSlugBase = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const randSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${cleanSlugBase}-${randSuffix}`;

    const productId = `prod-${Math.random().toString(36).substring(2, 9)}`;
    const now = Date.now();

    const finalImage =
      imageUrl && imageUrl.trim().startsWith('http')
        ? imageUrl.trim()
        : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80';

    // 1. Insert Produk
    await client.execute({
      sql: `INSERT INTO products (
              id, category_id, name, slug, description, image_url, badge, is_active, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      args: [
        productId,
        categoryId,
        name.trim(),
        slug,
        description.trim(),
        finalImage,
        badge?.trim() || null,
        now,
      ],
    });

    // 2. Insert Varian
    for (const v of variants) {
      if (!v.name || !v.price) continue;

      const variantId = `var-${Math.random().toString(36).substring(2, 9)}`;
      const price = Math.max(1000, Number(v.price));
      const originalPrice = v.originalPrice ? Number(v.originalPrice) : Math.round(price * 1.4);
      const durationDays = Number(v.durationDays) || 30;

      await client.execute({
        sql: `INSERT INTO product_variants (
                id, product_id, name, duration_days, price, original_price, description
              ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          variantId,
          productId,
          String(v.name).trim(),
          durationDays,
          price,
          originalPrice,
          v.description?.trim() || null,
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: `Produk "${name}" dan varian berhasil ditambahkan ke toko!`,
      productId,
    });
  } catch (err: any) {
    console.error('Error creating product:', err.message);
    return NextResponse.json(
      { error: err.message || 'Gagal menambahkan produk baru' },
      { status: 500 }
    );
  }
}
