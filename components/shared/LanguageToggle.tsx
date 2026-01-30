'use client';

import { Globe } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface LanguageToggleProps {
  locale: string;
  variant?: 'outline' | 'ghost' | 'default';
  size?: 'icon' | 'sm' | 'default';
  className?: string;
}

export function LanguageToggle({
  locale,
  variant = 'outline',
  size = 'icon',
  className = '',
}: LanguageToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    const path = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(path);
  };

  if (!mounted) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Globe className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle language</span>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleLanguage}
      className={className}
      title="Toggle Language (English/العربية)"
    >
      <Globe className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Toggle language</span>
    </Button>
  );
}
