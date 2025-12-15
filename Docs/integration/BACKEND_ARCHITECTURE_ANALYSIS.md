# Backend Architecture Analysis - CodeBlue Project

## 📋 Overview
This document provides a comprehensive analysis of the CodeBlue backend architecture, authentication flow, token management, and request/response patterns.

---

## 🏗️ Architecture Overview

### Microservices Architecture
The backend uses a **microservices architecture** with:
- **API Gateway** - Entry point for all client requests (Port 4000)
- **Auth Service** - Handles authentication, user creation, and JWT generation
- **RabbitMQ** - Message broker for inter-service communication

### Technology Stack
- **Framework**: NestJS (Node.js)
- **Database ORM**: TypeORM
- **Message Queue**: RabbitMQ (4.1.6-alpine)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **API Documentation**: Swagger/OpenAPI 3.0

---

## 🔐 Authentication Flow (Deep Dive)

### 1. Login Request Flow

#### Step 1: Client Sends Login Request
```http
POST https://api-gateway.yellowgrass-a3ce385a.westeurope.azurecontainerapps.io/api/v1/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "StrongPassword123!"
}
```

#### Step 2: API Gateway Processing
**File**: `apps/api-gateway/src/auth/auth.controller.ts`

```typescript
@Post('login')
async login(
  @Body() loginDto: LoginDto,
  @Res({ passthrough: true }) res: Response,
) {
  // 1. Forward login request to Auth microservice via RabbitMQ
  const result = await this.authService.login(loginDto);
  
  // 2. result contains: { token, name, language, role }
  
  // 3. Set JWT token in HTTP-only signed cookie
  const cookiesExpirationTime = this.configService.getOrThrow<number>(
    'COOKIES_EXPIRATION_TIME',
  );
  const environment = this.configService.get<string>('ENVIRONMENT');

  res.cookie('accessToken', result.token, {
    httpOnly: true,        // Prevents JavaScript access (XSS protection)
    signed: true,          // Signs cookie with secret
    secure: environment === Environment.PRODUCTION, // HTTPS only in production
    sameSite: environment === Environment.PRODUCTION ? 'none' : 'lax',
    expires: new Date(Date.now() + cookiesExpirationTime),
  });

  // 4. Return user data (without token in body)
  return {
    name: result.name,
    language: result.language,
    role: result.role,
  };
}
```

#### Step 3: API Gateway → Auth Service (RabbitMQ)
**File**: `apps/api-gateway/src/auth/auth.service.ts`

```typescript
async login(loginDto: LoginDto) {
  // Send message to Auth service via RabbitMQ
  return await lastValueFrom<Promise<{
    role: Role;
    name: string;
    language: Language;
    token: string;
  }>>(
    this.authClient.send({ cmd: AuthPatterns.LOGIN }, loginDto)
  );
}
```

#### Step 4: Auth Service Validates Credentials
**File**: `apps/auth/src/auth.controller.ts` & `auth.service.ts`

```typescript
// Controller receives RabbitMQ message
@MessagePattern({ cmd: AuthPatterns.LOGIN })
async login(@Payload() loginDto: LoginDto, @Ctx() context: RmqContext) {
  // 1. Validate user credentials
  const user = await this.authService.validateUser(
    loginDto.email,
    loginDto.password,
  );

  if (!user) {
    throw new RpcException(
      new ErrorResponse('Invalid credentials', 401)
    );
  }

  // 2. Generate JWT token and credentials
  const credentials = await this.authService.generateCredentials(user);

  return {
    ...credentials,  // { name, language, token }
    role: user.role,
  };
}

// Validate user in database
validateUser = async (email: string, password: string): Promise<User | null> => {
  email = email.trim().toLowerCase();

  // Check Admin table
  const admin = await this.adminRepository.findOneBy({ email });
  if (admin && (await bcrypt.compare(password, admin.password))) {
    const adminUser = await this.userRepository.findOneBy({
      id: admin.userId,
    });
    return adminUser;
  }

  // Check Doctor table
  const doctor = await this.doctorRepository.findOneBy({ email });
  if (doctor && (await bcrypt.compare(password, doctor.password))) {
    const doctorUser = await this.userRepository.findOneBy({
      id: doctor.userId,
    });
    return doctorUser;
  }

  return null;
};
```

#### Step 5: JWT Token Generation
**File**: `apps/auth/src/auth.service.ts`

