### 📋 Main Project Instructions

**1. Project Objective**  
* **Goal:** Build a mobile-first **Outpatient Clinic Management System** for Kasr Al Ainy Hospital.  
* **Primary Users:** Doctors (primary focus), Admins, and Patients.  
* **Deadline:** Full app completion targeted for Spring 2026, building on MVP delivered November 6, 2025.

**2. Core Modules to Build (Full Scope)**  
* **Admin Module:** Manage clinics (Add/Delete), manage users (Doctors/Patients: Add/Remove), system monitoring, QR code generation.  
* **Doctor Module (The "Smart Companion"):** Patient search/profile management, edit info, history access/updates (Labs, Diagnoses, Treatments, Notes).  
* **Patient Module:** Profile viewing (History, Appointments), booking/scheduling, medication notifications, online payment.  
* **GenAI Chatbot:** Handle FAQs and general inquiries.  
* **AI Enhanced EHR:** Automated summarization, diagnostic assistance, medication safety checks.  
* **Data Entry Module:** Speech-to-Text, OCR, bilingual support, validation.  
* **Non-Functional:** Offline access, scalability (Microservices, Containers, CI/CD, DevOps/MLOps), testing, data encryption.

**3. Frontend Instructions (Next.js)**  
* **Framework:** Use Next.js 15+ with App Router.  
* **Language:** Strict **TypeScript**.  
* **UI Library:** Use **Shadcn UI** + **Tailwind CSS**, enhanced with Konsta UI for mobile.  
* **Localization:** The app **MUST** be Bilingual (English/Arabic).  
    * Implement **RTL (Right-to-Left)** support for Arabic layout flipping.  
* **State Management:** Use **Zustand** for global state (Auth, Theme, Locale) and **React Query** (TanStack Query) for API data caching.

**4. Backend Instructions (Nest.js)**  
* **Framework:** TS, Nest.js Core.  
* **Database:** PostgreSQL.  
* **Schema:** Strictly follow the provided **ERD (`CodeBlue_ERD.pdf`)**.  
    * *Key Entities:* `Users` (Base), `Doctors` (Extension), `Patients`, `Visits`, `Medications`, `Labs`, `Scans`.  
* **Auth:** Implement JWT Authentication with Role-Based Access Control (RBAC).

---

### ⚠️ Development Rules (The "Non-Negotiables")

**1. Data & Security Rules**  
* **HIPAA/Privacy Compliance:** Never expose patient data in public API responses. All endpoints fetching patient data must be guarded by authentication middleware.  
* **Data Integrity:** Foreign keys (e.g., `doctor_id`, `clinic_id`) must always exist. Do not allow "Orphaned" records.  
* **Encryption:** Passwords must be hashed. Sensitive notes should ideally be encrypted at rest.

**2. UI/UX Rules**  
* **Medical Theme:** Use the defined color palette:  
    * **Primary:** Emerald/Teal (Represents Safety/Stability).  
    * **Secondary:** Navy Blue (Professional/Branding).  
    * **Error States:** Red (Critical for drug interactions or missing mandatory fields like Weight).  
* **Accessibility:** All inputs must have labels. The app must be navigable via keyboard.  
* **Offline-First Mindset:** The app must allow viewing previously loaded patient data even if the internet disconnects (Kasr Al Ainy connectivity issue).

**3. Workflow Rules**  
* **Validation:**  
    * **Frontend:** Use **Zod** schema validation for all forms (e.g., National ID must be 14 digits).  
    * **Backend:** Double-validate all inputs.  
* **AI Disclaimers:** Any AI-generated output (like "Differential Diagnosis") must display a disclaimer: *"AI-generated guidance — please confirm with your clinical judgment before applying."*  
* **No Hard Deletes:** Use `is_deleted` flags (Soft Delete) for Patients and Doctors. Never actually remove data from the database.

