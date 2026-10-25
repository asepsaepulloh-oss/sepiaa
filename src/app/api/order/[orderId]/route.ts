import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';
import { getPakasirTransactionDetail } from '@/lib/pakasir';
import { assignStockToOrder } from '@/lib/stock';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await ensureDbReady();
    const { orderId } = await params;

    const res = await client.execute({
      sql: 'SELECT * FROM orders WHERE order_id = ? LIMIT 1',
      args: [orderId],
    });

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    let order: any = res.rows[0];

    // Jika status masih pending, verifikasi ke Pakasir langsung
    if (order.status === 'pending') {
      const detail = await getPakasirTransactionDetail({
        orderId: order.order_id,
        amount: Number(order.amount),
      });

      if (detail && (detail.status === 'completed' || (detail as any).status === 'success')) {
        await assignStockToOrder(order.order_id);

        const updated = await client.execute({
          sql: 'SELECT * FROM orders WHERE order_id = ? LIMIT 1',
          args: [orderId],
        });
        if (updated.rows.length > 0) {
          order = updated.rows[0];
        }
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.order_id,
        productName: order.product_name,
        variantName: order.variant_name,
        amount: Number(order.amount),
        fee: Number(order.fee),
        totalPayment: Number(order.total_payment),
        customerName: order.customer_name,
        customerWhatsapp: order.customer_whatsapp,
        customerEmail: order.customer_email,
        paymentMethod: order.payment_method,
        qrString: order.qr_string,
        status: order.status,
        accountDelivered: order.account_delivered,
        expiredAt: order.expired_at,
        createdAt: order.created_at,
        completedAt: order.completed_at,
      },
    });
  } catch (err: any) {
    console.error('Order status API error:', err.message);
    return NextResponse.json(
      { error: err.message || 'Gagal memuat status pesanan' },
      { status: 500 }
    );
  }
}
