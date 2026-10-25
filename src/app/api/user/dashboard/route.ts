import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';
import { getUserFromRequest } from '@/lib/auth-user';

export async function GET(req: NextRequest) {
  try {
    await ensureDbReady();
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cleanWa = user.whatsapp;
    const waVariant = cleanWa.startsWith('62') ? `0${cleanWa.slice(2)}` : cleanWa.startsWith('0') ? `62${cleanWa.slice(1)}` : cleanWa;

    // Ambil semua pesanan milik user
    const ordersRes = await client.execute({
      sql: `SELECT o.*, v.duration_days
            FROM orders o
            LEFT JOIN product_variants v ON o.variant_id = v.id
            WHERE o.user_id = ? 
               OR o.customer_whatsapp = ? 
               OR o.customer_whatsapp = ?
               OR (o.customer_email IS NOT NULL AND o.customer_email = ?)
            ORDER BY o.created_at DESC`,
      args: [user.id, cleanWa, waVariant, user.email || ''],
    });

    const orders = ordersRes.rows.map((r: any) => ({
      id: String(r.id),
      orderId: String(r.order_id),
      productName: String(r.product_name),
      variantName: String(r.variant_name),
      amount: Number(r.amount),
      totalPayment: Number(r.total_payment),
      status: String(r.status),
      accountDelivered: r.account_delivered ? String(r.account_delivered) : null,
      durationDays: Number(r.duration_days || 30),
      createdAt: Number(r.created_at),
      completedAt: r.completed_at ? Number(r.completed_at) : null,
    }));

    return NextResponse.json({
      success: true,
      user,
      orders,
    });
  } catch (err: any) {
    console.error('User dashboard error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
