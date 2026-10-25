import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';

export async function POST(req: NextRequest) {
  try {
    await ensureDbReady();

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
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID wajib disertakan' }, { status: 400 });
    }

    // Hapus produk dan varian serta stok terkait
    await client.execute({
      sql: 'DELETE FROM product_stocks WHERE variant_id IN (SELECT id FROM product_variants WHERE product_id = ?)',
      args: [productId],
    });

    await client.execute({
      sql: 'DELETE FROM product_variants WHERE product_id = ?',
      args: [productId],
    });

    await client.execute({
      sql: 'DELETE FROM products WHERE id = ?',
      args: [productId],
    });

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dihapus dari katalog.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
