import { LoginForm } from '@/components/auth/LoginForm';
import { GuestGuard } from '@/components/auth/GuestGuard';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import Image from 'next/image';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LoginPage(props: LoginPageProps) {
  const params = await props.params;
  const { locale } = params;
  return (
    <GuestGuard locale={locale}>
    <main className="relative flex min-h-screen items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg-gemini.png"
          alt="Medical Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>
      
      {/* Header Actions */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <ThemeToggle />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <LoginForm locale={locale} />
      </div>
    </main>
    </GuestGuard>
  );
}
