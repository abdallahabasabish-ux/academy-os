// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css'; // سيتم إنشاؤه لاحقاً

// تحميل الخط الإنجليزي (Inter) من Google Fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // يضمن ظهور النص بسرعة بخط احتياطي ثم استبداله
  variable: '--font-inter', // متغير CSS لاستخدامه في Tailwind
  weight: ['400', '500', '600', '700'],
});

// تحميل الخط العربي (Cairo) من ملف محلي أو Google
import { Cairo } from 'next/font/google';
const cairo = Cairo({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-cairo',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Academy OS',
  description: 'Multi-tenant Academy Operating System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${cairo.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
