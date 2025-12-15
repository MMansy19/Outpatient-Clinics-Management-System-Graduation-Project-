# 🚀 Frontend-Backend Integration Implementation Guide

## Overview
This document provides step-by-step instructions for integrating the GP-Frontend (Next.js) with the CodeBlue backend APIs, transitioning from mock data to production cookie-based authentication.

---

## 📋 Prerequisites

### 1. Environment Setup
Create/update `.env.local` in the root of `GP-Frontend`:

```env
# Backend API Base URL
NEXT_PUBLIC_API_BASE_URL=https://api-gateway.yellowgrass-a3ce385a.westeurope.azurecontainerapps.io/api/v1

# Development mode
NODE_ENV=development
```

### 2. Install Dependencies
```bash
cd GP-Frontend
pnpm install
```

**Verify required packages**:
- `axios` - HTTP client
- `@tanstack/react-query` - Data fetching and caching
- `zustand` - State management
- `zod` - Schema validation
- `react-hook-form` - Form management
- `@hookform/resolvers` - Zod integration

---

## 🔧 Implementation Steps

### Step 1: Update LoginForm Component

**File**: `components/auth/LoginForm.tsx`

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
        toast.success(t('loginSuccess') || 'Login successful');
        
        // Redirect based on role
        const redirectPath = (() => {
          switch (response.role) {
            case Role.SUPER_ADMIN:
            case Role.ADMIN:
              return `/${locale}/admin/dashboard`;
            case Role.DOCTOR:
              return `/${locale}/doctor/dashboard`;
            default:
              return `/${locale}/`;
          }
        })();
        
        router.push(redirectPath);
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || t('loginError') || 'Login failed';
        toast.error(message);
      },
    });
  };

  return (
    <div className="medical-card w-full md:w-[380px] max-w-md space-y-6">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold text-medical-primary">
          {t('login') || 'Login'}
        </h1>
        <p className="text-muted-foreground">
          {t('loginSubtitle') || 'Sign in to your account'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email') || 'Email'}</FormLabel>
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
                <FormLabel>{t('password') || 'Password'}</FormLabel>
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

          <Button
            type="submit"
            className="w-full bg-medical-primary hover:bg-medical-primary/90"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('loggingIn') || 'Logging in...'}
              </>
            ) : (
              t('login') || 'Login'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
```

---

### Step 2: Update Providers (React Query Setup)

**File**: `app/[locale]/providers.tsx`

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
```

---

### Step 3: Update AuthGuard Component

**File**: `components/shared/AuthGuard.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useIsAuthenticated, useUserRole } from '@/stores/authStore';
import { Role } from '@/lib/api/types';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
  locale: string;
}

export function AuthGuard({ children, requiredRoles, locale }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  const userRole = useUserRole();

  useEffect(() => {
    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      const redirectUrl = `/${locale}/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
      return;
    }

    // Check role authorization
    if (requiredRoles && requiredRoles.length > 0 && userRole) {
      if (!requiredRoles.includes(userRole)) {
        // Unauthorized - redirect to home
        router.push(`/${locale}/`);
        return;
      }
    }
  }, [isAuthenticated, userRole, requiredRoles, router, pathname, locale]);

  // Show loading or nothing while checking auth
  if (!isAuthenticated) {
    return null;
  }

  // Show unauthorized message if role doesn't match
  if (requiredRoles && requiredRoles.length > 0 && userRole && !requiredRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}
```

---

### Step 4: Create Doctor Registration Component

**File**: `components/admin/CreateDoctorDialog.tsx`

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateDoctor } from '@/lib/api/hooks/useAuth';
import { createDoctorSchema, type CreateDoctorFormData } from '@/lib/schemas/auth.schemas';
import { Language } from '@/lib/api/types';

interface CreateDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDoctorDialog({ open, onOpenChange }: CreateDoctorDialogProps) {
  const t = useTranslations('admin');
  const { mutate: createDoctor, isPending } = useCreateDoctor();

  const form = useForm<CreateDoctorFormData>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      language: Language.ENGLISH,
      socialSecurityNumber: '',
      email: '',
      phone: '',
      password: '',
      speciality: '',
    },
  });

  const onSubmit = (data: CreateDoctorFormData) => {
    createDoctor(data, {
      onSuccess: (response) => {
        toast.success(`Doctor created successfully! ID: ${response.id}`);
        form.reset();
        onOpenChange(false);
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || 'Failed to create doctor';
        toast.error(message);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Doctor</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="doctor@kasralainy.edu.eg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Format: +201XXXXXXXXX)</FormLabel>
                  <FormControl>
                    <Input placeholder="+201012345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialSecurityNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>National ID (14 digits)</FormLabel>
                  <FormControl>
                    <Input placeholder="30202041234567" maxLength={14} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="speciality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Speciality</FormLabel>
                  <FormControl>
                    <Input placeholder="Cardiology" {...field} />
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
                  <FormLabel>Password (Min 8 chars)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="StrongPassword123!" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Arabic</SelectItem>
                      <SelectItem value="1">English</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Doctor'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🧪 Testing the Integration

### 1. Test Login Flow

```bash
# Start the frontend
cd GP-Frontend
pnpm dev
```

Navigate to `http://localhost:3000/en/login`

