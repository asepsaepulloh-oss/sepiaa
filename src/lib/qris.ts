import crypto from 'crypto';
import { getStoreSettings, calculateQrisFee } from './settings';

export interface QrisPaymentResult {
  payment_id?: string;
  order_id: string;
  amount: number;
  fee: number;
  total_payment: number;
  qr_string?: string;
  qr_image_url?: string;
  expired_at?: string;
}

export interface QrisPaymentStatusResult {
  id?: string;
  external_id?: string;
  amount?: number;
  status?: string; // 'PAID', 'PENDING', 'EXPIRED', 'FAILED'
  paid_at?: string;
}

/**
 * Buat transaksi QRIS baru ke Payment Gateway mandiri
 * POST /api/v1/qris/create
 */
export async function createQrisTransaction(params: {
  orderId: string;
  baseAmount: number;
  description?: string;
}): Promise<QrisPaymentResult> {
  const { orderId, baseAmount, description } = params;

  const settings = await getStoreSettings();
  const gatewayUrl = (settings.qris_gateway_url || 'https://gomerch-beta.vercel.app').trim().replace(/\/+$/, '');
  const apiKey = (settings.qris_api_key || '').trim();

  // Hitung fee jika dibebankan ke pembeli
  const fee = settings.fee_mode === 'customer' ? calculateQrisFee(baseAmount) : 0;
  const chargeAmount = Math.round(baseAmount + fee);

  // Jika API Key belum diisi atau masih placeholder default, fallback ke demo QRIS
  if (!apiKey || apiKey.includes('MASUKKAN_API_KEY') || apiKey.includes('dummy')) {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return {
      payment_id: `pay_demo_${Date.now()}`,
      order_id: orderId,
      amount: baseAmount,
      fee: fee,
      total_payment: chargeAmount,
      qr_string: `00020101021226670014ID.LINKAJA.WWW01189360091430000000000215${orderId}52045812530336054${chargeAmount}5802ID5911SEPIA STORE6007JAKARTA62070703A016304`,
      qr_image_url: undefined,
      expired_at: expiresAt,
    };
  }

  const url = `${gatewayUrl}/api/v1/qris/create`;
  const body = {
    external_id: orderId,
    amount: chargeAmount,
    currency: 'IDR',
    description: description || `Pembayaran pesanan #${orderId}`,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Idempotency-Key': orderId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Respons tidak valid dari QRIS Gateway (${res.status}): ${text}`);
  }

  if (!res.ok) {
    const errorMsg = json?.error?.message || json?.message || json?.error || `HTTP ${res.status}`;
    throw new Error(`QRIS Gateway Error: ${errorMsg}`);
  }

  // Response sukses: data.qr_image_url, data.qr_string, data.id
  const payload = json?.data || json;

  return {
    payment_id: payload.id || payload.payment_id || payload.external_id || orderId,
    order_id: payload.external_id || orderId,
    amount: baseAmount,
    fee: fee,
    total_payment: Number(payload.amount || chargeAmount),
    qr_string: payload.qr_string,
    qr_image_url: payload.qr_image_url,
    expired_at: payload.expired_at || payload.expires_at || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };
}

/**
 * Pengecekan status pembayaran langsung ke Gateway
 * GET /api/v1/payments/${payment_id}
 */
export async function getQrisPaymentStatus(paymentId: string): Promise<QrisPaymentStatusResult | null> {
  if (!paymentId) return null;

  const settings = await getStoreSettings();
  const gatewayUrl = (settings.qris_gateway_url || 'https://gomerch-beta.vercel.app').trim().replace(/\/+$/, '');
  const apiKey = (settings.qris_api_key || '').trim();

  if (!apiKey || apiKey.includes('MASUKKAN_API_KEY') || apiKey.includes('dummy')) {
    return null;
  }

  try {
    const url = `${gatewayUrl}/api/v1/payments/${encodeURIComponent(paymentId)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const data = json?.data || json;

    return {
      id: data.id || paymentId,
      external_id: data.external_id,
      amount: data.amount,
      status: (data.status || '').toUpperCase(),
      paid_at: data.paid_at || data.completed_at,
    };
  } catch {
    return null;
  }
}

/**
 * Verifikasi signature webhook menggunakan HMAC-SHA256 (constant-time comparison)
 * Header: X-Webhook-Signature (format: v1=<hex_signature>)
 * Header: X-Webhook-Timestamp (UNIX timestamp)
 * signed_payload = timestamp + "." + raw_body
 * expected_signature = "v1=" + hmac_sha256(signed_payload, secret)
 */
export function verifyQrisWebhookSignature(params: {
  signatureHeader: string | null;
  timestampHeader: string | null;
  rawBody: string;
  secret: string;
}): boolean {
  const { signatureHeader, timestampHeader, rawBody, secret } = params;

  if (!signatureHeader || !timestampHeader || !secret) {
    return false;
  }

  try {
    const signedPayload = `${timestampHeader}.${rawBody}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedPayload);
    const expectedSignature = `v1=${hmac.digest('hex')}`;

    const sigBuffer = Buffer.from(signatureHeader, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}
