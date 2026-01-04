import '@/app/global.css';
import type { Metadata } from "next";
import { RootProvider } from 'fumadocs-ui/provider';
import { Space_Grotesk } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Praktikum",
  description: "Presensi dan modul pembelajaran.",
  applicationName: "Praktikum",
  openGraph: {
    title: "Praktikum",
    description: "Presensi dan modul pembelajaran.",
    siteName: "Praktikum",
    type: "website",
    url: siteUrl,
    images: [
      {
        url: "/og-images.webp",
        alt: "Praktikum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Praktikum",
    description: "Presensi dan modul pembelajaran.",
    images: ["/og-images.webp"],
  },
};

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className={spaceGrotesk.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-fd-background text-fd-foreground antialiased">
        <RootProvider>
          {children}
          <Toaster />
        </RootProvider>
      </body>
    </html>
  );
}
