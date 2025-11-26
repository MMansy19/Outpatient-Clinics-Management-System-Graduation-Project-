import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Locale } from '@/i18n';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isRTL: boolean;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      isRTL: false,

      setLocale: (locale) =>
        set({
          locale,
          isRTL: locale === 'ar',
        }),
    }),
    {
      name: 'codeblue-locale',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
