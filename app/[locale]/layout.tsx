import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { Providers } from './providers';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  
  const isArabic = locale === 'ar';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medistream-ocms.vercel.app';
  
  return {
    title: isArabic 
      ? 'ميدي ستريم OCMS - الرفيق السريري الذكي لمستشفى قصر العيني'
      : 'MediStream OCMS - Smart Clinical Companion for Kasr Al Ainy Hospital',
    description: isArabic
      ? 'حوّل الرعاية الصحية مع ميدي ستريم OCMS - إدارة المرضى المدعومة بالذكاء الاصطناعي، والسجلات الطبية السلسة، والقرارات السريرية الفورية. نظام إدارة العيادات الخارجية الذكي لمستشفى قصر العيني، جامعة القاهرة.'
      : 'Transform healthcare with MediStream OCMS - AI-powered patient management, seamless medical records, and instant clinical decisions. Smart Outpatient Clinic Management System for Kasr Al Ainy Hospital, Cairo University.',
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        'en-US': `${siteUrl}/en`,
        'ar-EG': `${siteUrl}/ar`,
      },
    },
    openGraph: {
      locale: isArabic ? 'ar_EG' : 'en_US',
      url: `${siteUrl}/${locale}`,
      title: isArabic 
        ? 'ميدي ستريم OCMS - الرفيق السريري الذكي'
        : 'MediStream OCMS - Smart Clinical Companion',
      description: isArabic
        ? 'حوّل الرعاية الصحية بالذكاء الاصطناعي وإدارة المرضى'
        : 'Transform healthcare with AI-powered patient management',
      type: 'website',
      siteName: 'MediStream OCMS',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  if (!locales.includes(locale as never)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>{children}</Providers>
    </NextIntlClientProvider>
  );
}