```typescript
generateCredentials = async (user: User): Promise<CredentialsResponseDto> => {
  const token = await this.generateAccessToken({
    socialSecurityNumber: String(user.socialSecurityNumber),
    globalId: user.globalId,
    sub: user.id,              // User ID
    role: user.role,           // SUPER_ADMIN, ADMIN, DOCTOR, PATIENT
  });

  return new CredentialsResponseDto(
    `${user.firstName} ${user.lastName}`,
    user.language,
    token,
  );
};

private generateAccessToken = async (payload: JwtPayload): Promise<string> => {
  const token = await this.jwtService.signAsync<JwtPayload>(payload, {
    algorithm: this.hashingAlgorithm,
    secret: this.accessTokenSecret,
    expiresIn: this.accessTokenExpirationTime,
    issuer: this.issuer,
    audience: this.audience,
  });
  return token;
};
```

**JWT Payload Structure**:
```typescript
type JwtPayload = {
  sub: number;                    // User ID
  globalId: string;               // UUID
  socialSecurityNumber: string;   // 14-digit National ID
  role: Role;                     // Enum: SUPER_ADMIN, ADMIN, DOCTOR, PATIENT
};
```

---

## 🍪 Cookie-Based Token Management

### Why Cookies Instead of localStorage?
1. **HTTP-only cookies** prevent XSS attacks (JavaScript cannot access)
2. **Signed cookies** prevent tampering
3. **Automatic inclusion** in requests (no manual header management)
4. **CSRF protection** via SameSite attribute

### Cookie Configuration
```typescript
res.cookie('accessToken', result.token, {
  httpOnly: true,          // ✅ XSS Protection
  signed: true,            // ✅ Tamper Protection
  secure: true,            // ✅ HTTPS Only (production)
  sameSite: 'none',        // ✅ CSRF Protection (production)
  expires: new Date(...)   // ✅ Expiration Time
});
```

### Production vs Development
| Setting | Production | Development |
|---------|-----------|-------------|
| `secure` | `true` (HTTPS required) | `false` (HTTP allowed) |
| `sameSite` | `'none'` (cross-origin) | `'lax'` (same-site) |
| `CORS` | Restricted origins | Open (`*`) |

---

## 🔒 Protected Endpoints & Authorization

### JWT Authentication Strategy
**File**: `apps/api-gateway/src/auth/strategies/jwt.strategy.ts`

```typescript
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    // Extract JWT from signed cookie
    const extractAuthenticationCookie = (req: Request): string | null => {
      if (req.signedCookies && req.signedCookies['accessToken']) {
        return req.signedCookies['accessToken'] as string;
      }
      return null;
    };

    super({
      jwtFromRequest: extractAuthenticationCookie,  // 🔑 Read from cookie
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
      audience: configService.getOrThrow('AUDIENCE'),
      issuer: configService.getOrThrow('ISSUER'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    // Fetch fresh user data from database
    const user = await this.authService.getUser(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException({
        message: 'Incorrect email or password',
      });
    }
    
    return user;  // Attached to request.user
  }
}
```

### Role-Based Access Control (RBAC)
**File**: `apps/api-gateway/src/auth/guards/jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Validate JWT token
    await super.canActivate(context);

    // 2. Check required roles
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;  // No role restrictions
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User;

    // 3. Verify user has required role
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### Protected Endpoint Example
```typescript
@Roles(Role.SUPER_ADMIN)  // Only SUPER_ADMIN allowed
@UseGuards(JwtAuthGuard)   // Verify JWT from cookie
@Post('admin/create')
async createAdmin(@Body() createAdminDto: CreateAdminDto) {
  return await this.authService.createAdmin(createAdminDto);
}
```

**Role Hierarchy**:
```typescript
enum Role {
  SUPER_ADMIN,  // Full access (create admins)
  ADMIN,        // Manage doctors, patients, clinics
  DOCTOR,       // Manage patients, visits
  PATIENT,      // Read-only access
}
```

---

## 📡 Request/Response Patterns

### Standard Request Flow
```
Client (Browser)
    ↓ HTTPS POST /api/v1/auth/login
API Gateway (Port 4000)
    ↓ RabbitMQ Message (cmd: LOGIN)
Auth Microservice
    ↓ Database Query (Validate User)
    ↓ JWT Generation
    ↑ Response { token, name, language, role }
API Gateway
    ↓ Set HTTP-only Cookie (accessToken)
    ↑ JSON Response { name, language, role }
Client (Cookie stored automatically)
```

### Subsequent Authenticated Requests
```
Client (Browser)
    ↓ HTTPS POST /api/v1/auth/doctor/create
    ↓ Cookie: accessToken=<signed-jwt>
