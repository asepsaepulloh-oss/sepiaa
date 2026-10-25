import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';
import { assignStockToOrder } from '@/lib/stock';
import { simulatePakasirPayment } from '@/lib/pakasir';

export async function POST(req: NextRequest) {
  try {
    if (process.env.PAKASIR_SANDBOX !== 'true') {
      return NextResponse.json(
        { error: 'Mode simulasi dinonaktifkan karena sistem berada dalam mode produksi (PAKASIR_SANDBOX=false).' },
        { status: 403 }
      );
    }

    await ensureDbReady();
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID wajib diisi' }, { status: 400 });
    }

    // Ambil order dari DB
    const orderRes = await client.execute({
      sql: 'SELECT * FROM orders WHERE order_id = ? LIMIT 1',
      args: [orderId],
    });

    if (orderRes.rows.length > 0) {
      const order = orderRes.rows[0];
      const txnId = order.txn_id ? String(order.txn_id) : null;

      // Panggil simulasi Pakasir v2 jika ada koneksi
      await simulatePakasirPayment({ txnId, orderId }).catch(() => {});
    }

    const res = await assignStockToOrder(orderId);
    if (!res.success) {
      return NextResponse.json({ error: res.error || 'Gagal simulasi' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Simulasi pembayaran sukses. Akun telah diserahkan.',
      accountData: res.accountData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
