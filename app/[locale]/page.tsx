import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('common');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="medical-card max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-medical-primary">
          {t('appName')}
        </h1>
        <p className="text-lg text-muted-foreground">
          Kasr Al Ainy Hospital - Smart Clinical Companion
        </p>
        <div className="mt-8 space-y-4">
          <div className="medical-badge-stable">
            ✓ Phase 1 Setup Complete
          </div>
          <p className="text-sm">
            Next.js 15 + TypeScript + Shadcn UI + Tailwind CSS + React Query + Zustand
          </p>
        </div>
      </div>
    </main>
  );
}
