'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BearHead, BearPaw } from '@/components/BearIcon';
import {
  DollarSign,
  ShoppingBag,
  CheckCircle,
  PackagePlus,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  Layers,
  Copy,
  Check,
  Plus,
  Trash2,
  Users,
  Settings,
  Receipt,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  X,
  ShieldCheck,
} from 'lucide-react';

interface Metrics {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  activeStockCount: number;
  totalCustomers: number;
}

interface OrderItem {
  id: string;
  orderId: string;
  productName: string;
  variantName: string;
  amount: number;
  totalPayment: number;
  customerName: string;
  customerWhatsapp: string;
  customerEmail: string | null;
  status: string;
  accountDelivered: string | null;
  createdAt: number;
  completedAt: number | null;
}

interface VariantItem {
  id: string;
  productId: string;
  productName: string;
  name: string;
  price: number;
  originalPrice: number;
  stockCount: number;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface ProductItem {
  id: string;
  name: string;
  categoryId: string;
  imageUrl: string;
  badge: string | null;
  description: string;
  isActive: number;
  variants: VariantItem[];
  totalStock: number;
  minPrice: number;
  maxPrice: number;
}

interface CustomerItem {
  id: string;
  name: string;
  whatsapp: string;
  email: string | null;
  createdAt: number;
}

interface NewVariantForm {
  name: string;
  durationDays: number;
  price: number | '';
  originalPrice: number | '';
  description: string;
}

interface ParsedAccount {
  email: string;
  password: string;
  catatan: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUsername, setAdminUsername] = useState('Admin');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'produk' | 'pesanan' | 'pelanggan' | 'pengaturan'>('dashboard');

