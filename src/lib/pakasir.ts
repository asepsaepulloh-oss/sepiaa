/**
 * Library Integrasi Payment Gateway Pakasir API v2
 * Dokumentasi Resmi:
 * - Membuat Transaksi: https://pakasir.com/p/create-transaction
 * - Status Transaksi: https://pakasir.com/p/transaction-status
 * - Webhook: https://pakasir.com/p/webhook
 * - Simulasi Pembayaran: https://pakasir.com/p/payment-simulation
 * - Penghitung Biaya: https://pakasir.com/p/fee-calculator
 */

import { getStoreSettings, calculatePakasirFee } from './settings';

const BASE_URL = (process.env.PAKASIR_BASE_URL || 'https://app.pakasir.com').trim().replace(/\/+$/, '');

export interface PakasirPaymentResult {
  txn_id?: string;
  project?: string;
  order_id: string;
  amount: number;
  fee: number;
  total_payment: number;
  payment_method: string;
  payment_number?: string;
  qr_string?: string;
  va_number?: string;
  expired_at?: string;
  is_sandbox?: boolean;
}

export interface PakasirDetailResult {
  txn_id?: string;
  order_id: string;
  amount: number;
  is_sandbox?: boolean;
  status: 'pending' | 'completed' | 'canceled' | 'expired';
  completed_at?: string;
}

/**
 * Buat transaksi pembayaran baru di Pakasir API v2
 * POST /api/v2/create-transaction/{slug}/{order_id}
 *
 * Bila fee dibebankan ke pembeli (fee_mode = 'customer'):
 * Nominal yang ditagihkan ke Pakasir dinaikkan sebesar biaya QRIS, sehingga
 * hasil bersih yang diterima penjual adalah harga produk utuh.
 */
export async function createPakasirTransaction(params: {
  method: string;
  orderId: string;
  baseAmount: number; // Harga dasar produk
}): Promise<PakasirPaymentResult> {
  const { method, orderId, baseAmount } = params;

  // Ambil pengaturan toko terkini (dari DB atau fallback .env)
  const settings = await getStoreSettings();
  const project = settings.pakasir_project.trim().replace(/^\/+|\/+$/g, '');
  const apiKey = settings.pakasir_api_key.trim();

  // Hitung biaya layanan Pakasir
  const fee = calculatePakasirFee(baseAmount);

  // Jika fee dibebankan ke pembeli, total yang ditagihkan adalah baseAmount + fee
  const chargeAmount = settings.fee_mode === 'customer' ? (baseAmount + fee) : baseAmount;

  // Jika API Key belum diisi atau masih mode offline demo lokal
  if (!project || !apiKey || apiKey.includes('dummy') || apiKey.includes('rahasia')) {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return {
      txn_id: `txn_demo_${Date.now()}`,
      order_id: orderId,
      amount: baseAmount,
      fee: fee,
      total_payment: chargeAmount,
      payment_method: method,
      payment_number: '082323240186',
      qr_string: `00020101021226670014ID.LINKAJA.WWW01189360091430000000000215${orderId}52045812530336054${chargeAmount}5802ID5911SEPIA STORE6007JAKARTA62070703A016304`,
      expired_at: expiresAt,
      is_sandbox: settings.pakasir_sandbox,
    };
  }

  // Pakasir v2 Endpoint
  const url = `${BASE_URL}/api/v2/create-transaction/${encodeURIComponent(project)}/${encodeURIComponent(orderId)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({
      method: method || 'qris',
      amount: Math.round(chargeAmount),
    }),
  });

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Respons tidak valid dari Pakasir v2 (${res.status}): ${text}`);
  }

  if (!res.ok) {
    const msg = json?.message || json?.error || `HTTP ${res.status}`;
    throw new Error(`Pakasir API v2 Error: ${msg}`);
  }

  const finalTotal = Number(json.total_payment || json.amount || chargeAmount);

  return {
    txn_id: json.txn_id,
    project: json.project || project,
    order_id: json.order_id || orderId,
    amount: baseAmount, // Harga produk bersih penjual
    fee: fee, // Biaya layanan QRIS
    total_payment: finalTotal, // Total yang dibayar pembeli
    payment_method: json.payment_method || method,
    qr_string: json.qr_string,
    va_number: json.va_number,
    payment_number: json.va_number || json.payment_number,
    expired_at: json.expired_at,
    is_sandbox: json.is_sandbox ?? settings.pakasir_sandbox,
  };
}

/**
 * Cek status transaksi langsung ke Pakasir API v2
 * GET /api/v2/transaction-status/{slug}/{txn_id}
 */
export async function getPakasirTransactionDetail(params: {
  txnId?: string | null;
  orderId: string;
}): Promise<PakasirDetailResult | null> {
  const { txnId, orderId } = params;

  const settings = await getStoreSettings();
  const project = settings.pakasir_project.trim().replace(/^\/+|\/+$/g, '');
  const apiKey = settings.pakasir_api_key.trim();

  if (!project || !apiKey || apiKey.includes('dummy') || apiKey.includes('rahasia')) {
    return null;
  }

  const targetId = txnId || orderId;
  if (!targetId) return null;

  try {
    const url = `${BASE_URL}/api/v2/transaction-status/${encodeURIComponent(project)}/${encodeURIComponent(targetId)}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return {
      txn_id: json.txn_id,
      order_id: json.order_id || orderId,
      amount: Number(json.amount),
      is_sandbox: Boolean(json.is_sandbox),
      status: json.status,
      completed_at: json.completed_at,
    };
  } catch {
    return null;
  }
}

/**
 * Simulasi pembayaran berhasil (Sandbox mode) Pakasir API v2
 * POST /api/v2/payment-simulation/{slug}/{txn_id}
 */
export async function simulatePakasirPayment(params: {
  txnId?: string | null;
  orderId: string;
}): Promise<boolean> {
  const { txnId, orderId } = params;

  const settings = await getStoreSettings();
  const project = settings.pakasir_project.trim().replace(/^\/+|\/+$/g, '');
  const apiKey = settings.pakasir_api_key.trim();

  if (!project || !apiKey || apiKey.includes('dummy') || apiKey.includes('rahasia')) {
    return true;
  }

  const targetId = txnId || orderId;
  if (!targetId) return false;

  try {
    const url = `${BASE_URL}/api/v2/payment-simulation/${encodeURIComponent(project)}/${encodeURIComponent(targetId)}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    return res.ok;
  } catch {
    return false;
  }
}
