import '@/app/global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  subsets: ['latin'],
});

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Praktikum ASD Algoritma dan Struktur Data ITERA Kelas RD',
    url: 'https://praktikum-asd-rd.vercel.app',
    logo: 'https://praktikum-asd-rd.vercel.app/logo.png',
    department: {
      '@type': 'CollegeOrUniversity',
      name: 'Institut Teknologi Sumatera',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Praktikum Algoritma dan Struktur Data Kelas RD',
    url: 'https://praktikum-asd-rd.vercel.app',
    inLanguage: 'id-ID',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://praktikum-asd-rd.vercel.app/api/search?query={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
];

// Metadata untuk halaman (App Router)
export const metadata: Metadata = {
  title: 'Praktikum Algoritma dan Struktur DataKelas RD',
  description: 'Dokumentasi resmi praktikum Algoritma dan Struktur Data ITERA Kelas RD untuk mahasiswa Program Studi Teknik Informatika Institut Teknologi Sumatera.',
  metadataBase: new URL('https://praktikum-asd-rd.vercel.app'),
  keywords: ['ASD', 'Praktikum', 'Teknik Informatika', 'Algoritma dan Struktur Data', 'ITERA', 'Institut Teknologi Sumatera', 'Kelas RD'],
  authors: [{ name: 'Program Studi Teknik Informatika ITERA', url: 'https://itera.ac.id' }],
  creator: 'Tim Praktikum ASD ITERA Kelas RD',
  category: 'Education',
  alternates: {
    canonical: 'https://praktikum-asd-rd.vercel.app',
  },
  openGraph: {
    title: 'Praktikum ASD Algoritma dan Struktur Data ITERA Kelas RD',
    description: 'Dokumentasi praktikum Algoritma dan Struktur Data ITERA Kelas RD untuk mahasiswa Teknik Informatika.',
    url: 'https://praktikum-asd-rd.vercel.app',
    siteName: 'Praktikum ASD ITERA',
    images: [
      {
        url: 'https://praktikum-asd-rd.vercel.app/logo.png', // pastikan logo tersedia di public/
        width: 1200,
        height: 630,
        alt: 'Logo Praktikum ASD ITERA',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Praktikum ASD Algoritma dan Struktur Data ITERA Kelas RD',
    description: 'Dokumentasi praktikum Algoritma dan Struktur Data ITERA Kelas RD untuk mahasiswa Teknik Informatika.',
    images: ['https://praktikum-asd-rd.vercel.app/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
  },
  verification: {
    google: '1KI_k0smkrnjh8xv7tnvvsSeD9YGTbZPnxJBtKveNSE',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className={inter.className} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="1KI_k0smkrnjh8xv7tnvvsSeD9YGTbZPnxJBtKveNSE" />
        <link rel="icon" href="/logo.png" sizes="any" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://praktikum-asd-rd.vercel.app" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