  // Dashboard Data
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [variants, setVariants] = useState<VariantItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchTableQuery, setSearchTableQuery] = useState('');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBulkStockModalOpen, setIsBulkStockModalOpen] = useState(false);

  // Add Product Form State
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodBadge, setProdBadge] = useState('');
  const [prodTagline, setProdTagline] = useState('');
  const [modalVariants, setModalVariants] = useState<NewVariantForm[]>([
    { name: 'Lisensi Standar (1 Bulan)', durationDays: 30, price: 34900, originalPrice: 59900, description: '1 Profil / Perangkat' },
  ]);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Bulk Stock Modal State
  const [bulkTargetProductId, setBulkTargetProductId] = useState('');
  const [bulkTargetVariantId, setBulkTargetVariantId] = useState('');
  const [bulkRawText, setBulkRawText] = useState('');
  const [isSubmittingBulkStock, setIsSubmittingBulkStock] = useState(false);

  // Settings Form State
  const [settingsStoreName, setSettingsStoreName] = useState('Sepia Store');
  const [settingsAdminWhatsapp, setSettingsAdminWhatsapp] = useState('6282323240186');
  const [settingsQrisGatewayUrl, setSettingsQrisGatewayUrl] = useState('https://gomerch-beta.vercel.app');
  const [settingsQrisApiKey, setSettingsQrisApiKey] = useState('');
  const [settingsQrisWebhookSecret, setSettingsQrisWebhookSecret] = useState('');
  const [settingsFeeMode, setSettingsFeeMode] = useState<'customer' | 'merchant'>('customer');
  const [settingsAnnouncement, setSettingsAnnouncement] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Copy & Toast
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch('/api/admin/data');
      if (res.status === 401) {
        setIsAuthenticated(false);
        setIsLoadingData(false);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setAdminUsername(data.adminUsername || 'Admin');
        setMetrics(data.metrics);
        setCategories(data.categories || []);
        setOrders(data.orders || []);
        setVariants(data.variants || []);
        setProducts(data.products || []);
        setCustomers(data.customers || []);

        if (data.settings) {
          setSettingsStoreName(data.settings.store_name || 'Sepia Store');
          setSettingsAdminWhatsapp(data.settings.admin_whatsapp || '6282323240186');
          setSettingsQrisGatewayUrl(data.settings.qris_gateway_url || 'https://gomerch-beta.vercel.app');
          setSettingsQrisApiKey(data.settings.qris_api_key || '');
          setSettingsQrisWebhookSecret(data.settings.qris_webhook_secret || '');
          setSettingsFeeMode(data.settings.fee_mode || 'customer');
          setSettingsAnnouncement(data.settings.announcement_text || '');
        }

        if (data.categories?.length > 0 && !prodCategory) {
          setProdCategory(data.categories[0].id);
        }
        if (data.products?.length > 0 && !bulkTargetProductId) {
          setBulkTargetProductId(data.products[0].id);
          if (data.products[0].variants?.length > 0) {
            setBulkTargetVariantId(data.products[0].variants[0].id);
          }
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.trim(),
          password: passwordInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        fetchDashboardData();
        showToast('Login Berhasil', 'Selamat datang di Panel Kontrol Sepia Admin.');
      } else {
        setLoginError(data.error || 'Login gagal');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Koneksi gagal');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: settingsStoreName,
          admin_whatsapp: settingsAdminWhatsapp,
          qris_gateway_url: settingsQrisGatewayUrl,
          qris_api_key: settingsQrisApiKey,
          qris_webhook_secret: settingsQrisWebhookSecret,
          fee_mode: settingsFeeMode,
          announcement_text: settingsAnnouncement,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Berhasil Disimpan', data.message || 'Pengaturan toko berhasil diperbarui.');
        fetchDashboardData();
      } else {
        alert(data.error || 'Gagal menyimpan pengaturan');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    router.push('/login');
  };

  // Parsing Bulk Text `email|password|catatan`
  const parseBulkText = (text: string): ParsedAccount[] => {
    const lines = text.split('\n');
    const parsed: ParsedAccount[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed) {
        const parts = trimmed.split('|');
        if (parts.length >= 2) {
          parsed.push({
            email: parts[0].trim(),
            password: parts[1].trim(),
            catatan: parts[2] ? parts[2].trim() : 'Lisensi Resmi',
          });
        } else {
          parsed.push({
            email: trimmed,
            password: '-',
            catatan: 'Stok Manual',
          });
        }
      }
    });

    return parsed;
  };

  const parsedBulkAccounts = parseBulkText(bulkRawText);

  // Submit Bulk Stock
  const handleExecuteBulkStock = async () => {
    if (!bulkTargetVariantId || parsedBulkAccounts.length === 0) {
      showToast('Peringatan', 'Pilih varian dan masukkan data akun yang valid.');
      return;
    }

    setIsSubmittingBulkStock(true);
    try {
      const res = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: bulkTargetVariantId,
          rawAccounts: bulkRawText.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Bulk Stok Ditambahkan', `Berhasil menambahkan ${parsedBulkAccounts.length} akun ke stok varian.`);
        setBulkRawText('');
        setIsBulkStockModalOpen(false);
        fetchDashboardData();
      } else {
        alert(data.error || 'Gagal menambahkan stok');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmittingBulkStock(false);
    }
  };

  // Submit New Product
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodCategory || !prodTagline.trim()) {
      showToast('Peringatan', 'Nama produk, kategori, dan deskripsi wajib diisi.');
      return;
    }

    if (modalVariants.length === 0 || !modalVariants[0].name.trim() || !modalVariants[0].price) {
      showToast('Peringatan', 'Minimal harus ada 1 varian produk dengan harga valid.');
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const res = await fetch('/api/admin/product/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: prodName.trim(),
          categoryId: prodCategory,
          description: prodTagline.trim(),
          imageUrl: prodImageUrl.trim() || undefined,
          badge: prodBadge.trim() || undefined,
          variants: modalVariants.map((v) => ({
            name: v.name.trim(),
            durationDays: Number(v.durationDays) || 30,
            price: Number(v.price),
            originalPrice: Number(v.originalPrice) || Math.round(Number(v.price) * 1.4),
            description: v.description.trim() || undefined,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Produk Berhasil Disimpan', `Aplikasi "${prodName}" berhasil ditambahkan.`);
        setProdName('');
        setProdTagline('');
        setProdImageUrl('');
        setProdBadge('');
        setModalVariants([
          { name: 'Lisensi Standar (1 Bulan)', durationDays: 30, price: 34900, originalPrice: 59900, description: '1 Profil / Perangkat' },
        ]);
        setIsProductModalOpen(false);
        fetchDashboardData();
      } else {
        alert(data.error || 'Gagal menambahkan produk');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Yakin ingin menghapus produk "${productName}" beserta seluruh varian dan stoknya?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/product/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Produk Dihapus', `Aplikasi "${productName}" berhasil dihapus.`);
        fetchDashboardData();
      } else {
        alert(data.error || 'Gagal menghapus produk');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleCopyText = (text: string, orderId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Loading Screen
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#f7f3ed] flex items-center justify-center text-[#7e5434]">
        <Loader2 className="w-8 h-8 animate-spin text-[#543827]" />
      </div>
    );
  }

  // Login Screen if directly accessing /admin
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f7f3ed] text-[#3b281a] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#fcfaf7] border border-[#ebdccb] rounded-3xl p-6 sm:p-8 space-y-6 card-shadow">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#543827] flex items-center justify-center mx-auto text-[#fcfaf7] shadow-md">
              <BearHead className="w-8 h-8 text-[#f5efe6]" />
            </div>
            <h1 className="text-xl font-extrabold text-[#543827] tracking-tight">Sepia Admin Panel</h1>
            <p className="text-xs text-[#7e5434]">Masuk untuk mengelola produk, pesanan, dan stok</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#543827] mb-1.5">Username</label>
              <input
                type="text"
                placeholder="admin"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                className="w-full bg-[#f5efe6] border border-[#ebdccb] focus:border-[#543827] rounded-xl px-3.5 py-2.5 text-sm text-[#543827] placeholder-[#9e6d42] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#543827] mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full bg-[#f5efe6] border border-[#ebdccb] focus:border-[#543827] rounded-xl px-3.5 py-2.5 text-sm text-[#543827] placeholder-[#9e6d42] focus:outline-none"
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-2xl font-bold text-xs bg-[#543827] hover:bg-[#67442d] text-[#fcfaf7] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Masuk ke Panel Kontrol</span>
            </button>
          </form>

          <div className="text-center">
            <Link href="/" className="text-xs text-[#9e6d42] hover:text-[#543827] transition-colors">
              &larr; Kembali ke Toko
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const titleMap = {
    dashboard: 'Dashboard Statistik',
    produk: 'Manajemen Produk & Varian',
    pesanan: 'Daftar Pesanan & Transaksi',
    pelanggan: 'Daftar Pelanggan Terdaftar',
    pengaturan: 'Pengaturan Toko',
  };

  // Filtered orders based on search input
  const filteredOrders = orders.filter(
    (o) =>
      !searchTableQuery ||
      o.orderId.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchTableQuery.toLowerCase())
  );

  return (
    <div className="bg-[#f7f3ed] min-h-screen flex antialiased text-[#3b281a] w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#543827] text-[#fcfaf7] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#7e5434] animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-5 h-5 text-[#cfa67c] shrink-0" />
          <div>
            <h4 className="font-bold text-xs">{toastMessage.title}</h4>
            <p className="text-[11px] text-[#dec4a6]">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#543827] text-[#dec4a6] hidden md:flex flex-col justify-between p-6 border-r border-[#67442d] shrink-0">
        <div className="space-y-8">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-[#67442d] flex items-center justify-center text-[#fcfaf7] shadow-md border border-[#7e5434]">
              <BearHead className="w-6 h-6 text-[#f5efe6]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#fcfaf7]">Sepia Admin</span>
              <span className="block text-[10px] uppercase tracking-widest text-[#cfa67c] font-semibold">
                Panel Kontrol
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#67442d] text-[#fcfaf7] shadow-inner font-bold'
                  : 'text-[#dec4a6] hover:bg-[#67442d]/60 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('produk')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'produk'
                  ? 'bg-[#67442d] text-[#fcfaf7] shadow-inner font-bold'
                  : 'text-[#dec4a6] hover:bg-[#67442d]/60 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Produk &amp; Varian</span>
            </button>

            <button
              onClick={() => setActiveTab('pesanan')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'pesanan'
                  ? 'bg-[#67442d] text-[#fcfaf7] shadow-inner font-bold'
                  : 'text-[#dec4a6] hover:bg-[#67442d]/60 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Pesanan &amp; Transaksi</span>
            </button>

            <button
              onClick={() => setActiveTab('pelanggan')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'pelanggan'
                  ? 'bg-[#67442d] text-[#fcfaf7] shadow-inner font-bold'
                  : 'text-[#dec4a6] hover:bg-[#67442d]/60 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Pelanggan</span>
            </button>

            <button
              onClick={() => setActiveTab('pengaturan')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'pengaturan'
                  ? 'bg-[#67442d] text-[#fcfaf7] shadow-inner font-bold'
                  : 'text-[#dec4a6] hover:bg-[#67442d]/60 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan</span>
            </button>
          </nav>
        </div>

        {/* Admin Profile Footer */}
        <div className="pt-6 border-t border-[#67442d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#7e5434] flex items-center justify-center font-bold text-white text-xs border border-[#9e6d42]">
              {adminUsername.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h5 className="text-xs font-bold text-[#fcfaf7] truncate">{adminUsername}</h5>
              <span className="text-[10px] text-[#cfa67c] block">Super Administrator</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-[#dec4a6] hover:text-rose-300 transition-colors text-xs p-2 cursor-pointer"
            title="Keluar Sesi Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER */}
        <header className="bg-[#fcfaf7] border-b border-[#ebdccb] sticky top-0 z-30 px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-bold text-[#7e5434] hover:text-[#543827] flex items-center gap-1.5 md:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Toko</span>
            </Link>
            <h1 className="text-lg sm:text-2xl font-extrabold text-[#543827]">
              {titleMap[activeTab]}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Cari di panel..."
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[#f5efe6] border border-[#ebdccb] rounded-full text-xs text-[#543827] placeholder-[#9e6d42] focus:outline-none focus:ring-1 focus:ring-[#b88654] w-48 lg:w-60"
              />
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-[#9e6d42] pointer-events-none" />
            </div>

            <button
              onClick={fetchDashboardData}
              disabled={isLoadingData}
              className="p-2 rounded-full bg-[#f5efe6] hover:bg-[#ebdccb] text-[#543827] border border-[#dec4a6] transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 bg-[#f5efe6] border border-[#ebdccb] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#543827] hover:bg-[#ebdccb] transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="hidden sm:inline">Live Store</span>
              <ExternalLink className="w-3 h-3 text-[#9e6d42]" />
            </Link>
          </div>
        </header>

        {/* MOBILE NAVIGATION BAR */}
        <div className="md:hidden flex border-b border-[#ebdccb] bg-[#fcfaf7] overflow-x-auto p-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-[#543827] text-white' : 'text-[#7e5434]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('produk')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
              activeTab === 'produk' ? 'bg-[#543827] text-white' : 'text-[#7e5434]'
            }`}
          >
            Produk &amp; Varian
          </button>
          <button
            onClick={() => setActiveTab('pesanan')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
              activeTab === 'pesanan' ? 'bg-[#543827] text-white' : 'text-[#7e5434]'
            }`}
          >
            Pesanan
          </button>
          <button
            onClick={() => setActiveTab('pelanggan')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
              activeTab === 'pelanggan' ? 'bg-[#543827] text-white' : 'text-[#7e5434]'
            }`}
          >
            Pelanggan
          </button>
          <button
            onClick={() => setActiveTab('pengaturan')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
              activeTab === 'pengaturan' ? 'bg-[#543827] text-white' : 'text-[#7e5434]'
            }`}
          >
            Pengaturan
          </button>
        </div>

        {/* DYNAMIC CONTENT AREA */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {/* TAB 1: DASHBOARD STATISTIK */}
          {activeTab === 'dashboard' && metrics && (
            <div className="space-y-8">
              {/* Stats Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#fcfaf7] p-6 rounded-3xl border border-[#ebdccb] card-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[#7e5434] uppercase tracking-wider">Total Pendapatan</span>
                    <div className="w-10 h-10 rounded-2xl bg-[#f5efe6] flex items-center justify-center text-[#543827] font-bold">
                      <DollarSign className="w-4 h-4 text-[#b88654]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#543827]">{formatRupiah(metrics.totalRevenue)}</h3>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-flex items-center gap-1 border border-emerald-200">
                      <TrendingUp className="w-3 h-3" />
                      <span>{metrics.paidOrders} pesanan lunas</span>
                    </span>
                  </div>
                </div>

                <div className="bg-[#fcfaf7] p-6 rounded-3xl border border-[#ebdccb] card-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[#7e5434] uppercase tracking-wider">Total Pesanan</span>
                    <div className="w-10 h-10 rounded-2xl bg-[#f5efe6] flex items-center justify-center text-[#543827] font-bold">
                      <ShoppingBag className="w-4 h-4 text-[#7e5434]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#543827]">{metrics.totalOrders}</h3>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-flex items-center gap-1 border border-emerald-200">
                      <CheckCircle className="w-3 h-3" />
                      <span>Semua riwayat transaksi</span>
                    </span>
                  </div>
                </div>

                <div className="bg-[#fcfaf7] p-6 rounded-3xl border border-[#ebdccb] card-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[#7e5434] uppercase tracking-wider">Total Produk</span>
                    <div className="w-10 h-10 rounded-2xl bg-[#f5efe6] flex items-center justify-center text-[#543827] font-bold">
                      <Layers className="w-4 h-4 text-[#7e5434]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#543827]">{products.length} Aplikasi</h3>
                    <span className="text-[10px] text-[#7e5434] font-semibold bg-[#f5efe6] px-2 py-0.5 rounded-md mt-1 inline-block">
                      {variants.length} Varian &amp; Paket Aktif
                    </span>
                  </div>
                </div>

                <div className="bg-[#fcfaf7] p-6 rounded-3xl border border-[#ebdccb] card-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[#7e5434] uppercase tracking-wider">Pengguna Aktif</span>
                    <div className="w-10 h-10 rounded-2xl bg-[#f5efe6] flex items-center justify-center text-[#543827] font-bold">
                      <Users className="w-4 h-4 text-[#7e5434]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#543827]">{metrics.totalCustomers} Member</h3>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-flex items-center gap-1 border border-emerald-200">
                      <CheckCircle className="w-3 h-3" />
                      <span>Pelanggan terdaftar</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Charts & Quick Insights Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#fcfaf7] p-6 sm:p-8 rounded-3xl border border-[#ebdccb] card-shadow space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-base text-[#543827]">Statistik Stok &amp; Penjualan</h3>
                      <p className="text-xs text-[#7e5434]">Ketersediaan stok akun dan performa katalog</p>
                    </div>
                    <span className="text-xs bg-[#f5efe6] text-[#543827] font-bold px-3 py-1 rounded-xl">
                      Real-Time
                    </span>
                  </div>

                  {/* Stock Bars */}
                  <div className="space-y-4 pt-2">
                    {variants.slice(0, 5).map((v) => (
                      <div key={v.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-[#543827]">
                          <span>{v.productName} ({v.name})</span>
                          <span className="text-[#9e6d42]">{v.stockCount} Akun Tersedia</span>
                        </div>
                        <div className="w-full h-3 bg-[#f5efe6] rounded-full overflow-hidden border border-[#ebdccb]">
                          <div
                            className={`h-full rounded-full ${
                              v.stockCount > 0 ? 'bg-[#543827]' : 'bg-rose-600'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(8, v.stockCount * 15))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#fcfaf7] p-6 sm:p-8 rounded-3xl border border-[#ebdccb] card-shadow flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="font-extrabold text-base text-[#543827] mb-1">Status Pembayaran</h3>
                    <p className="text-xs text-[#7e5434] mb-4">Rincian status pesanan masuk</p>

                    <div className="space-y-3 pt-2">
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-700" />
                          <span className="text-xs font-bold text-emerald-900">Selesai / Lunas</span>
                        </div>
                        <span className="font-black text-xs text-emerald-900">{metrics.paidOrders}</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-700" />
                          <span className="text-xs font-bold text-amber-900">Pending / Menunggu</span>
                        </div>
                        <span className="font-black text-xs text-amber-900">
                          {metrics.totalOrders - metrics.paidOrders}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#ebdccb] text-xs text-[#7e5434]">
                    <span className="flex items-center gap-1.5 font-bold text-[#543827] mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>QRIS Gateway Terhubung</span>
                    </span>
                    <p className="text-[11px]">Dynamic QRIS otomatis memproses pembayaran dan menyerahkan stok akun.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUK & VARIAN */}
          {activeTab === 'produk' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#543827]">Manajemen Produk &amp; Varian</h2>
                  <p className="text-xs text-[#7e5434]">Kelola aplikasi digital, varian paket langganan, dan update stok massal.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsBulkStockModalOpen(true)}
                    className="bg-[#ebdccb] hover:bg-[#dec4a6] text-[#543827] font-bold px-4 py-3 rounded-2xl text-xs transition-colors border border-[#dec4a6] flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <FileText className="w-4 h-4 text-[#7e5434]" />
                    <span>Bulk Stok (email|password|catatan)</span>
                  </button>
                  <button
                    onClick={() => setIsProductModalOpen(true)}
                    className="bg-[#543827] hover:bg-[#67442d] text-[#fcfaf7] font-bold px-5 py-3 rounded-2xl text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Produk</span>
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-[#fcfaf7] rounded-3xl border border-[#ebdccb] card-shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f5efe6] border-b border-[#ebdccb] text-[#7e5434] uppercase tracking-wider text-[10px]">
                        <th className="py-4 px-6 font-extrabold">Nama Aplikasi &amp; Varian</th>
                        <th className="py-4 px-6 font-extrabold">Kategori</th>
                        <th className="py-4 px-6 font-extrabold">Rentang Harga</th>
                        <th className="py-4 px-6 font-extrabold">Total Stok Varian</th>
                        <th className="py-4 px-6 font-extrabold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ebdccb] text-[#3b281a]">
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 px-6 text-center text-[#9e6d42]">
                            Belum ada produk di katalog toko.
                          </td>
                        </tr>
                      ) : (
                        products.map((prod) => {
                          const priceStr =
                            prod.minPrice === prod.maxPrice
                              ? formatRupiah(prod.minPrice)
                              : `${formatRupiah(prod.minPrice)} - ${formatRupiah(prod.maxPrice)}`;

                          return (
                            <tr key={prod.id} className="hover:bg-[#f5efe6] transition-colors">
                              <td className="py-4 px-6 font-bold text-[#543827]">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={prod.imageUrl}
                                    alt={prod.name}
                                    className="w-10 h-10 rounded-xl object-cover border border-[#dec4a6] shrink-0"
                                  />
                                  <div>
                                    <span className="text-sm font-extrabold text-[#543827]">{prod.name}</span>
                                    <span className="block text-[11px] text-[#7e5434] font-normal mb-1">
                                      {prod.description}
                                    </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {prod.variants.map((v) => (
                                        <span
                                          key={v.id}
                                          className="bg-[#f5efe6] border border-[#ebdccb] text-[#543827] px-2 py-0.5 rounded text-[10px] inline-block font-medium"
                                        >
                                          {v.name} ({formatRupiah(v.price)} | Stok: {v.stockCount})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="bg-[#ebdccb] text-[#543827] px-2.5 py-1 rounded-md font-semibold text-[10px]">
                                  {categories.find((c) => c.id === prod.categoryId)?.name || 'Katalog'}
                                </span>
                              </td>
                              <td className="py-4 px-6 font-extrabold text-[#543827]">{priceStr}</td>
                              <td className="py-4 px-6 font-bold">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    prod.totalStock > 0
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                                  }`}
                                >
                                  {prod.totalStock} Akun
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right space-x-2">
                                <button
                                  onClick={() => {
                                    setBulkTargetProductId(prod.id);
                                    if (prod.variants.length > 0) {
                                      setBulkTargetVariantId(prod.variants[0].id);
                                    }
                                    setIsBulkStockModalOpen(true);
                                  }}
                                  className="bg-[#f5efe6] hover:bg-[#ebdccb] text-[#543827] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                                >
                                  + Stok
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                                >
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PESANAN & TRANSAKSI */}
          {activeTab === 'pesanan' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#543827]">Daftar Pesanan &amp; Transaksi</h2>
                  <p className="text-xs text-[#7e5434]">Pantau riwayat pembayaran pembeli dan status lisensi.</p>
                </div>
              </div>

              <div className="bg-[#fcfaf7] rounded-3xl border border-[#ebdccb] card-shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f5efe6] border-b border-[#ebdccb] text-[#7e5434] uppercase tracking-wider text-[10px]">
                        <th className="py-4 px-6 font-extrabold">ID Pesanan</th>
                        <th className="py-4 px-6 font-extrabold">Pelanggan</th>
                        <th className="py-4 px-6 font-extrabold">Produk &amp; Varian</th>
                        <th className="py-4 px-6 font-extrabold">Total</th>
                        <th className="py-4 px-6 font-extrabold">Status</th>
                        <th className="py-4 px-6 font-extrabold">Akun Diserahkan</th>
                        <th className="py-4 px-6 font-extrabold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ebdccb] text-[#3b281a]">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 px-6 text-center text-[#9e6d42]">
                            Belum ada riwayat transaksi yang cocok.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-[#f5efe6] transition-colors">
                            <td className="py-4 px-6 font-mono font-bold text-[#543827]">
                              <Link href={`/order/${o.orderId}`} target="_blank" className="hover:underline">
                                {o.orderId}
                              </Link>
                            </td>
                            <td className="py-4 px-6">
                              <p className="font-bold text-[#543827]">{o.customerName}</p>
                              <a
                                href={`https://wa.me/${o.customerWhatsapp.replace(/^0/, '62')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-emerald-800 hover:underline"
                              >
                                {o.customerWhatsapp}
                              </a>
                            </td>
                            <td className="py-4 px-6">
                              <p className="font-semibold text-[#543827]">{o.productName}</p>
                              <span className="text-[#7e5434] text-[10px] block">{o.variantName}</span>
                            </td>
                            <td className="py-4 px-6 font-extrabold text-[#543827]">
                              {formatRupiah(o.totalPayment)}
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  o.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                    : o.status === 'pending'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-300'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {o.status === 'completed' ? 'Selesai' : o.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 max-w-xs">
                              {o.accountDelivered ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[11px] truncate text-[#543827]">
                                    {o.accountDelivered}
                                  </span>
                                  <button
                                    onClick={() => handleCopyText(o.accountDelivered!, o.orderId)}
                                    className="p-1 text-[#7e5434] hover:text-[#543827] cursor-pointer"
                                    title="Salin Akun"
                                  >
                                    {copiedOrderId === o.orderId ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[#9e6d42]">-</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <Link
                                href={`/order/${o.orderId}`}
                                target="_blank"
                                className="bg-[#f5efe6] hover:bg-[#ebdccb] text-[#543827] font-bold px-3 py-1.5 rounded-xl transition-colors inline-block"
                              >
                                Detail
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PELANGGAN */}
          {activeTab === 'pelanggan' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-[#543827]">Daftar Pelanggan Terdaftar</h2>
                <p className="text-xs text-[#7e5434]">Pengguna yang memiliki akun member di Sepia Store.</p>
              </div>

              <div className="bg-[#fcfaf7] rounded-3xl border border-[#ebdccb] card-shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f5efe6] border-b border-[#ebdccb] text-[#7e5434] uppercase tracking-wider text-[10px]">
                        <th className="py-4 px-6 font-extrabold">Nama Pelanggan</th>
                        <th className="py-4 px-6 font-extrabold">WhatsApp</th>
                        <th className="py-4 px-6 font-extrabold">Email</th>
                        <th className="py-4 px-6 font-extrabold">Tanggal Daftar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ebdccb] text-[#3b281a]">
                      {customers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 px-6 text-center text-[#9e6d42]">
                            Belum ada pelanggan yang mendaftar akun.
                          </td>
                        </tr>
                      ) : (
                        customers.map((c) => (
                          <tr key={c.id} className="hover:bg-[#f5efe6] transition-colors">
                            <td className="py-4 px-6 font-bold text-[#543827]">{c.name}</td>
                            <td className="py-4 px-6 font-mono">
                              <a
                                href={`https://wa.me/${c.whatsapp.replace(/^0/, '62')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-800 hover:underline"
                              >
                                {c.whatsapp}
                              </a>
                            </td>
                            <td className="py-4 px-6 text-[#7e5434]">{c.email || '-'}</td>
                            <td className="py-4 px-6 text-[#9e6d42]">
                              {new Date(c.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PENGATURAN */}
          {activeTab === 'pengaturan' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-[#543827]">Pengaturan Toko &amp; Pembayaran</h2>
                <p className="text-xs text-[#7e5434]">
                  Atur profil toko, nomor CS, akun gateway Pakasir API v2, dan pembebanan biaya transaksi.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
                {/* 1. Profil Toko */}
                <div className="bg-[#fcfaf7] rounded-3xl border border-[#ebdccb] card-shadow p-6 sm:p-8 space-y-5">
                  <h3 className="text-xs font-bold text-[#543827] uppercase tracking-wider">
                    1. Identitas &amp; Kontak Toko
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#543827]">Nama Toko</label>
                      <input
                        type="text"
                        value={settingsStoreName}
                        onChange={(e) => setSettingsStoreName(e.target.value)}
                        required
                        className="w-full bg-[#f5efe6] border border-[#ebdccb] rounded-xl px-4 py-2.5 text-xs text-[#543827] font-semibold focus:outline-none focus:border-[#543827]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#543827]">Nomor WhatsApp CS Resmi</label>
                      <input
                        type="tel"
                        value={settingsAdminWhatsapp}
                        onChange={(e) => setSettingsAdminWhatsapp(e.target.value)}
                        required
                        placeholder="6282323240186"
                        className="w-full bg-[#f5efe6] border border-[#ebdccb] rounded-xl px-4 py-2.5 text-xs text-[#543827] font-semibold focus:outline-none focus:border-[#543827]"
                      />
                      <p className="text-[10px] text-[#9e6d42]">Contoh: 6282323240186 (otomatis dipakai di tautan CS).</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#543827]">Teks Pengumuman Banner (Opsional)</label>
                    <input
                      type="text"
                      value={settingsAnnouncement}
                      onChange={(e) => setSettingsAnnouncement(e.target.value)}
                      placeholder="Contoh: Diskon spesial Ramadhan hemat hingga 80% untuk semua akun!"
                      className="w-full bg-[#f5efe6] border border-[#ebdccb] rounded-xl px-4 py-2.5 text-xs text-[#543827] focus:outline-none focus:border-[#543827]"
                    />
                  </div>
                </div>

                {/* 2. Biaya Transaksi QRIS (Fee Charge Mode) */}
                <div className="bg-[#fcfaf7] rounded-3xl border border-[#ebdccb] card-shadow p-6 sm:p-8 space-y-5">
                  <div>
                    <h3 className="text-xs font-bold text-[#543827] uppercase tracking-wider">
                      2. Pembebanan Biaya Layanan QRIS (Payment Fee)
                    </h3>
                    <p className="text-xs text-[#7e5434] mt-0.5">
                      Pilih pihak yang menanggung biaya transaksi QRIS.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Option: Dibebankan ke Pembeli */}
                    <div
                      onClick={() => setSettingsFeeMode('customer')}
                      className={`p-4 rounded-2xl border transition-colors cursor-pointer space-y-1.5 ${
                        settingsFeeMode === 'customer'
                          ? 'border-[#543827] bg-[#f5efe6] shadow-sm'
                          : 'border-[#ebdccb] bg-white hover:border-[#dec4a6]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#543827]">
                          Dibebankan ke Pembeli / User
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                          Aktif (Penjual Terima Bersih)
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7e5434] leading-relaxed">
                        Biaya layanan ditambahkan ke total invoice pembeli. Penjual menerima <strong>100% uang bersih</strong> tanpa potongan fee.
                      </p>
                    </div>

                    {/* Option: Ditanggung Penjual */}
                    <div
                      onClick={() => setSettingsFeeMode('merchant')}
                      className={`p-4 rounded-2xl border transition-colors cursor-pointer space-y-1.5 ${
                        settingsFeeMode === 'merchant'
                          ? 'border-[#543827] bg-[#f5efe6] shadow-sm'
                          : 'border-[#ebdccb] bg-white hover:border-[#dec4a6]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#543827]">
                          Ditanggung Penjual / Admin
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7e5434] leading-relaxed">
                        Pembeli hanya membayar harga produk murni. Biaya QRIS dipotong langsung dari keuntungan toko.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Konfigurasi QRIS Payment Gateway Mandiri (GoBiz / Dynamic QRIS) */}
                <div className="bg-[#fcfaf7] rounded-3xl border border-[#ebdccb] card-shadow p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-[#543827] uppercase tracking-wider">
                        3. Konfigurasi QRIS Gateway Mandiri (GoBiz / Dynamic QRIS)
                      </h3>
                      <p className="text-xs text-[#7e5434] mt-0.5">
                        Masukkan Endpoint Gateway URL, API Key, dan Webhook Secret Anda.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
                      QRIS v1 API
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#543827]">QRIS Gateway URL</label>
                      <input
                        type="url"
                        value={settingsQrisGatewayUrl}
                        onChange={(e) => setSettingsQrisGatewayUrl(e.target.value)}
                        placeholder="https://gomerch-beta.vercel.app"
                        className="w-full bg-[#f5efe6] border border-[#ebdccb] rounded-xl px-4 py-2.5 text-xs text-[#543827] font-semibold focus:outline-none focus:border-[#543827]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#543827]">QRIS API Key</label>
                        <input
                          type="password"
                          value={settingsQrisApiKey}
                          onChange={(e) => setSettingsQrisApiKey(e.target.value)}
                          placeholder="qris_live_..."
                          className="w-full bg-[#f5efe6] border border-[#ebdccb] rounded-xl px-4 py-2.5 text-xs text-[#543827] font-semibold focus:outline-none focus:border-[#543827]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#543827]">Webhook Signing Secret</label>
                        <input
                          type="password"
                          value={settingsQrisWebhookSecret}
                          onChange={(e) => setSettingsQrisWebhookSecret(e.target.value)}
                          placeholder="whsec_..."
                          className="w-full bg-[#f5efe6] border border-[#ebdccb] rounded-xl px-4 py-2.5 text-xs text-[#543827] font-semibold focus:outline-none focus:border-[#543827]"
                        />
                      </div>
                    </div>

                    {/* Webhook Endpoint Guide Info */}
                    <div className="p-4 rounded-2xl bg-[#f5efe6] border border-[#ebdccb] space-y-1.5">
                      <span className="text-xs font-bold text-[#543827] block">
                        URL Webhook Toko Anda:
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="text-[11px] font-mono bg-white border border-[#ebdccb] px-3 py-1.5 rounded-xl text-[#543827] flex-1 truncate select-all">
                          {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/qris` : '/api/webhooks/qris'}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/qris`);
                              showToast('Tersalin!', 'URL Webhook berhasil disalin ke clipboard.');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#543827] text-white text-xs font-bold hover:bg-[#67442d] transition-colors cursor-pointer"
                        >
                          Salin URL
                        </button>
                      </div>
                      <p className="text-[10px] text-[#9e6d42]">
                        Daftarkan URL ini di panel gateway QRIS Anda untuk menerima konfirmasi pembayaran otomatis (HMAC-SHA256 signature).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="bg-[#543827] hover:bg-[#67442d] text-[#fcfaf7] font-bold px-8 py-3.5 rounded-2xl text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>Simpan Pengaturan Toko &amp; Biaya</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* MODAL TAMBAH PRODUK & VARIAN */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2d1c13]/60 flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="bg-[#fcfaf7] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#ebdccb] relative text-[#3b281a]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f5efe6] hover:bg-[#ebdccb] flex items-center justify-center text-[#543827] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-extrabold text-[#543827] mb-4">Tambah Produk Baru</h3>

            <form onSubmit={handleAddProductSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#543827]">Nama Aplikasi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Fokus Sesi"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-[#f5efe6] border border-[#ebdccb] rounded-xl px-4 py-2.5 text-[#543827] focus:outline-none focus:border-[#543827]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-[#543827]">Kategori *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-[#f5efe6] border border-[#ebdccb] rounded-xl px-4 py-2.5 text-[#543827] focus:outline-none font-semibold cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#543827]">URL Gambar Sampul (Opsional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    className="w-full bg-[#f5efe6] border border-[#ebdccb] rounded-xl px-4 py-2.5 text-[#543827] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-[#543827]">Badge / Label (Opsional)</label>
                  <input
                    type="text"
                    placeholder="HOT, PILIHAN PENDIRI, dll."
                    value={prodBadge}
                    onChange={(e) => setProdBadge(e.target.value)}
                    className="w-full bg-[#f5efe6] border border-[#ebdccb] rounded-xl px-4 py-2.5 text-[#543827] focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#543827]">Deskripsi Singkat (Tagline) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Timer kerja fokus dengan blok jadwal..."
                  value={prodTagline}
                  onChange={(e) => setProdTagline(e.target.value)}
                  className="w-full bg-[#f5efe6] border border-[#ebdccb] rounded-xl px-4 py-2.5 text-[#543827] focus:outline-none"
                />
              </div>

              {/* VARIANT BUILDER SECTION */}
              <div className="pt-2 border-t border-[#ebdccb] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#543827] text-sm">Varian Produk (Tier / Lisensi / Durasi)</h4>
                    <p className="text-[10px] text-[#7e5434]">Tambahkan opsi variasi dengan harga dan durasi.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setModalVariants((prev) => [
                        ...prev,
                        { name: '', durationDays: 30, price: '', originalPrice: '', description: '' },
                      ])
                    }
                    className="bg-[#ebdccb] hover:bg-[#dec4a6] text-[#543827] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Varian</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {modalVariants.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-center gap-2 bg-[#f5efe6] p-3 rounded-2xl border border-[#ebdccb]"
                    >
                      <input
                        type="text"
                        placeholder="Nama Varian (Cth: Lisensi Pro)"
                        value={v.name}
                        onChange={(e) => {
                          const updated = [...modalVariants];
                          updated[idx].name = e.target.value;
                          setModalVariants(updated);
                        }}
                        className="flex-1 bg-white border border-[#ebdccb] rounded-xl px-3 py-2 text-[#543827] focus:outline-none text-xs w-full sm:w-auto"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Harga (Rp)"
                        value={v.price}
                        onChange={(e) => {
                          const updated = [...modalVariants];
                          updated[idx].price = Number(e.target.value);
                          setModalVariants(updated);
                        }}
                        className="w-full sm:w-28 bg-white border border-[#ebdccb] rounded-xl px-3 py-2 text-[#543827] focus:outline-none text-xs"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Durasi Hari"
                        value={v.durationDays}
                        onChange={(e) => {
                          const updated = [...modalVariants];
                          updated[idx].durationDays = Number(e.target.value);
                          setModalVariants(updated);
                        }}
                        className="w-full sm:w-24 bg-white border border-[#ebdccb] rounded-xl px-3 py-2 text-[#543827] focus:outline-none text-xs"
                        required
                      />
                      {modalVariants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setModalVariants((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-rose-600 hover:text-rose-800 p-2 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#ebdccb] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="bg-[#ebdccb] hover:bg-[#dec4a6] text-[#543827] font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="bg-[#543827] hover:bg-[#67442d] text-[#fcfaf7] font-bold px-6 py-2.5 rounded-xl transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Simpan Produk &amp; Varian</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BULK STOK (email|password|catatan) */}
      {isBulkStockModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2d1c13]/60 flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="bg-[#fcfaf7] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#ebdccb] relative text-[#3b281a]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsBulkStockModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f5efe6] hover:bg-[#ebdccb] flex items-center justify-center text-[#543827] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-extrabold text-[#543827] mb-1">
              Bulk Tambah Stok (email|password|catatan)
            </h3>
            <p className="text-xs text-[#7e5434] mb-4">
              Paste daftar akun/stok per baris. Sistem otomatis memparsing format dan menambahkannya ke produk &amp; varian terpilih.
            </p>

            <div className="space-y-4 text-xs">
              {/* Target Product & Variant Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f5efe6] p-4 rounded-2xl border border-[#ebdccb]">
                <div className="space-y-1">
                  <label className="font-bold text-[#543827]">Pilih Produk Target</label>
                  <select
                    value={bulkTargetProductId}
                    onChange={(e) => {
                      const pId = e.target.value;
                      setBulkTargetProductId(pId);
                      const prod = products.find((p) => p.id === pId);
                      if (prod && prod.variants.length > 0) {
                        setBulkTargetVariantId(prod.variants[0].id);
                      }
                    }}
                    className="w-full bg-white border border-[#ebdccb] rounded-xl px-3 py-2 text-[#543827] font-semibold focus:outline-none cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#543827]">Pilih Varian Target</label>
                  <select
                    value={bulkTargetVariantId}
                    onChange={(e) => setBulkTargetVariantId(e.target.value)}
                    className="w-full bg-white border border-[#ebdccb] rounded-xl px-3 py-2 text-[#543827] font-semibold focus:outline-none cursor-pointer"
                  >
                    {variants
                      .filter((v) => v.productId === bulkTargetProductId)
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} (Stok Saat Ini: {v.stockCount})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Textarea input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#543827]">Format Data (1 baris = 1 akun)</label>
                  <span className="text-[10px] text-[#9e6d42] font-mono">email|password|catatan</span>
                </div>
                <textarea
                  rows={6}
                  placeholder={`user1@gmail.com|rahasia123|Lisensi Pro Lifetime\nuser2@gmail.com|sandi456|Lisensi Pro Lifetime`}
                  value={bulkRawText}
                  onChange={(e) => setBulkRawText(e.target.value)}
                  className="w-full font-mono bg-white border border-[#ebdccb] rounded-2xl p-3 text-[#543827] focus:outline-none leading-relaxed text-xs"
                />
              </div>

              {/* Preview Box */}
              <div className="bg-[#f5efe6] p-4 rounded-2xl border border-[#ebdccb] space-y-2">
                <div className="flex items-center justify-between font-bold text-[#543827]">
                  <span>Hasil Parsing Data</span>
                  <span className="bg-[#543827] text-[#fcfaf7] px-2.5 py-0.5 rounded-full text-[10px]">
                    {parsedBulkAccounts.length} Data Valid
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 font-mono text-[11px] text-[#7e5434]">
                  {parsedBulkAccounts.length === 0 ? (
                    <p className="text-[#9e6d42] italic">Belum ada data valid yang terdeteksi...</p>
                  ) : (
                    parsedBulkAccounts.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-2 rounded-lg border border-[#ebdccb] flex items-center justify-between gap-2"
                      >
                        <span className="truncate">
                          <b>#{idx + 1}</b> {item.email} | {item.password}
                        </span>
                        <span className="text-[#9e6d42] shrink-0">[{item.catatan}]</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[#ebdccb] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBulkStockModalOpen(false)}
                  className="bg-[#ebdccb] hover:bg-[#dec4a6] text-[#543827] font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulkStock}
                  disabled={isSubmittingBulkStock}
                  className="bg-[#543827] hover:bg-[#67442d] text-[#fcfaf7] font-bold px-6 py-2.5 rounded-xl transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingBulkStock ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Tambahkan Stok Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
