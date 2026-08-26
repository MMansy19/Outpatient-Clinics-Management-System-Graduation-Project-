<div align="center">

# MediStream OCMS

### Outpatient Clinics Management System

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwind-css)
![PWA](https://img.shields.io/badge/PWA-Offline--First-5A0FC8?style=flat-square)

A bilingual (EN/AR) offline-first Progressive Web Application for **Kasr Al Ainy Hospital, Cairo University** — streamlining patient data management across 50+ outpatient clinics.

**Spring 2026 Graduation Project** · Faculty of Engineering, BDE Department

[Live Demo](https://medistream-ocms.vercel.app) · [API Docs](./Docs/API/auth.json)

</div>

---

## Overview

MediStream OCMS is a mobile/web application designed to replace manual patient data management at Kasr Al Ainy Hospital's 50+ outpatient clinics. Built as a modular monolith with a React/Next.js frontend, it supports role-based dashboards for **Super Admin** and **Doctor** personas with comprehensive CRUD operations, offline-first architecture, and AI-powered features.

**Key Goals:**
- Reduce medical registration errors by 70%
- Enable uninterrupted clinical operations via offline-first architecture
- Ensure data privacy aligned with GDPR/HIPAA standards
- Scale for high-volume Egyptian public health infrastructure

---

## Features

### Super Admin Dashboard
- **Clinic Management** — Full CRUD for clinics with soft-delete and restore
- **Doctor Management** — Create, edit, approve, and manage doctor accounts
- **Patient Management** — View and manage patient records across all clinics
- **Visit Management** — System-wide visit listing with pagination
- **Patient Search** — Search by National ID (SSN) with full 4-tab medical history
- **System Statistics** — 8 animated KPI cards (clinics, doctors, patients, visits)
- **QR Code Generation** — Patient cards linked to National ID for quick access

### Doctor Dashboard
- **Patient Registration** — Manual entry or National ID OCR scanning via camera
- **National ID Scanner** — AI-powered OCR to auto-fill patient data (name, SSN, gender, birthdate)
- **Patient Profile (4-tab view)**:
  - **Visits** — View/create visit records with diagnoses and audio notes
  - **Medications** — Full CRUD with dosage and period tracking
  - **Labs** — Lab records with image upload support
  - **Scans** — Medical scans (X-Ray, MRI, CT) with image upload
- **Voice Recording** — Speech-to-text transcription for medical notes
- **Audio Playback** — Record and play back audio diagnoses

### Cross-Cutting Features
- **Bilingual i18n** — Full English/Arabic support with RTL layout
- **Offline-First PWA** — Service worker with intelligent caching strategies
- **Dark/Light Theme** — Toggle with persistence
- **Role-Based Access** — SUPER_ADMIN, DOCTOR, PATIENT roles with JWT auth
- **Responsive Design** — Mobile-first with tablet/desktop breakpoints

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | SSR, SSG, API routes |
| **UI Library** | React 18 | Component rendering |
| **Language** | TypeScript 5 | Type-safe development |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS |
| **UI Primitives** | Radix UI | Accessible headless components |
| **State Management** | Zustand + TanStack Query | Client state + server cache |
| **Forms** | React Hook Form + Zod | Validation and form state |
| **Offline Storage** | Dexie (IndexedDB) | Client-side data persistence |
| **PWA** | Serwist | Service worker + caching |
| **Mobile** | Capacitor | Native camera access |
| **Animations** | GSAP | Scroll and transition animations |
| **Charts** | Nivo | Data visualization |
| **HTTP Client** | Axios | Cookie-based API requests |
| **i18n** | next-intl | Bilingual routing and translations |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Backend API server (see API documentation)

### Installation

```bash
# Clone the repository
git clone https://github.com/MahmoudMansy/GP-Frontend.git
cd GP-Frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en) (or `/ar` for Arabic).

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
GP-Frontend/
├── app/                          # Next.js App Router
│   ├── [locale]/                  # i18n locale routes (en/ar)
│   │   ├── doctor/dashboard/      # Doctor portal
│   │   ├── super-admin/dashboard/ # Admin portal
│   │   ├── login/                 # Authentication
│   │   ├── register/              # Registration
│   │   └── home/                  # Landing page
│   ├── api/proxy/[...path]/       # API proxy (dev)
│   └── ~offline/page.tsx          # PWA offline fallback
│
├── components/                    # React components
│   ├── doctor/                    # Doctor portal (19 components)
│   ├── super-admin/               # Admin portal (21 components)
│   ├── shared/                    # Reusable components (22 files)
│   ├── landing/                   # Landing page
│   └── ui/                        # Shadcn UI primitives
│
├── lib/                           # Business logic
│   ├── api/                       # API layer + React Query hooks
│   ├── hooks/                     # Custom React hooks
│   ├── schemas/                   # Zod validation schemas
│   ├── utils/                     # Utility functions
│   └── offline/                   # Offline-first architecture
│       ├── db.ts                  # IndexedDB schema
│       ├── syncEngine.ts          # Background sync
│       ├── mutationQueue.ts       # Offline mutation queue
│       └── queryPersister.ts      # React Query persistence
│
├── stores/                        # Zustand stores
├── hooks/                         # Top-level hooks
├── types/                         # TypeScript definitions
├── messages/                      # i18n translations (en/ar)
└── public/                        # Static assets
```

---

## Architecture Highlights

### Offline-First Design
The application implements a comprehensive offline-first architecture:
- **Dexie (IndexedDB)** stores patients, doctors, visits, medications, labs, and scans locally
- **Mutation Queue** buffers all write operations and syncs when connectivity returns
- **Sync Engine** drains the queue with retries, deduplication, and pre-flight uniqueness checks
- **React Query Persistence** caches server state to IndexedDB with 7-day max age
- **Serwist Service Worker** handles network-first for API, cache-first for assets

### Security
- JWT tokens stored in HTTP-only signed cookies (XSS protection)
- HIPAA-aligned security headers (X-Frame-Options DENY, strict CSP)
- Role-based access control with granular permissions
- Camera/microphone restricted to self-origin

### National ID OCR
Doctors can scan Egyptian National ID cards via camera, which are processed by a backend AI model to auto-fill patient data including name, SSN, location, gender, and birthdate.

---

## Non-Functional Requirements

- **Offline Access** — Full functionality without network connectivity
- **Scalability** — Supports 50+ concurrent clinics
- **Security** — AES-256 encryption, GDPR/HIPAA-aligned privacy
- **Performance** — Optimized builds with code splitting and lazy loading
- **Accessibility** — WCAG-compliant with Radix UI primitives

---

## Team

| Name | ID |
|------|-----|
| Mahmoud Mohamed Abdelfattah Elsayed | 4220142 |
| Mohamed Ayman | 1200245 |
| Zeyad Khaled Badri | 1210100 |
| Youssef Hassanien Ahmed | 2220010 |
| AbdelRahman Hesham Zakaria | 1210148 |
| Seif Allah Alaa Mohamed El Shaer | 1200324 |

**Advisor**: Cairo University BDE Department

---

## License

MIT License

---

<div align="center">

**Transforming Healthcare at Kasr Al Ainy**

[Built with ❤️ for Egypt's Public Health](https://medistream-ocms.vercel.app)

</div>
