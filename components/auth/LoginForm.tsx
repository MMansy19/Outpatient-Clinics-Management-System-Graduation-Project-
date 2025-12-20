'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { toast, toastMessages } from '@/lib/utils/toast';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/lib/api/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth.schemas';
import { Role } from '@/lib/api/types';

interface LoginFormProps {
  locale: string;
}

export function LoginForm({ locale }: LoginFormProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();

  const { mutate: login, isPending } = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: (response) => {
        console.log('✅ Login Response:', response);
        console.log('📋 User Details:', {
          name: response.name,
          role: response.role,
          language: response.language
        });
        
        toast.success(
          toastMessages.auth.loginSuccess,
          `${toastMessages.auth.loginSuccessDescription} Welcome, ${response.name}!`
        );
        
        // Redirect based on user role
        const redirectParam = searchParams.get('redirect');
        let redirectPath = redirectParam;
        
        if (!redirectPath) {
          // Default redirects based on role
          switch (response.role) {
            case Role.SUPER_ADMIN:
            case Role.ADMIN:
              redirectPath = `/${locale}/admin/dashboard`;
              console.log('🔄 Redirecting to Admin Dashboard:', redirectPath);
              break;
            case Role.DOCTOR:
              redirectPath = `/${locale}/doctor/dashboard`;
              console.log('🔄 Redirecting to Doctor Dashboard:', redirectPath);
              break;
            default:
              redirectPath = `/${locale}/`;
              console.log('🔄 Redirecting to Home:', redirectPath);
          }
        } else {
          console.log('🔄 Redirecting to:', redirectPath);
        }
        
        router.push(redirectPath);
      },
      onError: (error: unknown) => {
        console.error('❌ Login Error:', error);
        const message = (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data && typeof error.response.data.message === 'string') ? error.response.data.message : toastMessages.auth.loginErrorDescription;
        toast.error(
          toastMessages.auth.loginError,
          message
        );
      },
    });
  };

  return (
    <div className="medical-card w-full md:w-[380px] max-w-md space-y-6 dark:bg-black/40 bg-white/80 backdrop-blur-md shadow-2xl">
      <div className="space-y-4 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative h-32 w-32">
            <Image
              src="/logo-chatgpt.png"
              alt="CodeBlue Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-medical-primary">
          {t('login')}
        </h1>
        <p className="text-muted-foreground">{t('loginSubtitle')}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="doctor@kasralainy.edu.eg"
                    autoComplete="email"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('password')}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* TODO: Implement forgot password functionality in Phase 5 */}
          {/* <div className="flex items-center justify-end">
            <Link
              href={`/${locale}/forgot-password`}
              className="text-sm text-medical-primary hover:underline"
            >
              {t('forgotPassword')}
            </Link>
          </div> */}

          <Button
            type="submit"
            className="w-full bg-medical-primary hover:bg-medical-primary/90"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('loggingIn')}
              </>
            ) : (
              t('login')
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">{t('noAccount')} </span>
        <Link
          href={`/${locale}/register`}
          className="text-medical-primary hover:underline"
        >
          {t('register')}
        </Link>
      </div>
    </div>
  );
}
