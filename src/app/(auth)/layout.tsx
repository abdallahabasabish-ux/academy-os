import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Cairo } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const cairo = Cairo({ subsets: ['arabic'], display: 'swap', variable: '--font-cairo' });

export const metadata: Metadata = {
  title: 'Academy OS',
  description: 'Multi-tenant Academy Operating System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${cairo.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