**4. Code Quality Rules**  
* **No `any` Type:** Explicitly define interfaces for all data models (`Patient`, `Visit`, `Medication`).  
* **Component Modularity:** Don't build giant pages. Break down the "Doctor Dashboard" into smaller components: `PatientSearch`, `ClinicalCompanionGrid`, `HistoryTimeline`.  
* **Commit Message Style:** Use conventional commits (e.g., `feat: add patient search`, `fix: rtl layout alignment`).

---

### Phased Development Plan

Below is a fully phased plan for building the complete Outpatient Clinic Management System. Each phase is structured as a professional prompt that can be used to guide development (e.g., fed to an AI code generator or team). Phases are sequential, building from MVP core to full scope, incorporating best practices and code quality throughout. Phases 1-5 focus on MVP (Admin/Doctor), 6-9 on expansions, 10-11 on integration/mobile/deployment.

#### Phase 1 Prompt: Project Setup & Foundation
You are a Senior Full-Stack Developer with 15+ years in HealthTech. Create the initial setup for the CodeBlue Outpatient Clinic Management System. 

**Backend (Nest.js):** Initialize a new Nest.js project with TypeScript. Install dependencies: @nestjs/core, @nestjs/common, @nestjs/platform-express, @nestjs/typeorm, typeorm, pg (for PostgreSQL), @nestjs/jwt, @nestjs/passport, passport-jwt, bcrypt. Configure PostgreSQL connection in app.module.ts. Generate entities based on ERD: Users, Doctors, Clinics, Patients, Visits, Medications, Labs, Scans (use TypeORM decorators for relations, e.g., @OneToMany for Visits to Patients). Implement soft deletes via is_deleted flag.

**Frontend (Next.js):** Create a new Next.js 15+ app with App Router and TypeScript. Install dependencies: shadcn-ui, tailwindcss, zustand, @tanstack/react-query, zod, react-hook-form, lucide-react, day.js, sonner, @nivo/core. Set up root layout with bilingual support (next-intl), RTL flipping, and medical theme (emerald/teal colors). Define TS interfaces mirroring ERD entities.

**Database:** Set up PostgreSQL schema migration with TypeORM.

**Best Practices:** Use conventional commits from start. Ensure no 'any' types. Modularize: separate modules/services in backend, components/lib in frontend.

Output: Full code for setup files (app.module.ts, layout.tsx, etc.), commands to run (nest new, npx create-next-app).

#### Phase 2 Prompt: Authentication & RBAC
You are a Senior Security Engineer with 15+ years in HealthTech. Implement JWT authentication and RBAC for CodeBlue.

**Backend:** Create AuthModule with AuthService, AuthController. Implement register/login endpoints (hash passwords with bcrypt). Use JWT strategy for guards. Define roles (admin, doctor, patient) in Users entity (enum). Apply @Roles decorator for RBAC on endpoints.

**Frontend:** Set up auth pages (/login, /register) with Shadcn forms, Zod validation. Use React Query for auth mutations. Store JWT in Zustand (securely). Implement protected routes with middleware.

**Integration:** Test auth flow: register doctor, login, access protected API.

**Best Practices:** Double-validate inputs. Use environment variables for JWT secret. No patient data exposure.

Output: Code for AuthModule, auth pages, and test scripts.

#### Phase 3 Prompt: Admin Module Implementation
You are a Senior Backend/Frontend Developer. Build the Admin Module for CodeBlue MVP.

**Backend:** Create AdminModule with services/controllers for clinics (CRUD), users (add/remove doctors/patients with RBAC), monitoring (basic analytics endpoint). QR code generation using qrcode library. Apply soft deletes.

**Frontend:** Admin dashboard page with Shadcn tables for clinics/doctors/patients. Forms for add/delete. Use React Query for data fetching/mutations. QR display component.

**Integration:** Ensure admin-only access via guards.

**Best Practices:** Modular components (e.g., ClinicTable). Accessibility labels on forms.

Output: Full module code, including API endpoints and UI components.

