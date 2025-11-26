'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useRouter, usePathname } from 'next/navigation';

interface NavbarProps {
  locale: string;
}

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    const path = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(path);
  };

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}#clinics`, label: t('clinics') },
    { href: `/${locale}#doctors`, label: t('doctors') },
    { href: `/${locale}#partners`, label: t('partners') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <Image
                src="/logo-chatgpt.png"
                alt="CodeBlue Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              CodeBlue
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span>{locale === 'en' ? 'العربية' : 'English'}</span>
            </Button>

            <ThemeToggle />

            <Link href={`/${locale}/login`}>
              <Button variant="ghost" size="sm">
                {t('login')}
              </Button>
            </Link>

            <Link href={`/${locale}/register`}>
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                {t('register')}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium px-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    toggleLanguage();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {locale === 'en' ? 'العربية' : 'English'}
                </Button>

                <Link href={`/${locale}/login`} className="block">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('login')}
                  </Button>
                </Link>

                <Link href={`/${locale}/register`} className="block">
                  <Button 
                    size="sm" 
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('register')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
