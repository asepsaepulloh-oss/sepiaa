# Sepia Store - Toko Akun Aplikasi Premium Instan & Legal

Platform toko online otomatis untuk penjualan akun aplikasi premium (Netflix, Spotify, Canva Pro, YouTube Premium, ChatGPT Plus) dengan pengiriman kredensial instan, integrasi Payment Gateway Pakasir (QRIS Nasional), dan database serverless Turso (LibSQL) + Drizzle ORM.

## Fitur Utama

- **Katalog Premium & Filter Instan**: Pencarian real-time dan filter kategori (Streaming, Musik, Desain, AI, VPN).
- **Checkout Cepat**: Pilihan varian paket langganan dengan perhitungan diskon dan pengecekan sisa stok akun secara langsung.
- **Payment Gateway Pakasir**: Menghasilkan barcode QRIS interaktif yang bisa di-scan dari seluruh m-Banking dan E-Wallet Indonesia (BCA, Mandiri, BRI, BNI, Dana, GoPay, OVO, ShopeePay).
- **Auto Stock Delivery**: Begitu pembayaran lunas (webhook diterima / verified), server otomatis mengambil 1 stok akun dan menampilkannya di halaman invoice dengan tombol 1-Click Copy.
- **Admin Dashboard (`/admin`)**:
  - Ringkasan omset dan performa transaksi real-time.
  - Riwayat lengkap pesanan dan status penyerahan akun.
  - Input massal (bulk import) stok akun: 1 baris per akun format `email|password|catatan`.
  - Manajemen katalog dan pemantauan stok per varian.
- **Dukungan Vercel & Turso**: Siap deploy serverless di Vercel dengan database Turso LibSQL ultra-cepat, plus fallback otomatis ke SQLite lokal saat development.

---

## Panduan Menjalankan di Lokal (Development)

1. Masuk ke direktori:
   ```bash
   cd sepia-store
   ```

2. File `.env` sudah disediakan secara otomatis untuk pengujian lokal.

3. Jalankan development server:
   ```bash
   npm run dev
   ```

4. Buka di browser:
   - Toko: [http://localhost:3000](http://localhost:3000)
   - Admin: [http://localhost:3000/admin](http://localhost:3000/admin) (Username: `admin`, Password: `adminsepia123`)

---

## Panduan Konfigurasi Produksi & Deploy ke Vercel

### 1. Setup Database Turso
1. Buka [https://turso.tech](https://turso.tech) dan login / daftar akun gratis.
2. Buat database baru:
   ```bash
   turso db create sepiastore
   ```
3. Dapatkan Database URL:
   ```bash
   turso db show sepiastore --url
   ```
4. Buat Auth Token:
   ```bash
   turso db tokens create sepiastore
   ```
5. Simpan `TURSO_DATABASE_URL` (format `libsql://...`) dan `TURSO_AUTH_TOKEN`.

### 2. Setup Payment Gateway Pakasir
1. Buka [https://app.pakasir.com](https://app.pakasir.com) dan buat proyek toko baru.
2. Catat `PAKASIR_PROJECT` (slug proyek) dan `PAKASIR_API_KEY`.
3. Pada menu **Detail Proyek** > **Edit Proyek**, atur:
   - **Webhook URL**: `https://domain-anda.vercel.app/api/webhook/pakasir`
   - **Mode Sandbox**: Ubah ke `false` jika ingin menerima pembayaran uang asli.

### 3. Deploy ke Vercel
1. Push project ini ke repository GitHub Anda:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit sepia store"
   git branch -M main
   git remote add origin https://github.com/<username>/sepia-store.git
   git push -u origin main
   ```
2. Buka dashboard [Vercel](https://vercel.com) > **Add New** > **Project** > Import repo tersebut.
3. Tambahkan **Environment Variables** di Vercel:
   - `TURSO_DATABASE_URL`: `libsql://sepiastore-username.turso.io`
   - `TURSO_AUTH_TOKEN`: `token-turso-anda`
   - `PAKASIR_PROJECT`: `slug-proyek-pakasir`
   - `PAKASIR_API_KEY`: `api-key-pakasir`
   - `PAKASIR_SANDBOX`: `false`
   - `ADMIN_USERNAME`: `admin`
   - `ADMIN_PASSWORD`: `password-rahasia-anda`
   - `ADMIN_SESSION_SECRET`: `string-acak-panjang-min-32-karakter`
4. Klik **Deploy**. Website Anda siap menerima pesanan!
