import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // This now corresponds to the `[locale]` segment
  let locale = await requestLocale;
  
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'Africa/Cairo',
    now: new Date(),
  };
});