**Test Credentials** (Get from backend team):
- Email: `youssefhassanein17@gmail.com`
- Role: SUPER_ADMIN

**Expected Behavior**:
1. Enter credentials and submit
2. Check browser DevTools → Application → Cookies
3. You should see `accessToken` cookie (HTTP-only, signed)
4. Response body should NOT contain token, only `{ name, language, role }`
5. Redirect to `/en/admin/dashboard` (for SUPER_ADMIN)

### 2. Test Protected Routes

After login, try accessing:
- `/en/admin/dashboard` (SUPER_ADMIN, ADMIN)
- `/en/doctor/dashboard` (DOCTOR)

Without login, you should be redirected to `/en/login`

### 3. Test Doctor Creation

1. Login as SUPER_ADMIN or ADMIN
2. Navigate to admin dashboard
3. Click "Create Doctor" button
4. Fill in the form with valid data
5. Submit and verify success toast
6. Check browser Network tab:
   - Request should include cookie automatically
   - No Authorization header
   - Response: `{ message: "Doctor is successfully created", id: "uuid" }`

---

## 🐛 Debugging Common Issues

### Issue 1: CORS Errors
```
Access-Control-Allow-Origin error
```

**Solution**: Ensure backend CORS configuration allows your frontend origin:
```typescript
// Backend should have:
app.enableCors({
  origin: 'http://localhost:3000',  // Your frontend URL
  credentials: true,  // CRITICAL
});
```

### Issue 2: Cookies Not Set
```
Cookie not appearing in browser
```

**Checklist**:
- ✅ `withCredentials: true` in axios config
- ✅ Backend sets `credentials: true` in CORS
- ✅ Check cookie settings in Network tab → Response Headers → Set-Cookie
- ✅ In production, use HTTPS (secure cookies)

### Issue 3: 401 Unauthorized on Protected Routes
```
Request fails with 401 even after login
```

**Troubleshooting**:
1. Check if cookie is present in request (Network tab → Request Cookies)
2. Verify cookie hasn't expired
3. Check backend logs for JWT validation errors
4. Ensure `withCredentials: true` is set globally

### Issue 4: TypeScript Errors
```
Type 'UserPublic' is not assignable to type 'User'
```

**Solution**: Use the new type definitions from `lib/api/types.ts`:
```typescript
import { Role, Language, type LoginResponse } from '@/lib/api/types';
```

---

## 📊 Next Steps

### Phase 1: Authentication ✅ (Current)
- [x] Login integration
- [x] Cookie-based auth
- [x] Auth store update
- [ ] Logout endpoint (backend pending)

### Phase 2: User Management (Week 1)
- [ ] Admin creation
- [ ] Doctor creation
- [ ] Patient creation
- [ ] User listing/filtering

### Phase 3: Clinic & Doctor Management (Week 2)
- [ ] Clinic CRUD
- [ ] Doctor approval workflow
- [ ] Patient listing (read-only for admin)

### Phase 4: Doctor Module (Week 3)
- [ ] Patient search/filter
- [ ] Add patient
- [ ] Visit history
- [ ] Medical records (medications, labs, scans)

### Phase 5: Polish & Testing (Week 4)
- [ ] Error boundaries
- [ ] Loading states
- [ ] Offline support (React Query)
- [ ] E2E tests (Cypress)
- [ ] Remove all mock data

---

## 📚 Additional Resources

- [Backend Architecture Analysis](./BACKEND_ARCHITECTURE_ANALYSIS.md)
- [Auth API Documentation](./API/auth.json)
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Zod Validation](https://zod.dev/)

---

## 🆘 Support

If you encounter issues:
1. Check browser console and Network tab
2. Review backend logs
3. Verify environment variables
4. Test with Postman/Thunder Client first
5. Contact backend team for API issues

---

**Last Updated**: December 15, 2025  
**Author**: GitHub Copilot (Senior Frontend Engineer)  
**Status**: Ready for Implementation
