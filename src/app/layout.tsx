import '@/app/global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  subsets: ['latin'],
});

// Metadata untuk halaman (App Router)
export const metadata = {
  title: 'Praktikum ASD RD',
  description: 'Dokumentasi praktikum ASD RD  untuk mahasiswa Teknik Informatika.',
  keywords: ['ASD', 'RD', 'Praktikum', 'Teknik Informatika'],
  authors: [{ name: 'Prodi Teknik Informatika' }],
  openGraph: {
    title: 'Praktikum ASD RD',
    description: 'Dokumentasi praktikum ASD RD untuk mata kuliah Algoritma dan Struktur Data.',
    url: 'https://praktikum-asd-rd.vercel.app', 
    siteName: 'Praktikum ASD RD',
    images: [
      {
        url: '/logo.png', // pastikan logo tersedia di public/
        width: 1200,
        height: 630,
        alt: 'Logo Praktikum ASD RD',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Praktikum ASD RD',
    description: 'Dokumentasi praktikum ASD RD untuk mata kuliah Algoritma dan Struktur Data.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/logo.png',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className={inter.className} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="1KI_k0smkrnjh8xv7tnvvsSeD9YGTbZPnxJBtKveNSE" />
        <link rel="icon" href="/logo.png" sizes="any" />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
        <Analytics />
      </body>
    </html>
  );
}