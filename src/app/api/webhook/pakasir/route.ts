import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';
import { assignStockToOrder } from '@/lib/stock';

/**
 * Webhook handler Pakasir API v2
 * POST /api/webhook/pakasir
 * Headers: X-Secret: ...
 * Body: { txn_id, order_id, amount, is_sandbox, status, completed_at }
 */
export async function POST(req: NextRequest) {
  try {
    await ensureDbReady();

    const body = await req.json();
    const { order_id, txn_id, amount, status } = body;

    const targetOrderId = order_id || txn_id;

    if (!targetOrderId) {
      return NextResponse.json({ error: 'Payload webhook tidak lengkap' }, { status: 400 });
    }

    // Cari order berdasarkan order_id atau txn_id
    const orderRes = await client.execute({
      sql: 'SELECT * FROM orders WHERE order_id = ? OR txn_id = ? LIMIT 1',
      args: [String(targetOrderId), String(targetOrderId)],
    });

    if (orderRes.rows.length === 0) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    const matchedOrderId = String(orderRes.rows[0].order_id);

    // Cek apakah pembayaran sukses
    if (status === 'completed' || status === 'success') {
      await assignStockToOrder(matchedOrderId);
    } else if (status === 'expired' || status === 'canceled') {
      await client.execute({
        sql: 'UPDATE orders SET status = ? WHERE order_id = ?',
        args: [status, matchedOrderId],
      });
    }

    return NextResponse.json({ ok: true, status: 'processed' });
  } catch (err: any) {
    console.error('Webhook Pakasir error:', err.message);
    return NextResponse.json({ error: 'Gagal memproses webhook' }, { status: 500 });
  }
}