API Gateway
    ↓ JWT Strategy extracts token from cookie
    ↓ Validates JWT signature, expiry, audience, issuer
    ↓ Fetches User from database (payload.sub)
    ↓ JwtAuthGuard checks role (SUPER_ADMIN or ADMIN)
    ↓ RabbitMQ Message to Auth Service
Auth Microservice
    ↓ Create Doctor in database
    ↑ Response { message, id }
API Gateway
    ↑ JSON Response to Client
```

---

## 🔄 User Registration Flows

### 1. Create Admin (SUPER_ADMIN only)
```typescript
POST /api/v1/auth/admin/create
Authorization: Cookie (SUPER_ADMIN role required)
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "language": 1,                    // 0=Arabic, 1=English
  "socialSecurityNumber": "30202041234567",  // 14 digits
  "email": "john@gmail.com",
  "phone": "+201015411320",
  "password": "StrongPassword123!"  // Min 8 characters
}
```

**Backend Process**:
1. Extract gender from SSN (digit 13: even=female, odd=male)
2. Extract birthdate from SSN (digits 1-7)
3. Hash password with bcrypt
4. Create User entity (role=ADMIN)
5. Create Admin entity (linked to User)
6. Return `{ message, id }`

### 2. Create Doctor (SUPER_ADMIN or ADMIN)
```typescript
POST /api/v1/auth/doctor/create
Authorization: Cookie (SUPER_ADMIN or ADMIN role)
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "language": 1,
  "socialSecurityNumber": "30202041234568",
  "email": "jane@gmail.com",
  "phone": "+201015411321",
  "password": "StrongPassword123!",
  "speciality": "Dermatology"  // Additional field
}
```

### 3. Create Patient (SUPER_ADMIN, ADMIN, or DOCTOR)
```typescript
POST /api/v1/auth/patient/create
Authorization: Cookie (SUPER_ADMIN, ADMIN, or DOCTOR role)
Content-Type: application/json

{
  "firstName": "Alice",
  "lastName": "Johnson",
  "language": 0,
  "socialSecurityNumber": "30202041234569",
  "address": "53 El tahrir street, Dokki, Giza, Egypt",
  "job": "Math teacher"
}
```

**Note**: Patients don't have email/password (no login access)

---

## 🗄️ Database Schema

### User Entity (Base)
```typescript
@Entity('Users')
export class User extends BaseEntity {
  @Column('varchar', { length: 128 })
  firstName: string;

  @Column('varchar', { length: 128 })
  lastName: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;  // SUPER_ADMIN, ADMIN, DOCTOR, PATIENT

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;  // Extracted from SSN

  @Column({ type: 'enum', enum: Language, default: Language.ENGLISH })
  language: Language;

  @Column({ type: 'date' })
  dateOfBirth: Date;  // Extracted from SSN

  @Column('bigint', { unique: true })
  socialSecurityNumber: bigint;  // 14-digit National ID

  @OneToOne(() => Doctor, (doctor) => doctor.user, { onDelete: 'CASCADE' })
  doctor: Doctor;

  @OneToOne(() => Patient, (patient) => patient.user, { onDelete: 'CASCADE' })
  patient: Patient;

  @OneToOne(() => Admin, (admin) => admin.user, { onDelete: 'CASCADE' })
  admin: Admin;
}
```

### Admin/Doctor Tables
- Extend User entity with email/password/phone
- Support authentication (login capability)

### Patient Table
- Extends User entity with address/job
- No authentication fields (cannot login)

---

## 🌐 CORS Configuration

**File**: `apps/api-gateway/src/main.ts`

### Production (Azure)
```typescript
app.enableCors({
  origin: configService.getOrThrow<string>('AUDIENCE'),      // Specific origin
  methods: configService.getOrThrow<string[]>('METHODS'),    // ['GET', 'POST', etc.]
  allowedHeaders: configService.getOrThrow<string[]>('ALLOWED_HEADERS'),
  credentials: true,  // ✅ Required for cookies
});
```

### Development
```typescript
app.enableCors();  // Allow all origins (*)
```

**Frontend Requirements**:
- Must include `credentials: true` in fetch/axios config
- Origin must match backend AUDIENCE setting
- HTTPS required in production for secure cookies

---

## 🛡️ Security Features

### 1. Password Security
- **Hashing**: bcrypt with configurable rounds
- **Validation**: Min 8 characters (enforced by DTO)
- **Storage**: Never stored in plain text

### 2. Token Security
- **Signed JWT**: Prevents tampering
- **HTTP-only Cookie**: Prevents XSS
- **SameSite**: Prevents CSRF
- **Expiration**: Time-limited tokens
- **Audience/Issuer**: Validates token origin

### 3. Input Validation
- **NestJS ValidationPipe**: Auto-validates DTOs
- **Whitelist**: Strips unknown properties
- **Transform**: Auto-converts types

### 4. Error Handling
```typescript
if (!user) {
  throw new RpcException(
    new ErrorResponse('Invalid credentials', 401)
  );
}
```

---

## 📦 API Gateway Module Structure

```
apps/api-gateway/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts     # HTTP endpoints
│   │   ├── auth.service.ts        # RabbitMQ client
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts  # RBAC guard
│   │   └── strategies/
│   │       └── jwt.strategy.ts    # Cookie extraction
│   ├── main.ts                    # Bootstrap, CORS, Swagger
│   └── api-gateway.module.ts
```

---

## 🚀 Frontend Integration Checklist

### 1. HTTP Client Setup
```typescript
// lib/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://api-gateway.yellowgrass-a3ce385a.westeurope.azurecontainerapps.io/api/v1',
  withCredentials: true,  // ✅ CRITICAL: Sends cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. Auth Service
