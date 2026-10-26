# Sepia Store - Toko Akun Aplikasi Premium Instan & Legal

Platform toko online otomatis untuk penjualan akun aplikasi premium (Netflix, Spotify, Canva Pro, YouTube Premium, ChatGPT Plus) dengan pengiriman kredensial instan, integrasi **QRIS Payment Gateway Mandiri (GoBiz / Dynamic QRIS)**, dan database serverless Turso (LibSQL) + Drizzle ORM.

## Fitur Utama

- **Katalog Premium & Filter Instan**: Pencarian real-time dan filter kategori (Streaming, Musik, Desain, AI, VPN).
- **Checkout Cepat**: Pilihan varian paket langganan dengan auto-fill data akun member login dan proteksi pencegahan checkout jika stok habis.
- **QRIS Payment Gateway Mandiri (GoBiz / Dynamic QRIS)**:
  - Pembuatan invoice QRIS dinamis via `POST ${QRIS_GATEWAY_URL}/api/v1/qris/create` (mendukung GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, BRI, dll).
  - Tampilan gambar QR code (`qr_image_url`) langsung di halaman invoice pelanggan.
  - Verifikasi keamanan Webhook otomatis dengan signature **HMAC-SHA256 timing-safe** via `POST /api/webhooks/qris`.
  - Pengecekan status real-time via `GET ${QRIS_GATEWAY_URL}/api/v1/payments/${payment_id}`.
  - Pengaturan biaya QRIS dibebankan ke pembeli (penjual menerima 100% uang bersih).
  - Tombol batalkan pesanan langsung oleh pembeli di halaman invoice.
- **Auto Stock Delivery**: Begitu pembayaran lunas (webhook diterima / verified), server otomatis mengambil 1 stok akun dan menampilkannya di halaman invoice dengan tombol 1-Click Copy.
- **Dashboard Member (`/dashboard`)**:
  - Halaman login & pendaftaran akun member.
  - Tab "Akun Saya" dengan penghitung masa aktif & garansi real-time.
  - Tab riwayat pesanan lengkap.
- **Admin Dashboard (`/admin`)**:
  - Tab Dashboard statistik omset dan pesanan.
  - Tab Produk & Varian (CRUD produk dan varian).
  - Tab Input Stok Massal (Bulk format `email|password|catatan` dengan live parser).
  - Tab Pengaturan Toko & Gateway QRIS.
- **Dukungan Vercel & Turso**: Siap deploy serverless di Vercel dengan database Turso LibSQL ultra-cepat, plus fallback otomatis ke SQLite lokal saat development.

---

## Panduan Menjalankan di Lokal (Development)

1. Masuk ke direktori:
   ```bash
   cd sepia-store
   ```

2. Konfigurasi file `.env`:
   ```env
   QRIS_GATEWAY_URL="https://gomerch-beta.vercel.app"
   QRIS_API_KEY="qris_live_MASUKKAN_API_KEY_ANDA_DISINI"
   QRIS_WEBHOOK_SECRET="whsec_MASUKKAN_SIGNING_SECRET_ANDA_DISINI"
   ```

3. Jalankan development server:
   ```bash
   npm run dev
   ```

4. Buka di browser:
   - Toko: [http://localhost:3000](http://localhost:3000)
   - Login User & Admin: [http://localhost:3000/login](http://localhost:3000/login)

---

## Panduan Konfigurasi Produksi & Deploy ke Vercel

### 1. Setup Database Turso
1. Buka [https://turso.tech](https://turso.tech) dan login / daftar akun gratis.
2. Buat database baru: `turso db create sepiastore`
3. Dapatkan Database URL: `turso db show sepiastore --url`
4. Buat Auth Token: `turso db tokens create sepiastore`

### 2. Setup QRIS Payment Gateway
1. Siapkan endpoint Gateway URL, API Key (`qris_live_...`), dan Webhook Secret (`whsec_...`).
2. Daftarkan URL Webhook di dashboard Gateway Anda:
   `https://domain-anda.vercel.app/api/webhooks/qris`

### 3. Deploy ke Vercel
1. Buka dashboard [Vercel](https://vercel.com) > **Add New** > **Project** > Import repo `asepsaepulloh-oss/sepiaa`.
2. Tambahkan **Environment Variables** di Vercel:
   - `TURSO_DATABASE_URL`: `libsql://sepiastore-username.turso.io`
   - `TURSO_AUTH_TOKEN`: `token-turso-anda`
   - `QRIS_GATEWAY_URL`: `https://gomerch-beta.vercel.app`
   - `QRIS_API_KEY`: `qris_live_...`
   - `QRIS_WEBHOOK_SECRET`: `whsec_...`
   - `ADMIN_USERNAME`: `admin`
   - `ADMIN_PASSWORD`: `password-rahasia-anda`
   - `ADMIN_SESSION_SECRET`: `string-acak-panjang-min-32-karakter`
3. Klik **Deploy**. Website Anda siap menerima pesanan!
