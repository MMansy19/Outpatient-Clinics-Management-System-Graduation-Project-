import { RegisterForm } from '@/components/auth/RegisterForm';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import Image from 'next/image';

interface RegisterPageProps {
  params: Promise<{ locale: string }>;
}

export default async function RegisterPage(props: RegisterPageProps) {
  const params = await props.params;
  const { locale } = params;
  return (
    <main className="relative flex min-h-screen items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg-chatgpt.png"
          alt="Medical Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>
      
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <RegisterForm locale={locale} />
      </div>
    </main>
  );
}
