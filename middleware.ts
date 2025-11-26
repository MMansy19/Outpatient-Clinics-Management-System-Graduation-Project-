import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: true,
});

export const config = {
  matcher: ['/', '/(ar|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
