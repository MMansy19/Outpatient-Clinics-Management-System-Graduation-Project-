# 📖 Backend Integration Summary - Quick Reference

## 🎯 Key Insights

### Cookie-Based Authentication (CRITICAL)
The backend uses **HTTP-only signed cookies** for JWT storage, NOT Authorization headers:

```typescript
// ✅ CORRECT - Axios config
withCredentials: true  // Enables cookie-based auth

// ❌ WRONG - Don't do this
headers: {
  Authorization: `Bearer ${token}`  // Backend doesn't use this!
}
```

### How It Works

#### 1. Login Flow
```
Frontend                Backend (API Gateway)       Auth Service
   |                            |                        |
   |--POST /auth/login--------->|                        |
   |  { email, password }       |----RabbitMQ----------->|
   |                            |                        |
   |                            |                    Validate
   |                            |                    Generate JWT
   |                            |<---Response----------|
   |                            | { name, language,    |
   |                            |   role, token }      |
   |                            |                        |
   |  Set-Cookie: accessToken   |                        |
   |  (HTTP-only, signed)       |                        |
   |<--Response-----------------|                        |
   |  { name, language, role }  |                        |
   |  (NO TOKEN in body)        |                        |
```

#### 2. Subsequent Requests
```
Frontend                Backend
   |                       |
   |--GET /auth/doctor---->|
   |  Cookie: accessToken  |
   |                       |---JWT Strategy------------>
   |                       |  Extract from cookie
   |                       |  Validate signature
   |                       |  Check expiration
   |                       |  Fetch user from DB
   |                       |  Check role permissions
   |                       |<--User object--------------|
   |                       |
   |<--Response------------|
   |  { data }             |
```

---

## 📦 Files Created/Updated

### New Files
| File | Purpose |
|------|---------|
| `lib/api/client.ts` | Axios instance with cookie support |
| `lib/api/types.ts` | TypeScript types from OpenAPI schema |
| `lib/api/auth.service.ts` | Authentication API methods |
| `lib/api/hooks/useAuth.ts` | React Query hooks for auth |
| `lib/schemas/auth.schemas.ts` | Zod validation schemas |
| `docs/BACKEND_ARCHITECTURE_ANALYSIS.md` | Comprehensive backend analysis |
| `docs/FRONTEND_BACKEND_INTEGRATION_GUIDE.md` | Step-by-step integration guide |

### Updated Files
| File | Changes |
|------|---------|
| `stores/authStore.ts` | Removed token storage (uses cookies now) |

---

## 🔑 Important Code Snippets

### 1. API Client Setup
```typescript
// lib/api/client.ts
const apiClient = axios.create({
  baseURL: 'https://api-gateway.yellowgrass-a3ce385a.westeurope.azurecontainerapps.io/api/v1',
  withCredentials: true,  // ⚠️ CRITICAL
});
```

### 2. Login Integration
```typescript
import { useLogin } from '@/lib/api/hooks/useAuth';

const { mutate: login, isPending } = useLogin();

login({ email, password }, {
  onSuccess: (data) => {
    // data = { name, language, role }
    // JWT is in HTTP-only cookie (not accessible)
    router.push('/dashboard');
  }
});
```

### 3. Create Doctor
```typescript
import { useCreateDoctor } from '@/lib/api/hooks/useAuth';

const { mutate: createDoctor } = useCreateDoctor();

createDoctor({
  firstName: "John",
  lastName: "Doe",
  email: "john@kasralainy.edu.eg",
  phone: "+201012345678",
  socialSecurityNumber: "30202041234567",  // 14 digits
  password: "StrongPassword123!",
  speciality: "Cardiology",
  language: 1  // 0=Arabic, 1=English
}, {
  onSuccess: (response) => {
    // response = { message, id }
    console.log('Doctor ID:', response.id);
  }
});
```

### 4. Protected Routes
```typescript
// Check authentication
const isAuthenticated = useIsAuthenticated();

// Check role
const hasAdminRole = useHasRole(Role.ADMIN);

// Check multiple roles
const canCreateDoctor = useHasAnyRole([Role.SUPER_ADMIN, Role.ADMIN]);
```

---

## 🔐 Security Features

1. **HTTP-only Cookies**: JavaScript cannot access JWT (XSS protection)
2. **Signed Cookies**: Tamper detection using secret
3. **SameSite Attribute**: CSRF protection
4. **HTTPS Only**: Secure cookies in production
5. **Role-Based Access Control**: Backend validates permissions
6. **Password Hashing**: bcrypt with configurable rounds
7. **Input Validation**: Zod schemas + NestJS ValidationPipe

---

## 🧪 Testing Checklist

### Login Test
- [ ] Navigate to `/en/login`
- [ ] Enter credentials (get from backend team)
- [ ] Open DevTools → Application → Cookies
- [ ] Verify `accessToken` cookie exists (HTTP-only)
- [ ] Check Network tab → Response does NOT contain token
- [ ] Verify redirect based on role
- [ ] Check Zustand store has user data

### Create Doctor Test
- [ ] Login as SUPER_ADMIN or ADMIN
- [ ] Open "Create Doctor" dialog
- [ ] Fill form with valid data:
  - National ID: 14 digits starting with 2 or 3
  - Phone: +201XXXXXXXXX format
  - Password: Min 8 chars with uppercase, lowercase, number, special char
- [ ] Submit form
- [ ] Check Network tab:
  - Cookie automatically included
  - No Authorization header
  - Response: `{ message, id }`
