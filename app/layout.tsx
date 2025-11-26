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
  title: {
    default: 'CodeBlue - Smart Clinical Companion for Kasr Al Ainy Hospital',
    template: '%s | CodeBlue',
  },
  description: 'Transform healthcare with CodeBlue - AI-powered patient management, seamless medical records, and instant clinical decisions. Smart Clinical Companion for Kasr Al Ainy Hospital, Cairo University.',
  keywords: [
    'CodeBlue',
    'Kasr Al Ainy Hospital',
    'Cairo University',
    'Electronic Medical Records',
    'EMR',
    'EHR',
    'Healthcare Management',
    'Patient Management System',
    'Clinical Decision Support',
    'Medical Records',
    'Hospital Management',
    'Healthcare Technology',
    'HealthTech',
    'Egypt Healthcare',
    'Medical Software',
    'Clinic Management',
    'Doctor Portal',
    'Patient Portal',
    'HIPAA Compliant',
  ],
  authors: [{ name: 'CodeBlue Team', url: 'https://codeblue.eg' }],
  creator: 'CodeBlue Team - Cairo University',
  publisher: 'Cairo University',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo-chatgpt.png', sizes: 'any' },
      { url: '/logo-chatgpt.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/logo-chatgpt.png',
    shortcut: '/logo-chatgpt.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CodeBlue',
    startupImage: '/logo-chatgpt.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_EG',
    url: 'https://codeblue.eg',
    siteName: 'CodeBlue',
    title: 'CodeBlue - Smart Clinical Companion for Kasr Al Ainy Hospital',
    description: 'Transform healthcare with AI-powered patient management, seamless medical records, and instant clinical decisions.',
    images: [
      {
        url: '/logo-chatgpt.png',
        width: 1200,
        height: 630,
        alt: 'CodeBlue - Smart Clinical Companion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeBlue - Smart Clinical Companion',
    description: 'Transform healthcare with AI-powered patient management and clinical decision support.',
    images: ['/logo-chatgpt.png'],
    creator: '@CodeBlueEG',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'Healthcare Technology',
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
