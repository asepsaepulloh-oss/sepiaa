import { NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';

export async function GET() {
  try {
    await ensureDbReady();

    // 1. Ambil kategori
    const catRes = await client.execute('SELECT * FROM categories ORDER BY sort_order ASC');
    const categories = catRes.rows.map((r: any) => ({
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
      icon: String(r.icon),
    }));

    // 2. Ambil produk aktif
    const prodRes = await client.execute(
      'SELECT * FROM products WHERE is_active = 1 ORDER BY created_at ASC'
    );

    // 3. Ambil varian
    const varRes = await client.execute('SELECT * FROM product_variants ORDER BY price ASC');

    // 4. Hitung stok yang belum terjual per variant_id
    const stockRes = await client.execute(
      'SELECT variant_id, COUNT(*) as stock_count FROM product_stocks WHERE is_sold = 0 GROUP BY variant_id'
    );

    const stockMap = new Map<string, number>();
    for (const r of stockRes.rows) {
      stockMap.set(String(r.variant_id), Number(r.stock_count));
    }

    // Gabungkan data
    const variantsByProd = new Map<string, any[]>();
    for (const v of varRes.rows) {
      const pId = String(v.product_id);
      const varId = String(v.id);
      const currentList = variantsByProd.get(pId) || [];
      currentList.push({
        id: varId,
        productId: pId,
        name: String(v.name),
        durationDays: Number(v.duration_days),
        price: Number(v.price),
        originalPrice: Number(v.original_price),
        description: v.description ? String(v.description) : null,
        stockCount: stockMap.get(varId) || 0,
      });
      variantsByProd.set(pId, currentList);
    }

    const products = prodRes.rows.map((p: any) => {
      const pId = String(p.id);
      const vars = variantsByProd.get(pId) || [];
      const minPrice = vars.length > 0 ? Math.min(...vars.map((v) => v.price)) : 0;
      const totalStock = vars.reduce((acc, curr) => acc + curr.stockCount, 0);

      return {
        id: pId,
        categoryId: String(p.category_id),
        name: String(p.name),
        slug: String(p.slug),
        description: String(p.description),
        imageUrl: String(p.imageUrl || p.image_url),
        badge: p.badge ? String(p.badge) : null,
        minPrice,
        totalStock,
        variants: vars,
      };
    });

    return NextResponse.json({
      success: true,
      categories,
      products,
    });
  } catch (err: any) {
    console.error('Products API error:', err.message);
    return NextResponse.json(
      { error: err.message || 'Gagal mengambil data produk' },
      { status: 500 }
    );
  }
}