#### Phase 4 Prompt: Doctor Module Implementation
You are a Senior Clinical Workflow Specialist. Implement the Doctor Module for CodeBlue MVP.

**Backend:** DoctorModule with endpoints for patient search (by name/ID, filters), profile edit, history updates (labs, scans, medications, diagnoses via Visits entity).

**Frontend:** Doctor dashboard with PatientSearch (debounced input), HistoryTimeline (Nivo charts), ClinicalForm (Zod-validated). Filters with react-day-picker.

**Integration:** Link to auth; cache with React Query.

**Best Practices:** Break into sub-components. Validate National ID (14 digits).

Output: Code for services, controllers, and frontend pages.

#### Phase 5 Prompt: MVP Integration, Testing & Polish
You are a Senior QA Engineer. Integrate and test the MVP for CodeBlue.

**Backend:** E2E tests with Jest/Supertest for auth-to-history flows. Indexing for searches.

**Frontend:** Cypress tests for admin/doctor flows. UI polish: skeletons, bilingual stubs.

**Full Stack:** Deploy to Vercel (frontend)/Render (backend). Demo script.

**Best Practices:** 80% test coverage. CI/CD stubs with GitHub Actions.

Output: Test files, deployment configs.

#### Phase 6 Prompt: Patient Module Implementation
You are a Senior Patient Experience Developer. Add the Patient Module.

**Backend:** PatientModule with endpoints for profile view, booking (clinic/doctor selection), notifications (stub email/push), payment integration (e.g., Stripe gateway).

**Frontend:** Patient pages: profile, appointments, payment form. Notifications via Sonner.

**Integration:** RBAC for patient role.

**Best Practices:** Secure payment handling. Modular booking flow.

Output: Module code.

#### Phase 7 Prompt: Data Entry Module with ML Features
You are a Senior ML Integration Expert. Implement Data Entry Module.

**Backend:** Endpoints for speech/OCR processing (integrate with external APIs like Google Cloud Speech-to-Text if needed, or stubs).

**Frontend:** Forms with voice hooks (Web Speech API), OCR (Tesseract.js). Bilingual support.

**Integration:** Feed into patient history.

**Best Practices:** Editable transcripts. Validation post-entry.

Output: Hooks, services.

#### Phase 8 Prompt: AI Modules (Chatbot & EHR)
You are a Senior AI Engineer. Build GenAI Chatbot and AI Enhanced EHR.

**Backend:** AI services: Chatbot (integrate LangChain/OpenAI for FAQs), EHR (summarization/diagnostics via ML models, e.g., Hugging Face).

**Frontend:** Chat interface, EHR summaries with disclaimers.

**Integration:** Feed patient data securely.

**Best Practices:** MLOps stubs. AI disclaimers mandatory.

Output: AI modules.

#### Phase 9 Prompt: Non-Functional Requirements
You are a Senior DevOps Engineer. Implement non-functional features.

**Backend:** Microservices split, Docker containers, CI/CD with GitHub Actions/Jenkins.

**Frontend:** Offline with service workers/React Query.

**Full Stack:** Encryption (crypto module), scalability tests.

**Best Practices:** Unit/integration/E2E testing.

Output: Dockerfiles, pipelines.

#### Phase 10 Prompt: Mobile Conversion with Capacitor
You are a Senior Mobile Developer. Convert to native mobile app.

Follow the Capacitor guide: Install Capacitor/Konsta, integrate plugins (voice, OCR, storage), adapt UI for RTL/themes.

**Best Practices:** Bundle optimization, offline sync.

Output: Mobile configs, hooks.

#### Phase 11 Prompt: Final Testing, Deployment & Best Practices
You are a Senior Solution Architect. Finalize with best practices and code quality.

**Full Stack:** Comprehensive testing (Jest, Cypress). Deploy to app stores. Audit for HIPAA.

**Best Practices & Code Quality:** Enforce no 'any', modularity, conventional commits, accessibility, performance (Turbopack), security audits.

Output: Reports, final docs.