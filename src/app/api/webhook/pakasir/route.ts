import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';
import { assignStockToOrder } from '@/lib/stock';

/**
 * Webhook handler dari Pakasir
 * POST /api/webhook/pakasir
 * Body format: { amount, order_id, project, status, payment_method, completed_at }
 */
export async function POST(req: NextRequest) {
  try {
    await ensureDbReady();

    const body = await req.json();
    const { order_id, amount, status } = body;

    if (!order_id || amount === undefined) {
      return NextResponse.json({ error: 'Payload webhook tidak lengkap' }, { status: 400 });
    }

    const orderRes = await client.execute({
      sql: 'SELECT * FROM orders WHERE order_id = ? LIMIT 1',
      args: [order_id],
    });

    if (orderRes.rows.length === 0) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    const order = orderRes.rows[0];

    // Cek apakah pembayaran sukses
    if (status === 'completed' || status === 'success') {
      await assignStockToOrder(order_id);
    } else if (status === 'expired' || status === 'canceled') {
      await client.execute({
        sql: 'UPDATE orders SET status = ? WHERE order_id = ?',
        args: [status, order_id],
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Webhook Pakasir error:', err.message);
    return NextResponse.json({ error: 'Gagal memproses webhook' }, { status: 500 });
  }
}
