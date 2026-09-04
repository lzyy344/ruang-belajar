import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/ui/Providers';
import '../styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ruang Belajar - Platform Belajar Cerdas dengan AI',
  description: 'Belajar lebih efisien dengan ringkasan AI, kuis otomatis, dan asisten belajar pintar',
  keywords: ['belajar', 'AI', 'ringkasan', 'kuis', 'pomodoro', 'edukasi'],
  authors: [{ name: 'Ruang Belajar Team' }],
  openGraph: {
    title: 'Ruang Belajar',
    description: 'Platform belajar cerdas dengan AI',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Ruang Belajar',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}