import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';

export async function POST(req: NextRequest) {
  try {
    await ensureDbReady();
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID wajib diisi' }, { status: 400 });
    }

    // Ambil order
    const orderRes = await client.execute({
      sql: 'SELECT * FROM orders WHERE order_id = ? LIMIT 1',
      args: [orderId],
    });

    if (orderRes.rows.length === 0) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    const order = orderRes.rows[0];

    // Jika pesanan sudah lunas, tidak boleh dibatalkan sendiri
    if (order.status === 'completed') {
      return NextResponse.json(
        { error: 'Pesanan ini sudah lunas dan tidak dapat dibatalkan.' },
        { status: 400 }
      );
    }

    if (order.status === 'canceled') {
      return NextResponse.json({ success: true, message: 'Pesanan sudah berstatus dibatalkan.' });
    }

    // Update status di database menjadi canceled
    await client.execute({
      sql: "UPDATE orders SET status = 'canceled' WHERE order_id = ?",
      args: [orderId],
    });

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil dibatalkan.',
    });
  } catch (err: any) {
    console.error('Cancel order error:', err.message);
    return NextResponse.json({ error: err.message || 'Gagal membatalkan pesanan' }, { status: 500 });
  }
}
