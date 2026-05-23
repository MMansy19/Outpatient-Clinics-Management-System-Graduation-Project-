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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medistream-ocms.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MediStream OCMS - Smart Clinical Companion for Kasr Al Ainy Hospital',
    template: '%s | MediStream OCMS',
  },
  description: 'Transform healthcare with MediStream OCMS - AI-powered patient management, seamless medical records, and instant clinical decisions. Smart Outpatient Clinic Management System for Kasr Al Ainy Hospital, Cairo University.',
  keywords: [
    'MediStream',
    'OCMS',
    'Outpatient Clinic Management',
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
    'Medical History',
    'Healthcare Solutions',
  ],
  authors: [{ name: 'MediStream Team', url: siteUrl }],
  creator: 'MediStream Team - Cairo University',
  publisher: 'Cairo University',
  applicationName: 'MediStream OCMS',
  referrer: 'origin-when-cross-origin',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Outpatient Clinic',
    startupImage: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_EG',
    url: siteUrl,
    siteName: 'MediStream OCMS',
    title: 'MediStream OCMS - Smart Clinical Companion for Kasr Al Ainy Hospital',
    description: 'Transform healthcare with AI-powered patient management, seamless medical records, and instant clinical decisions. Comprehensive outpatient clinic management for better patient care.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MediStream OCMS - Smart Clinical Companion',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@MediStreamOCMS',
    creator: '@MediStreamOCMS',
    title: 'MediStream OCMS - Smart Clinical Companion',
    description: 'Transform healthcare with AI-powered patient management and clinical decision support.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'ar-EG': '/ar',
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here after claiming your site
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  category: 'Healthcare Technology',
  classification: 'Healthcare Management System',
  other: {
    'application-name': 'MediStream OCMS',
    'apple-mobile-web-app-title': 'MediStream',
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
  
  // Structured Data (JSON-LD) for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': siteUrl,
    name: 'MediStream OCMS',
    alternateName: 'MediStream Outpatient Clinic Management System',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/og-image.png`,
    description: 'Smart Outpatient Clinic Management System for Kasr Al Ainy Hospital. AI-powered patient management, seamless medical records, and instant clinical decisions.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Al-Manial',
      addressLocality: 'Cairo',
      addressRegion: 'Cairo Governorate',
      postalCode: '11559',
      addressCountry: 'EG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 30.0131,
      longitude: 31.2312,
    },
    telephone: '+20-2-23654321',
    email: 'info@medistream-ocms.com',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    provider: {
      '@type': 'Organization',
      name: 'Cairo University',
      url: 'https://cu.edu.eg',
    },
    medicalSpecialty: [
      'GeneralMedicine',
      'Cardiology',
      'Pediatrics',
      'FamilyMedicine',
      'InternalMedicine',
    ],
    availableService: [
      {
        '@type': 'MedicalProcedure',
        name: 'Patient Registration',
        description: 'Digital patient registration and management',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Electronic Medical Records',
        description: 'Comprehensive electronic health records management',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Clinical Decision Support',
        description: 'AI-powered clinical decision support system',
      },
    ],
    sameAs: [
      'https://www.linkedin.com/company/medistream-ocms',
      'https://twitter.com/MediStreamOCMS',
    ],
  };
  
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className={`${inter.variable} ${cairo.variable} ${fontClass}`}>
        {children}
      </body>
    </html>
  );
}
