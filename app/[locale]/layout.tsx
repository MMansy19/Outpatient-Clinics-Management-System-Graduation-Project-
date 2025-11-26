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
  
  return {
    title: isArabic 
      ? 'كود بلو - الرفيق السريري الذكي لمستشفى قصر العيني'
      : 'CodeBlue - Smart Clinical Companion for Kasr Al Ainy Hospital',
    description: isArabic
      ? 'حوّل الرعاية الصحية مع كود بلو - إدارة المرضى المدعومة بالذكاء الاصطناعي، والسجلات الطبية السلسة، والقرارات السريرية الفورية. الرفيق السريري الذكي لمستشفى قصر العيني، جامعة القاهرة.'
      : 'Transform healthcare with CodeBlue - AI-powered patient management, seamless medical records, and instant clinical decisions. Smart Clinical Companion for Kasr Al Ainy Hospital, Cairo University.',
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        ar: '/ar',
      },
    },
    openGraph: {
      locale: isArabic ? 'ar_EG' : 'en_US',
      title: isArabic 
        ? 'كود بلو - الرفيق السريري الذكي'
        : 'CodeBlue - Smart Clinical Companion',
      description: isArabic
        ? 'حوّل الرعاية الصحية بالذكاء الاصطناعي وإدارة المرضى'
        : 'Transform healthcare with AI-powered patient management',
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
