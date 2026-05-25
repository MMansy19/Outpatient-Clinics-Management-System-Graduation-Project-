'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
} from 'lucide-react';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer');

  const quickLinks = [
    { href: `/${locale}`, label: t('links.home') },
    { href: `/${locale}#clinics`, label: t('links.clinics') },
    { href: `/${locale}#doctors`, label: t('links.doctors') },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer 
      className="bg-gray-900 dark:bg-gray-950 text-gray-300 pt-16 pb-8"
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href={`/${locale}`} className="flex items-center space-x-3">
              <div className="relative w-20 h-20">
                <Image
                  src="/logo.png"
                  alt="Outpatient Clinic Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white">
                Outpatient Clinic
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('description')}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {t('contact.title')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start text-sm">
                <MapPin className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  {t('contact.address')}
                </span>
              </li>
              <li className="flex items-center text-sm">
                <Phone className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                <a 
                  href="tel:+20223648603" 
                  className="text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  +20 2 2364 8603
                </a>
              </li>
              <li className="flex items-center text-sm">
                <Mail className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                <a 
                  href="mailto:info@codeblue.eg" 
                  className="text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  info@codeblue.eg
                </a>
              </li>
            </ul>
          </div>

          {/* Team Credits */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {t('team.title')}
            </h3>
            <p className="text-sm text-gray-400 mb-3 leading-relaxed">
              {t('team.subtitle')}
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Cairo University</li>
              <li>• Faculty of Engineering</li>
              <li>• Biomedical Data Engineering Dept.</li>
              <li>• Graduation Project 2026</li>
            </ul>
          </div>
        </div>

        {/* Privacy & Terms */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-6 text-sm">
              <Link 
                href={`/${locale}/privacy`}
                className="text-gray-400 hover:text-emerald-400 transition-colors"
              >
                {t('privacy')}
              </Link>
              <Link 
                href={`/${locale}/terms`}
                className="text-gray-400 hover:text-emerald-400 transition-colors"
              >
                {t('terms')}
              </Link>
              <Link 
                href={`/${locale}/hipaa`}
                className="text-gray-400 hover:text-emerald-400 transition-colors"
              >
                {t('hipaa')}
              </Link>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <span>{t('secured')}</span>
              <Heart className="w-4 h-4 text-red-500 mx-2 fill-current" />
              <span>HIPAA Compliant</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {t('copyright')}</p>
          <p className="mt-2">{t('allRights')}</p>
        </div>
      </div>
    </footer>
  );
}