- [ ] Verify success toast

### Cookie Persistence Test
- [ ] Login
- [ ] Refresh page
- [ ] Verify still authenticated (cookie persists)
- [ ] Close browser tab
- [ ] Reopen (cookie should persist until expiration)

---

## 🐛 Common Issues & Fixes

### Issue: CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Fix**:
```typescript
// Backend must have:
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,  // CRITICAL
});

// Frontend must have:
withCredentials: true  // In axios config
```

### Issue: Cookie Not Set
**Checklist**:
- ✅ Backend response includes `Set-Cookie` header
- ✅ Cookie has correct domain/path
- ✅ HTTPS in production (for secure cookies)
- ✅ `withCredentials: true` in frontend
- ✅ `credentials: true` in backend CORS

### Issue: 401 on Protected Routes
**Debug Steps**:
1. Check Network tab → Request Headers → Cookie (should include `accessToken`)
2. Verify cookie hasn't expired
3. Check backend logs for JWT validation errors
4. Ensure role matches endpoint requirements

---

## 📊 API Endpoints Reference

### Authentication
| Endpoint | Method | Auth | Body | Response |
|----------|--------|------|------|----------|
| `/auth/login` | POST | None | `{ email, password }` | `{ name, language, role }` + Cookie |
| `/auth/admin/create` | POST | SUPER_ADMIN | `CreateAdminDto` | `{ message, id }` |
| `/auth/doctor/create` | POST | SUPER_ADMIN, ADMIN | `CreateDoctorDto` | `{ message, id }` |
| `/auth/patient/create` | POST | SUPER_ADMIN, ADMIN, DOCTOR | `CreatePatientDto` | `{ message, id }` |

### Role Hierarchy
```
SUPER_ADMIN (highest)
  ├── Can create admins
  ├── Can create doctors (auto-approved)
  ├── Can create patients
  └── Full access
  
ADMIN
  ├── Can create doctors (requires approval)
  ├── Can create patients
  └── Manage clinics
  
DOCTOR
  ├── Can create patients
  ├── Manage visits
  └── Read patient data
  
PATIENT (lowest)
  └── Read-only (no login access)
```

---

## 🔄 Request/Response Flow Diagram

```
┌─────────────────┐
│  Browser        │
│  (Frontend)     │
└────────┬────────┘
         │
         │ 1. POST /auth/login
         │    { email, password }
         ▼
┌─────────────────┐
│  API Gateway    │◄──────────────┐
│  (Port 4000)    │               │
└────────┬────────┘               │
         │                         │
         │ 2. RabbitMQ Message     │
         │    { cmd: LOGIN }       │
         ▼                         │
┌─────────────────┐               │
│  Auth Service   │               │
│  (Microservice) │               │
└────────┬────────┘               │
         │                         │
         │ 3. Query Database       │
         │    Validate credentials │
         │    Generate JWT         │
         │                         │
         └─────────────────────────┘
         │
         │ 4. Response
         │    { name, language, role, token }
         ▼
┌─────────────────┐
│  API Gateway    │
│  Sets Cookie:   │
│  accessToken=JWT│
└────────┬────────┘
         │
         │ 5. HTTP Response
         │    Set-Cookie: accessToken=...
         │    Body: { name, language, role }
         ▼
┌─────────────────┐
│  Browser        │
│  Stores Cookie  │
│  Updates State  │
└─────────────────┘
```

---

## 🎓 Best Practices

### DO ✅
- Use `withCredentials: true` globally
- Store user metadata in Zustand (name, language, role)
- Let browser manage cookies
- Check authentication with `useIsAuthenticated()`
- Validate forms with Zod schemas
- Handle errors gracefully with toast notifications
- Use React Query for caching

### DON'T ❌
- Store JWT in localStorage/sessionStorage
- Try to read/parse the JWT token
- Manually set Authorization headers
- Store sensitive data in state
- Skip input validation
- Ignore error responses

---

## 📈 Performance Optimizations

### React Query Caching
```typescript
{
  staleTime: 5 * 60 * 1000,  // 5 minutes
  retry: 1,
  refetchOnWindowFocus: false,
}
```

### Optimistic Updates
```typescript
onMutate: async (newData) => {
  // Cancel outgoing refetches
  await queryClient.cancelQueries(['doctors']);
  
  // Snapshot previous value
  const previous = queryClient.getQueryData(['doctors']);
  
  // Optimistically update
  queryClient.setQueryData(['doctors'], (old) => [...old, newData]);
  
  return { previous };
},
onError: (err, newData, context) => {
  // Rollback on error
  queryClient.setQueryData(['doctors'], context.previous);
},
```

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
pnpm install

# Set environment variables
echo "NEXT_PUBLIC_API_BASE_URL=https://api-gateway.yellowgrass-a3ce385a.westeurope.azurecontainerapps.io/api/v1" > .env.local

# Start development server
pnpm dev

# Open browser
# Navigate to http://localhost:3000/en/login

# Test login with credentials from backend team
```

---

## 📞 Support

**Backend Team Contact**: For API credentials, CORS issues, or backend errors  
**Frontend Team**: For integration questions or UI issues  
**Documentation**: See `docs/BACKEND_ARCHITECTURE_ANALYSIS.md` for deep dive

---

**Version**: 1.0  
**Last Updated**: December 15, 2025  
**Status**: Production Ready ✅
