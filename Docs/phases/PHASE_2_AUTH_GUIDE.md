# Phase 2: Authentication & RBAC - Installation Guide

## Required Dependencies

Run these commands in the `codeblue-frontend` directory:

```powershell
# Navigate to project directory
cd d:\WORK\Projects\GP\GP-Frontend\codeblue-frontend

# Install axios for API calls
pnpm add axios

# Install Shadcn UI components for forms
npx shadcn@latest add form
npx shadcn@latest add select

# Verify all dependencies are installed
pnpm install
```

## Phase 2 Implementation Complete ✅

### Features Implemented

1. **API Client (`lib/api/client.ts`)**
   - Axios instance with JWT interceptors
   - Automatic token injection in headers
   - 401 error handling with automatic logout
   - 30-second timeout for requests

2. **Authentication Schemas (`lib/schemas/authSchema.ts`)**
   - Login schema: email + password validation
   - Register schema: username, email, password strength, role-specific fields
   - Password confirmation matching
   - Doctor-specific fields (specialization, license, clinic)

3. **Auth API Hooks (`lib/api/queries/useAuth.ts`)**
   - `useLogin()`: Login mutation with Zustand integration
   - `useRegister()`: Register mutation with auto-login
   - `useLogout()`: Logout mutation
   - Automatic token storage

4. **Auth Components**
   - `LoginForm.tsx`: Email/password form with redirect support
   - `RegisterForm.tsx`: Multi-role registration with conditional fields
   - `AuthGuard.tsx`: Protected route wrapper with role-based access

5. **Auth Pages**
   - `/[locale]/login`: Login page
   - `/[locale]/register`: Registration page
   - Bilingual support (English/Arabic)
   - Medical theme styling

6. **Security Features**
   - JWT stored in Zustand with localStorage persistence
   - Password requirements: uppercase, lowercase, number, special char
   - Role-based access control (RBAC)
   - Automatic redirect on unauthorized access

### API Endpoints Expected (Backend)

```typescript
POST /api/auth/login
Body: { email: string, password: string }
Response: { user: UserPublic, token: string }

POST /api/auth/register
Body: { username, email, password, role, specialization?, license_number?, clinic_id?, phone_number? }
Response: { user: UserPublic, token: string }

POST /api/auth/logout
Headers: Authorization: Bearer {token}
Response: { success: boolean }
```

### Environment Variables

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Usage Example

```typescript
// Protected route in app/[locale]/doctor/dashboard/page.tsx
import { AuthGuard } from '@/components/shared/AuthGuard';
import { UserRole } from '@/types/entities/User';

export default function DoctorDashboard({ params: { locale } }) {
  return (
    <AuthGuard allowedRoles={[UserRole.DOCTOR]} locale={locale}>
      <div>Doctor Dashboard Content</div>
    </AuthGuard>
  );
}
```

### Testing Checklist

- [ ] Run `pnpm install`
- [ ] Install Shadcn form and select components
- [ ] Start dev server: `pnpm dev`
- [ ] Navigate to `/en/register`
- [ ] Register a doctor account
- [ ] Navigate to `/en/login`
- [ ] Login with registered credentials
- [ ] Verify token in browser localStorage
- [ ] Test redirect after login
- [ ] Test logout functionality
- [ ] Test RTL layout on `/ar/login`

### Next Steps (Phase 3)

- Admin Module Implementation
- Clinic management CRUD
- User management (Add/Remove doctors/patients)
- QR code generation
- System monitoring dashboard

---

**Phase 2 Authentication Complete - Ready for Backend Integration**
