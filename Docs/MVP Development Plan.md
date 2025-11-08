
Focus: Deliver core Admin (add/delete clinics list, view/update/approve/delete doctors, view patients) and Doctor (register/choose clinic, search/filter/add/delete patients, view/update profile/history) portals by Thursday, November 6, 2025. Simple iterative builds with stubs for expansion.

#### Week 1: Foundation & Authentication (9)
- **BE**: Set up (C#) .NET server, Postgres schemas (User, Clinic, Patient, History per ERD), JWT auth endpoints (doctor register/login with clinic choice, admin login), basic RBAC middleware.
- **FE**: Init Next.js/TS/Tailwind/Shadcn setup, build login/register pages (forms for doctor clinic select), integrate React Query for auth state, basic layout (navbar, theme toggle).

#### Week 2: Admin Module Core
- **BE**: Clinic CRUD APIs (get all clinics name/speciallity), doctor management (view/update/approve/delete with isApproved flag), patient view API (read-only list).
- **FE**: Admin dashboard page (Shadcn table for clinics/doctors, forms for add/delete/approve), connect to BE via React Query, responsive list views.

#### Week 3: Doctor Module Basics
- **BE**: Patient search/filter API (by National ID/Name, clinic-linked), add/delete patient endpoints (create profile, soft delete).
- **FE**: Doctor dashboard (search input with debounce, patient list table via TanStack, add/delete modals), integrate auth redirect post-register.

#### Week 4: Profile & History Integration
- **BE**: Profile/history APIs (view/update demographics: DOB/gender/nationalID/name; add to history: labs/diagnoses/treatments/notes/visit dates/status enum).
- **FE**: Patient detail page ([id] route with Shadcn forms/tabs for profile/history), update mutations with Zod validation, timeline component for history views.

#### Week 5: Integration, Testing & Polish
- **BE**: Full E2E API tests (Jest/Supertest for auth-to-history flows), basic encryption stub on notes, indexing for queries.
- **FE**: End-to-end integration (Cypress tests for admin/doctor flows), UI polish (bilingual stubs, loading skeletons), deploy to Vercel/Render, demo prep.