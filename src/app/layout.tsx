import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sepia Store | Toko Akun Aplikasi Premium Instan & Legal',
  description: 'Toko online penyedia langganan akun aplikasi premium resmi (Netflix, Spotify, Canva Pro, YouTube, ChatGPT Plus) dengan pengiriman otomatis dan garansi full.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="bg-[#09090b] text-[#f4f4f5] flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  );
}
