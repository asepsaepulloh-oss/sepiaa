import { NextRequest, NextResponse } from 'next/server';
import { client, ensureDbReady } from '@/lib/turso';
import { assignStockToOrder } from '@/lib/stock';
import { verifyQrisWebhookSignature } from '@/lib/qris';
import { getStoreSettings } from '@/lib/settings';

/**
 * Webhook Handler Resmi QRIS Payment Gateway
 * POST /api/webhooks/qris
 *
 * Headers:
 * - X-Webhook-Signature: v1=<hex_signature>
 * - X-Webhook-Timestamp: <unix_timestamp>
 */
export async function POST(req: NextRequest) {
  try {
    await ensureDbReady();

    const signatureHeader = req.headers.get('x-webhook-signature');
    const timestampHeader = req.headers.get('x-webhook-timestamp');

    // Ambil raw body string untuk verifikasi HMAC
    const rawBody = await req.text();

    const settings = await getStoreSettings();
    const webhookSecret = (settings.qris_webhook_secret || process.env.QRIS_WEBHOOK_SECRET || '').trim();

    // Verifikasi HMAC-SHA256 signature jika secret terkonfigurasi
    if (webhookSecret && !webhookSecret.includes('MASUKKAN_SIGNING_SECRET')) {
      const isValid = verifyQrisWebhookSignature({
        signatureHeader,
        timestampHeader,
        rawBody,
        secret: webhookSecret,
      });

      if (!isValid) {
        console.warn('QRIS Webhook: Invalid signature rejected.');
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType = payload.event || payload.type || payload.event_type;
    const eventData = payload.data || payload;

    // Pastikan event adalah payment.paid atau payment_paid
    if (eventType === 'payment.paid' || eventType === 'payment_paid' || payload.status === 'PAID') {
      const externalId = eventData.external_id || eventData.order_id || payload.external_id;

      if (!externalId) {
        return NextResponse.json({ error: 'external_id not found in payload' }, { status: 400 });
      }

      // Cari order di database
      const orderRes = await client.execute({
        sql: 'SELECT * FROM orders WHERE order_id = ? OR txn_id = ? LIMIT 1',
        args: [String(externalId), String(externalId)],
      });

      if (orderRes.rows.length === 0) {
        console.warn(`QRIS Webhook: Order ${externalId} not found.`);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const order = orderRes.rows[0];
      const matchedOrderId = String(order.order_id);

      // Jalankan logika penyerahan akun & update status pesanan menjadi completed
      await assignStockToOrder(matchedOrderId);

      return NextResponse.json({ success: true, message: `Payment for order ${matchedOrderId} processed successfully.` });
    }

    // Response default untuk event lain
    return NextResponse.json({ success: true, message: 'Event received' });
  } catch (err: any) {
    console.error('QRIS Webhook Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal webhook error' },
      { status: 500 }
    );
  }
}
