import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';
import { assignStockToOrder } from '@/lib/stock';

export async function POST(req: NextRequest) {
  try {
    await ensureDbReady();
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID wajib diisi' }, { status: 400 });
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
