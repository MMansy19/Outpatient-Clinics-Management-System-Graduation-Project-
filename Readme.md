# 🚀 MediStream OCMS Frontend Starter

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14%2B-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-007ACC?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)
![Shadcn UI](https://img.shields.io/badge/Shadcn%20UI-0.8.0-0EA5E9?style=for-the-badge&logo=shadcn-ui)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A scalable, bilingual frontend starter for the Outpatient Clinics Management System (OCMS)**

[🌐 Live Demo](https://medistream-ocms.vercel.app) • [📖 Documentation](#-table-of-contents) • [🐛 Report Bug](https://github.com/your-org/medistream-ocms-frontend/issues)

</div>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [📦 Dependencies & Packages](#-dependencies--packages)
- [⚙️ Configuration](#️-configuration)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [🌍 Internationalization](#-internationalization)
- [⚡ Performance & Optimization](#-performance--optimization)
- [♿ Accessibility](#-accessibility)
- [🎨 Styling & Theming](#-styling--theming)
- [📝 Scripts](#-scripts)
- [👤 Authors](#-authors)
- [📜 License](#-license)

---

## 🎯 Overview

MediStream OCMS Frontend is a modern, performant starter kit for the Outpatient Clinics Management System, designed for Kasr Al Ainy Hospital's outpatient workflows. Built with Next.js 14+ App Router, TypeScript, and Tailwind CSS integrated with Shadcn UI, this frontend emphasizes rapid development for admin and doctor portals in the MVP phase: admin features (add/delete clinics as lists, view/update/approve/delete doctors, view patients) and doctor features (register/choose clinic, search/filter/add/delete patients, view/update profile & history). It supports bilingual UI (English/Arabic with RTL), ensuring seamless expansion to full SOW modules like patient self-service, GenAI Chatbot, AI Enhanced EHR, and Data Entry.

### Highlights

- ⚡ **Blazing Fast** - Server-side rendering (SSR) and static generation (SSG) with Next.js 14+ App Router
- 🎨 **Beautiful & Consistent UI** - Tailwind CSS with Shadcn UI components for accessible, customizable design
- 🌐 **Multilingual** - Full support for English and Arabic with RTL layout flipping
- 📱 **Fully Responsive** - Mobile-first design optimized for Android/iOS and web devices
- ♿ **Accessible** - WCAG 2.1 AA compliant with ARIA attributes and keyboard navigation
- 🔍 **SEO Optimized** - Meta tags, structured data, and hreflang for bilingual pages
- 🎭 **Theme Support** - Dark/Light modes with smooth transitions via CSS variables
- 🚀 **Performance First** - Image optimization, lazy loading, code splitting, and React Query caching
- 🔄 **State Management** - Zustand for lightweight global state; React Query for data fetching/caching
- 📊 **Data Handling** - TanStack Table for patient/doctor lists; Context API for auth/UI state

This starter aligns with the Spring 2025 Graduation Project SOW, providing a robust foundation for Month 1 MVP delivery by November 6, 2025, while stubbed hooks for AI integrations (e.g., speech-to-text UI) and offline access.

---

## ✨ Key Features

### 🏠 Core Pages (MVP Focus)
- **Auth Pages** - Login/register for doctors (with clinic selection); admin login
- **Admin Dashboard** - Clinic list (add/delete), doctor management (view/update/approve/delete), patient overview
- **Doctor Dashboard** - Patient search/filter, add/delete patients, profile/history view/update forms
- **Layout** - Bilingual navbar, sidebar for navigation, footer with hospital branding
- **Error/Loading** - Custom 404, error boundaries, and skeleton loaders

### 🎯 Advanced Features
- ✅ Dynamic routing with middleware for locale handling (/en/*, /ar/*)
- ✅ React Query for optimistic updates and infinite queries (e.g., patient lists)
- ✅ Shadcn UI components: Tables for clinics/doctors/patients, forms for profiles/history, modals for confirms
- ✅ Zustand stores for auth state, theme, and locale persistence
- ✅ TanStack Table for sortable/filterable patient/doctor grids
- ✅ Image optimization with Next.js Image for medical uploads (stubs for X-rays/CTs)
- ✅ Accessibility menu (high contrast, reduced motion)
- ✅ Page transitions with Gsap
- ✅ Search with debounced inputs for patient National ID/Name
- ✅ Form validation with Zod integration in Shadcn forms
- ✅ Hooks for window size, pagination, and API queries
- ✅ Stubbed hooks for future AI: e.g., useSpeechToText for data entry

---

## 🛠️ Technology Stack

### Core Framework & Runtime
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14+ | React framework with App Router, SSR/SSG, and server components for fast MVP dashboards |
| **React** | 18.2.0 | UI library for interactive components like patient forms and history timelines |
| **TypeScript** | 5.0+ | Type-safe development with strict mode (no `any` types) for error-free admin/doctor portals |
| **Node.js** | 20.x | Runtime for build and dev server |

### Styling & UI
| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 3.4.17 | Utility-first CSS for responsive, bilingual layouts (LTR/RTL support) |
| **Shadcn UI** | 0.8.0 | Accessible, customizable components (buttons, tables, forms) for clinic/doctor UIs |
| **Radix UI** | ^1.0.0 | Unstyled primitives for modals, dropdowns in patient search |
| **Lucide React** | 0.263.1 | Consistent icons for navigation and actions (e.g., add clinic, edit history) |
| **class-variance-authority (cva)** | ^0.7.0 | Variant management for themed buttons/tables |
| **tailwind-merge** | ^2.0.0 | Resolves Tailwind class conflicts in dynamic UIs |
| **Gsap** |  | Smooth animations for page transitions and loading states |

### State & Data Management
| Technology | Version | Purpose |
|------------|---------|---------|
| **Zustand** | ^4.4.0 | Lightweight global state for auth, theme, and locale in multi-user flows |
| **@tanstack/react-query** | ^4.29.19 | Caching, mutations, and optimistic updates for patient/doctor API calls |
| **@tanstack/react-table** | ^8.9.4 | Headless tables for searchable patient lists and clinic overviews |

### Utilities & Optimization
| Technology | Version | Purpose |
|------------|---------|---------|
| **@next/font** | 14.2.15 | Font optimization (e.g., Inter for English, Noto Sans Arabic for RTL) |
| **Zod** | ^3.21.4 | Schema validation for forms (e.g., patient demographics) |
| **date-fns** | ^2.30.0 | Date handling for visit dates and history timestamps |
| **clsx** | ^2.0.0 | Conditional class names in Shadcn components |

### Images & Media
- **Next.js Image Component**: AVIF/WebP optimization for profile photos and medical images (stubs for OCR uploads)

**Framework Notes**: Next.js App Router with middleware for i18n routing. Strict TypeScript ensures type-safe API responses for ERD entities (e.g., Patient, Clinic).

---

## 📦 Dependencies & Packages

### Production Dependencies

```json
{
  "@next/font": "^14.2.15",                          // Font optimization
  "@radix-ui/react-slot": "^1.0.2",                  // Radix primitives base
  "@tanstack/react-query": "^4.29.19",               // Data fetching/caching
  "@tanstack/react-table": "^8.9.4",                 // Table logic
  "class-variance-authority": "^0.7.0",              // Component variants
  "clsx": "^2.0.0",                                  // Conditional classes
  "date-fns": "^2.30.0",                             // Date utilities
  "framer-motion": "^10.12.16",                      // Animations
  "lucide-react": "^0.263.1",                        // Icons
  "next": "14+",                                     // Core framework
  "react": "^18.2.0",                                // UI library
  "react-dom": "^18.2.0",                            // DOM renderer
  "tailwind-merge": "^2.0.0",                        // Class merging
  "zustand": "^4.4.0"                                // State management
}
```

### Development Dependencies (via Shadcn CLI)

```json
{
  "@types/node": "^20",                              // Node types
  "@types/react": "^18",                             // React types
  "@types/react-dom": "^18",                         // React DOM types
  "autoprefixer": "^10.4.16",                        // CSS prefixes
  "eslint": "^8.57.0",                               // Linting
  "eslint-config-next": "14+",                       // Next.js ESLint
  "postcss": "^8.4.31",                              // CSS processing
  "tailwindcss": "^3.4.17",                          // Tailwind
  "typescript": "^5.0+"                              // TypeScript
}
```

### Shadcn UI Components (Installed via CLI)
- **Core**: Button, Card, Table, Form, Dialog, Input, Select
- **Icons**: Via Lucide React
- **Customization**: Themed via Tailwind config for hospital branding (e.g., blue primaries for medical theme)

**Package Notes**: No heavy deps for MVP—focus on lightweight tools. React Query handles API stubs for backend integration (e.g., `/api/patients/search`).

---

## ⚙️ Configuration

### Next.js Configuration (`next.config.js`)

#### Image & Bundle Optimization
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-hospital-server.com'], // For medical images
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days for static assets
  },
  experimental: {
    serverComponentsExternalPackages: ['@tanstack/react-table'],
  },
  // Security headers for health data
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

**Key Features:**
- 📸 **Image Optimization**: Responsive medical uploads with lazy loading
- 🔒 **Security Headers**: Protects sensitive patient views
- ⚡ **Caching**: Long TTL for dashboard assets

### Tailwind Configuration (`tailwind.config.js`)

#### Design System for Medical UI
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#3b82f6', foreground: '#ffffff' }, // Hospital blue
        secondary: { DEFAULT: '#64748b', foreground: '#ffffff' },
        destructive: { DEFAULT: '#ef4444', foreground: '#ffffff' }, // Error states
        border: '#e2e8f0',
        input: '#e2e8f0',
        ring: '#3b82f6',
        background: '#ffffff',
        foreground: '#0f172a',
        // Dark mode overrides
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // English default
        arabic: ['Noto Sans Arabic', 'sans-serif'], // RTL fallback
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
  darkMode: ['class'], // Class-based theming
};
```

**Key Features:**
- 🎨 **CSS Variables**: Dynamic for themes; semantic colors for medical alerts (e.g., success for stable status)
- 🌓 **Dark Mode**: Via `dark` class, respecting `prefers-color-scheme`
- 📱 **Responsive**: Breakpoints for mobile clinic access
- 🌐 **RTL**: `dir="rtl"` support via Tailwind plugins

### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/store/*": ["./store/*"],
      "@/types/*": ["./types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Key Features:**
- 🎯 **Strict Mode**: Enforces no `any` for safe API types (e.g., PatientHistory)
- 📦 **Path Aliases**: Clean imports like `@/components/ui/Table`
- 🔄 **Incremental Builds**: Faster dev for iterative MVP updates

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js: 18.x or higher
npm: 9.x or higher (or yarn/pnpm)
Git: Latest version
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/medistream-ocms-frontend.git
cd medistream-ocms-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Create .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api  # Backend base URL
NEXT_PUBLIC_LOCALE_DEFAULT=en                  # Default language
```

4. **Install Shadcn UI components** (run in sequence)
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button table form dialog input select
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Test bilingual switch: `/en/admin` or `/ar/doctor`.

### Building for Production

```bash
# Build (includes linting/formatting)
npm run build

# Start production server
npm start

# Analyze bundle (for MVP optimization)
npm run analyze
```

**MVP Quickstart**: After setup, seed mock data via `npm run seed` (stubs patients/clinics for testing admin/doctor flows).

---

## 📁 Project Structure

```
medistream-ocms-frontend/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Internationalized routes (/en, /ar)
│   │   ├── layout.tsx            # Root layout with theme, i18n, and providers (React Query, Zustand)
│   │   ├── page.tsx              # Home/landing (redirects to auth)
│   │   ├── globals.css           # Global styles (Tailwind base)
│   │   ├── admin/                # Admin portal
│   │   │   ├── page.tsx          # Dashboard: Clinics list, doctors table
│   │   │   ├── clinics/          # Add/delete clinic forms
│   │   │   │   └── page.tsx
│   │   │   ├── doctors/          # View/update/approve/delete
│   │   │   │   └── page.tsx
│   │   │   └── patients/         # View patients overview
│   │   │       └── page.tsx
│   │   ├── doctor/               # Doctor portal
│   │   │   ├── page.tsx          # Dashboard: Search/filter patients
│   │   │   ├── auth/             # Register/login with clinic choice
│   │   │   │   └── page.tsx
│   │   │   ├── patients/         # Add/delete, profile/history views
│   │   │   │   ├── [id]/         # Single patient profile/update
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   ├── loading.tsx           # Global loading UI
│   │   └── not-found.tsx         # 404 with locale support
│   ├── api/                      # API routes (stubs for backend proxy)
│   │   └── auth/                 # Auth handlers
│   └── middleware.ts             # i18n routing and locale detection
│
├── components/                   # Reusable React components
│   ├── ui/                       # Shadcn UI wrappers
│   │   ├── button.tsx            # Themed buttons (e.g., add clinic)
│   │   ├── table.tsx             # Patient/doctor tables with TanStack
│   │   ├── form.tsx              # Zod-integrated forms
│   │   ├── dialog.tsx            # Confirm modals (e.g., delete patient)
│   │   ├── input.tsx             # Search inputs
│   │   └── select.tsx            # Clinic/doctor dropdowns
│   ├── admin/                    # Admin-specific
│   │   ├── ClinicList.tsx        # Add/delete list
│   │   ├── DoctorTable.tsx       # View/update/approve
│   │   └── PatientOverview.tsx   # Read-only patient grid
│   ├── doctor/                   # Doctor-specific
│   │   ├── PatientSearch.tsx     # Debounced search/filter
│   │   ├── PatientForm.tsx       # Add/update profile/history
│   │   └── HistoryTimeline.tsx   # Visit dates, labs, notes
│   ├── common/                   # Shared
│   │   ├── Navbar.tsx            # Bilingual nav with theme toggle
│   │   ├── Sidebar.tsx           # Collapsible for mobile
│   │   ├── LoadingSkeleton.tsx   # Dashboards/patient cards
│   │   └── LanguageSelector.tsx  # Locale switcher
│   ├── layout/                   # Layouts
│   │   ├── RootLayout.tsx        # Providers wrapper
│   │   └── DashboardLayout.tsx   # Shared for admin/doctor
│   └── providers/                # Context providers
│       ├── QueryProvider.tsx     # React Query setup
│       └── ThemeProvider.tsx     # Dark/light via Zustand
│
├── lib/                          # Utilities
│   ├── utils.ts                  # cn() helper for classes
│   ├── i18n.ts                   # Translation loader
│   ├── api.ts                    // React Query client config
│   └── validation.ts             # Zod schemas (e.g., patient)
│
├── store/                        # Zustand stores
│   ├── auth.ts                   # User role (admin/doctor), token
│   ├── theme.ts                  // Dark/light mode
│   └── locale.ts                 // Current lang, RTL flag
│
├── hooks/                        # Custom hooks
│   ├── useAuth.ts                // Auth state from store
│   ├── usePatients.ts            // React Query for search/mutations
│   ├── useWindowSize.ts          // Responsive checks
│   └── useDebounce.ts            // Search inputs
│
├── locales/                      # i18n JSON
│   ├── en.json                   # English keys (e.g., "searchByNationalID")
│   └── ar.json                   // Arabic (RTL-aware)
│
├── public/                       # Static assets
│   ├── images/                   # Icons, logos (hospital branding)
│   └── favicon.ico
│
├── types/                        # TypeScript defs
│   ├── next-auth.d.ts            # Auth extensions
│   ├── api.ts                    // Backend response types (Patient, Clinic)
│   └── ui.ts                     // Shadcn prop types
│
├── middleware.ts                 # i18n middleware
├── next.config.js                # Next.js config
├── tailwind.config.js            # Tailwind setup
├── tsconfig.json                 # TypeScript config
├── package.json                  # Deps
└── README.md                     # This file
```

---

## 🌍 Internationalization

### Supported Languages
- 🇺🇸 **English** (en) - Default (LTR)
- 🇸🇦 **Arabic** (ar) - Full RTL support for SOW bilingual requirements

### Implementation Details

#### Middleware-Based Routing (`middleware.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

const locales = ['en', 'ar'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  const pathname = request.nextUrl.pathname;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return pathname.split('/')[1];

  const headers = { 'accept-language': request.headers.get('accept-language') || '' };
  const languages = new Negotiator({ headers }).languages();
  return matchLocale(languages, locales, defaultLocale);
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url));
  }
}
```

**Features:**
- ✅ **Automatic Detection**: From `Accept-Language` header
- ✅ **URL Routing**: `/en/admin` or `/ar/doctor`
- ✅ **Cookie Persistence**: Stores via `set-cookie` for return visits
- ✅ **Redirects**: To preferred locale on first load
- ✅ **RTL Support**: `dir="rtl"` on `<html>` for Arabic; Tailwind RTL plugin
- ✅ **SEO**: Hreflang tags in `<head>` for bilingual search engines

#### Translation Files
```json
// locales/en.json
{
  "nav": {
    "admin": "Admin Dashboard",
    "doctor": "Doctor Portal",
    "searchPatients": "Search Patients"
  },
  "admin": {
    "clinics": {
      "add": "Add Clinic",
      "delete": "Delete Clinic"
    },
    "doctors": {
      "approve": "Approve Doctor"
    }
  },
  "doctor": {
    "profile": {
      "updateHistory": "Update Patient History"
    }
  }
}

// locales/ar.json (RTL keys)
{
  "nav": {
    "admin": "لوحة تحكم الإدارة",
    "doctor": "بوابة الطبيب",
    "searchPatients": "البحث عن المرضى"
  }
  // ... mirrored structure
}
```

**Usage**: Load via `useTranslations` hook in components; dynamic keys for patient names/dates.

---

## ⚡ Performance & Optimization

### Image Optimization Strategy

#### Next.js Image Component (for Profiles/History Images)
```tsx
import Image from 'next/image';

<Image
  src="/api/patients/[id]/avatar"  // Dynamic medical images
  alt="Patient Profile"
  width={200}
  height={200}
  priority={false}  // Lazy for lists
  placeholder="blur"
  quality={75}
  sizes="(max-width: 768px) 100vw, 200px"
/>
```

**Benefits:**
- 📸 **Modern Formats**: AVIF/WebP for 30-50% smaller medical uploads
- 📱 **Responsive**: Srcset for mobile clinic views
- ⚡ **Lazy Loading**: Defer off-screen patient cards
- 🎨 **Blur Placeholders**: Smooth history timelines
- 🗜️ **Build-Time Compression**: Reduces bundle for MVP deploys
- 💾 **Caching**: Edge caching for repeated doctor logins

### Code Optimization

#### Bundle & Rendering
- **Server Components**: Default for static dashboards (e.g., clinic lists)
- **Client Components**: Marked `'use client'` for interactive forms (e.g., patient search)
- **Dynamic Imports**: `const PatientForm = dynamic(() => import('@/components/doctor/PatientForm'))`
- **Tree Shaking**: TypeScript removes unused Shadcn variants
- **Suspense Boundaries**: Streaming for history updates

#### React Query Caching
```tsx
// In usePatients hook
const { data: patients } = useQuery({
  queryKey: ['patients', { search: query, clinicId }],
  queryFn: fetchPatients,
  staleTime: 5 * 60 * 1000,  // 5 min for active sessions
  cacheTime: 10 * 60 * 1000, // Garbage collect inactive
});
```

### Rendering Strategy (MVP-Aligned)

| Page Type | Strategy | Revalidation |
|-----------|----------|--------------|
| Admin Dashboard | SSG + ISR | 3600s (hourly for clinic updates) |
| Doctor Patient List | SSR | On-demand (search queries) |
| Profile Forms | CSR | N/A (mutations via React Query) |
| Auth Pages | SSR | Build time |

**Metrics Target (Core Web Vitals)**:
- LCP < 2.5s (optimized tables)
- FID < 100ms (Zustand for state)
- CLS < 0.1 (fixed skeletons)

---

## ♿ Accessibility

### WCAG 2.1 Level AA Compliance

#### Semantic Structure
```tsx
<main role="main" id="main-content">
  <section aria-labelledby="clinics-heading">
    <h1 id="clinics-heading">Clinics Management</h1>
    <DataTable aria-describedby="clinics-desc" />
  </section>
</main>
```

#### ARIA & Keyboard
- `aria-label` on icons (e.g., "Search patients by National ID")
- `aria-live` for dynamic search results
- Focus management in forms (Shadcn handles via Radix)
- Skip links: `<a href="#main-content">Skip to content</a>`

#### Screen Reader Optimizations
- Alt text for all images (e.g., "Patient profile photo")
- Form labels: `<Label htmlFor="nationalId">National ID</Label>`
- Reduced motion: `@media (prefers-reduced-motion: reduce) { animation: none; }`

### Features
- **Accessibility Menu**: Toggle high contrast/large text via Zustand
- **Contrast Ratios**: 4.5:1 for text (Tailwind neutrals)
- **RTL Keyboard Nav**: Logical flow for Arabic

---

## 🎨 Styling & Theming

### Design System

#### Color Palette (Medical-Themed)
```css
:root {
  --primary: #3b82f6;     /* Blue for actions (add clinic) */
  --primary-foreground: #ffffff;
  --secondary: #64748b;   /* Gray for secondary (view patients) */
  --destructive: #ef4444; /* Red for errors (delete confirm) */
  --success: #10b981;     /* Green for stable status */
  --background: #ffffff;
  --foreground: #0f172a;
}

[data-theme="dark"] {
  --background: #0f172a;
  --foreground: #f1f5f9;
  /* Invert for medical readability */
}
```

#### Typography & Spacing
- **Fonts**: Inter (EN), Noto Sans Arabic (AR); Scale: xs (12px) to 3xl (30px)
- **Spacing**: 4px scale (Tailwind defaults) for form grids

### Theme Implementation
- **Zustand Store**: `useThemeStore((state) => state.theme)` toggles class
- **CSS Vars**: Dynamic for Shadcn (e.g., button variants: primary/destructive)
- **Animations**: GSAP for subtle enters (e.g., table rows)

---

## 📝 Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Development** | `npm run dev` | Dev server on localhost:3000 with HMR |
| **Build** | `npm run build` | Lint, type-check, build for prod |
| **Start** | `npm start` | Production server |
| **Lint** | `npm run lint` | ESLint for code quality |
| **Type Check** | `npm run type-check` | tsc --noEmit for strict types |
| **Analyze** | `npm run analyze` | Bundle analysis for MVP optimization |
| **Seed** | `npm run seed` | Mock data for clinics/patients testing |
| **Shadcn Add** | `npx shadcn-ui@latest add [component]` | Install new UI components |

**Build Flow**: Includes Prettier formatting and Zod validation checks.

---

## 👤 Authors

**Graduation Project Team - Cairo University, BDE Department**  
Spring 2025 - Faculty of Engineering

| Student Name | Student ID |
|--------------|------------|
| Mahmoud Mohamed Abdelfattah Elsayed | 4220142 |
| Mohamed Ayman | 1200245 |
| Zeyad Khaled Badri | 1210100 |
| Youssef Hassanin Ahmed | 2220010 |
| AbdelRahman Hesham Zakaria | 1210148 |
| Seif Allah Alaa Mohamed El Shaer | 1200324 |

- 🌐 **Project SOW**: [Outpatient Clinics Management System](link-to-sow.pdf)
- 💼 **GitHub**: [@your-org](https://github.com/your-org/medistream-ocms-frontend)
- 📧 **Contact**: Via university advisor or GitHub issues

---

## 📜 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file.

```
Copyright (c) 2025 Cairo University - BDE Department Graduation Project Team

Permission is hereby granted... [full MIT text as in portfolio example]
```

---

## 🙏 Acknowledgments

- **Next.js & React Teams** - For the robust ecosystem
- **Shadcn UI & Tailwind Labs** - For accessible, utility-first design
- **TanStack** - For Query and Table excellence
- **Kasr Al Ainy Hospital** - Inspiration for real-world impact
- **Open Source Community** - Libraries enabling bilingual medical UIs

---

<div align="center">

### 🌟 Built for Healthcare Innovation with ❤️ using Next.js, TypeScript, and Shadcn UI

**Star us on [GitHub](https://github.com/your-org/medistream-ocms-frontend) if this starter accelerates your MVP!**

--- 

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/medistream-ocms-frontend)

</div>