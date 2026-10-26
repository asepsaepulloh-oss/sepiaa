import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';
import { getQrisPaymentStatus } from '@/lib/qris';
import { assignStockToOrder } from '@/lib/stock';
import { getStoreSettings } from '@/lib/settings';

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

    // Jika status masih pending, verifikasi ke QRIS Gateway langsung
    if (order.status === 'pending' && order.txn_id) {
      const detail = await getQrisPaymentStatus(String(order.txn_id));

      if (detail && (detail.status === 'PAID' || detail.status === 'COMPLETED' || detail.status === 'SUCCESS')) {
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

    const settings = await getStoreSettings();

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
        qrImageUrl: order.qr_image_url,
        status: order.status,
        accountDelivered: order.account_delivered,
        expiredAt: order.expired_at,
        adminWhatsapp: settings.admin_whatsapp,
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