```typescript
// lib/api/auth.service.ts
import { apiClient } from './client';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    // Cookie is set automatically by browser
    return response.data; // { name, language, role }
  },

  createDoctor: async (data: CreateDoctorDto) => {
    const response = await apiClient.post('/auth/doctor/create', data);
    return response.data; // { message, id }
  },

  // ... other endpoints
};
```

### 3. TypeScript Types (from OpenAPI)
```typescript
// types/api.ts
export enum Language {
  ARABIC = 0,
  ENGLISH = 1,
}

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateDoctorDto {
  firstName: string;
  lastName: string;
  language: Language;
  socialSecurityNumber: string;  // 14 digits
  email: string;
  phone: string;
  password: string;  // Min 8 chars
  speciality: string;
}

// ... other DTOs
```

### 4. Zustand Auth Store
```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: { name: string; language: Language; role: Role } | null;
  setUser: (user: AuthState['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null });
        // Cookie is cleared by backend on logout endpoint
      },
    }),
    { name: 'auth-storage' }
  )
);
```

### 5. React Query Setup
```typescript
// app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 6. Login Component Integration
```typescript
// components/auth/LoginForm.tsx
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth.service';
import { useAuthStore } from '@/stores/authStore';

export function LoginForm() {
  const setUser = useAuthStore((state) => state.setUser);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      setUser(data);  // { name, language, role }
      // Cookie is already set by backend
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error('Invalid credentials');
    },
  });

  const handleSubmit = (values: LoginDto) => {
    loginMutation.mutate(values);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🔍 Key Insights

1. **Microservices Pattern**: API Gateway is a proxy; real logic is in Auth service
2. **RabbitMQ Communication**: Asynchronous message passing between services
3. **Cookie-First Auth**: Token is NOT in response body (only in HTTP-only cookie)
4. **RBAC Guards**: Every protected endpoint checks role via decorator
5. **SSN Parsing**: Backend extracts gender and birthdate from 14-digit National ID
6. **Transaction Safety**: User creation uses database transactions for consistency
7. **Case Sensitivity**: Emails are lowercased and trimmed before storage/comparison

---

## 📝 Important Notes

### For Frontend Developers
- ✅ Always set `withCredentials: true` in axios/fetch
- ✅ Never try to manually set `Authorization: Bearer` header
- ✅ Cookie is managed by browser automatically
- ✅ Use 401 interceptor to detect expired tokens
- ❌ Don't store tokens in localStorage (security risk)
- ❌ Don't try to parse/read the JWT token (HTTP-only cookie)

### Environment Variables Needed
```env
NEXT_PUBLIC_API_BASE_URL=https://api-gateway.yellowgrass-a3ce385a.westeurope.azurecontainerapps.io/api/v1
```

### Testing Credentials
- **Email**: youssefhassanein17@gmail.com
- **Role**: SUPER_ADMIN
- **Password**: [Contact backend team]

---

## 📚 Additional Resources

- [NestJS Microservices Docs](https://docs.nestjs.com/microservices/basics)
- [Passport JWT Strategy](https://www.passportjs.org/packages/passport-jwt/)
- [HTTP-only Cookies Security](https://owasp.org/www-community/HttpOnly)
- [TypeORM Relations](https://typeorm.io/relations)

---

**Document Version**: 1.0  
**Last Updated**: December 15, 2025  
**Author**: Senior Frontend Engineer - CodeBlue Team
