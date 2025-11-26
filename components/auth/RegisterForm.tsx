'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRegister } from '@/lib/api/queries/useAuth';
import { registerSchema, type RegisterFormData } from '@/lib/schemas/authSchema';
import { UserRole } from '@/types/entities/User';

interface RegisterFormProps {
  locale: string;
}

export function RegisterForm({ locale }: RegisterFormProps) {
  const t = useTranslations('auth');
  const router = useRouter();

  const { mutate: register, isPending } = useRegister();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.DOCTOR,
      specialization: '',
      license_number: '',
      phone_number: '',
    },
  });

  const selectedRole = form.watch('role');

  const onSubmit = (data: RegisterFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword: _confirmPassword, ...registerData } = data;
    
    register(registerData, {
      onSuccess: (response) => {
        toast.success(t('registerSuccess'));
        
        // Redirect based on user role
        if (response.user.role === UserRole.ADMIN) {
          router.push(`/${locale}/admin/dashboard`);
        } else if (response.user.role === UserRole.DOCTOR) {
          router.push(`/${locale}/doctor/dashboard`);
        } else {
          router.push(`/${locale}/`);
        }
      },
      onError: (error) => {
        toast.error(error.message || t('registerError'));
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
          {t('register')}
        </h1>
        <p className="text-muted-foreground">{t('registerSubtitle')}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('username')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="dr_ahmed"
                    autoComplete="username"
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
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('role')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectRole')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UserRole.DOCTOR}>
                      {t('roleDoctor')}
                    </SelectItem>
                    <SelectItem value={UserRole.ADMIN}>
                      {t('roleAdmin')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedRole === UserRole.DOCTOR && (
            <>
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('specialization')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('specializationPlaceholder')}
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
                name="license_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('licenseNumber')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MD-12345"
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
                name="clinic_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clinic')}</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectClinic')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">{t('clinicInternal')}</SelectItem>
                        <SelectItem value="2">{t('clinicOrtho')}</SelectItem>
                        <SelectItem value="3">{t('clinicPediatrics')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phoneNumber')}</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="01234567890"
                    autoComplete="tel"
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
                    autoComplete="new-password"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t('passwordRequirements')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('confirmPassword')}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-medical-primary hover:bg-medical-primary/90"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('registering')}
              </>
            ) : (
              t('register')
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">{t('haveAccount')} </span>
        <Link
          href={`/${locale}/login`}
          className="text-medical-primary hover:underline"
        >
          {t('login')}
        </Link>
      </div>
    </div>
  );
}
