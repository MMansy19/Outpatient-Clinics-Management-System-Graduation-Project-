import type { Metadata, Viewport } from 'next';
import { Inter, Cairo } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CodeBlue - Outpatient Clinic Management System',
  description: 'Kasr Al Ainy Hospital - Smart Clinical Companion',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CodeBlue',
  },
};

export const viewport: Viewport = {
  themeColor: '#10B981',
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  // Get locale from params if available (for nested routes)
  const { locale = 'en' } = await params;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const fontClass = locale === 'ar' ? 'font-arabic' : 'font-sans';
  
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${inter.variable} ${cairo.variable} ${fontClass}`}>
        {children}
      </body>
    </html>
  );
}
