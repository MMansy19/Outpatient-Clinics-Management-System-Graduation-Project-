import { RegisterForm } from '@/components/auth/RegisterForm';
import { GuestGuard } from '@/components/auth/GuestGuard';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/button';
import { FlaskConical } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface RegisterPageProps {
  params: Promise<{ locale: string }>;
}

export default async function RegisterPage(props: RegisterPageProps) {
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
        <Link href={`/${locale}/api-test`}>
          <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm" title="API Test">
            <FlaskConical className="h-5 w-5 text-white" />
          </Button>
        </Link>
        <ThemeToggle />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <RegisterForm locale={locale} />
      </div>
    </main>
    </GuestGuard>
  );
}
