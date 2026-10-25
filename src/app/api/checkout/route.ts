import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';
import { createPakasirTransaction } from '@/lib/pakasir';
import { getUserFromRequest } from '@/lib/auth-user';

export async function POST(req: NextRequest) {
  try {
    await ensureDbReady();

    const body = await req.json();
    const { variantId, customerName, customerWhatsapp, customerEmail } = body;

    if (!variantId || !customerName || !customerWhatsapp) {
      return NextResponse.json(
        { error: 'Varian produk, nama pembeli, dan nomor WhatsApp wajib diisi' },
        { status: 400 }
      );
    }

    // Ambil user jika sedang login
    const loggedInUser = await getUserFromRequest(req);
    const userId = loggedInUser ? loggedInUser.id : null;

    // Ambil data varian dan produk
    const varRes = await client.execute({
      sql: `SELECT v.*, p.name as product_name, p.is_active 
            FROM product_variants v
            JOIN products p ON v.product_id = p.id
            WHERE v.id = ? LIMIT 1`,
      args: [variantId],
    });

    if (varRes.rows.length === 0) {
      return NextResponse.json({ error: 'Varian produk tidak ditemukan' }, { status: 404 });
    }

    const item = varRes.rows[0];
    if (Number(item.is_active) === 0) {
      return NextResponse.json({ error: 'Produk ini sedang tidak aktif' }, { status: 400 });
    }

    // Validasi stok akun: Jika stok tidak ada / habis, batalkan checkout
    const stockRes = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM product_stocks WHERE variant_id = ? AND is_sold = 0',
      args: [variantId],
    });

    const stockCount = Number(stockRes.rows[0]?.count || 0);
    if (stockCount <= 0) {
      return NextResponse.json(
        { error: 'Maaf, stok akun untuk paket ini sedang habis. Produk tidak dapat dibeli.' },
        { status: 400 }
      );
    }

    const price = Number(item.price);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `SEP${dateStr}${randSuffix}`;

    // Buat transaksi di Pakasir API v2
    const payment = await createPakasirTransaction({
      method: 'qris',
      orderId,
      baseAmount: price,
    });

    const now = Date.now();
    const fee = payment.fee || 0;
    const totalPayment = payment.total_payment || (price + fee);
    const expiredAt = payment.expired_at ? new Date(payment.expired_at).getTime() : now + 15 * 60 * 1000;
    const txnId = payment.txn_id || null;

    // Simpan order di database beserta user_id (jika login)
    await client.execute({
      sql: `INSERT INTO orders (
              id, order_id, user_id, product_id, variant_id, product_name, variant_name,
              amount, fee, total_payment, customer_name, customer_whatsapp,
              customer_email, payment_method, payment_number, txn_id, qr_string,
              status, expired_at, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      args: [
        `ord-${Math.random().toString(36).substring(2, 9)}`,
        orderId,
        userId,
        String(item.product_id),
        variantId,
        String(item.product_name),
        String(item.name),
        price,
        fee,
        totalPayment,
        customerName.trim(),
        customerWhatsapp.trim(),
        customerEmail?.trim() || null,
        'qris',
        payment.payment_number || txnId || null,
        txnId,
        payment.qr_string || null,
        expiredAt,
        now,
      ],
    });

    return NextResponse.json({
      success: true,
      orderId,
      redirectUrl: `/order/${orderId}`,
    });
  } catch (err: any) {
    console.error('Checkout API error:', err.message);
    return NextResponse.json(
      { error: err.message || 'Gagal memproses checkout pesanan' },
      { status: 500 }
    );
  }
}
