'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Loader2, Eye, EyeOff } from 'lucide-react';
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
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

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
        toast.success(
          toastMessages.auth.loginSuccess,
          `${toastMessages.auth.loginSuccessDescription} Welcome, ${response.name}!`
        );

        // Mark login timestamp so the 401 interceptor doesn't redirect
        // during the grace period while the Set-Cookie is being processed.
        sessionStorage.setItem('login-timestamp', String(Date.now()));

        // Redirect based on user role
        const redirectParam = searchParams.get('redirect');

        // Determine the default redirect for this role
        const roleRedirects: Record<number, string> = {
          [Role.SUPER_ADMIN]: `/${locale}/super-admin/dashboard`,
          [Role.ADMIN]: `/${locale}/doctor/dashboard`,
          [Role.DOCTOR]: `/${locale}/doctor/dashboard`,
        };
        const defaultRedirect = roleRedirects[response.role] ?? `/${locale}/`;

        // Only honour the redirect param if the target page belongs to
        // the user's role scope. This prevents e.g. a super-admin from
        // being sent to /doctor/dashboard via a stale ?redirect= param.
        const rolePathPrefixes: Record<number, string[]> = {
          [Role.SUPER_ADMIN]: ['/super-admin/', '/admin/'],
          [Role.ADMIN]: ['/admin/', '/doctor/'],
          [Role.DOCTOR]: ['/doctor/'],
        };
        const allowedPrefixes = rolePathPrefixes[response.role] ?? [];

        let redirectPath: string;
        if (
          redirectParam &&
          allowedPrefixes.some((prefix) => redirectParam.includes(prefix))
        ) {
          redirectPath = redirectParam;
        } else {
          redirectPath = defaultRedirect;
        }

        // Use hard navigation to ensure the browser fully processes the
        // Set-Cookie header from the login response before the new page
        // fires any API requests that depend on the JWT cookie.
        window.location.href = redirectPath;
      },
      onError: (error: unknown) => {
        const message =
          error &&
          typeof error === 'object' &&
          'response' in error &&
          error.response &&
          typeof error.response === 'object' &&
          'data' in error.response &&
          error.response.data &&
          typeof error.response.data === 'object' &&
          'message' in error.response.data &&
          typeof error.response.data.message === 'string'
            ? error.response.data.message
            : toastMessages.auth.loginErrorDescription;
        toast.error(toastMessages.auth.loginError, message);
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
                <FormLabel required>{t('email')}</FormLabel>
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
                <FormLabel required>{t('password')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={isPending}
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
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
    </div>
  );
}
