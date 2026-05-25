# 🚀 MediStream (OCMS)

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14%2B-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-20.x-brightgreen?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?style=for-the-badge&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-007ACC?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

Outpatient Clinics Management System for Kasr Al Ainy Hospital.
*A Spring 2026 Graduation Project by Cairo University - Faculty of Engineering, BDE Department*

[🌐 Live Demo](https://medistream-ocms.vercel.app) • [📖 SOW](link-to-sow.pdf) • [🐛 Issues](https://github.com/your-org/medistream-ocms/issues)

</div>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-technology-stack)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [🌍 Non-Functional Requirements](#-non-functional-requirements)
- [📦 Deliverables](#-deliverables)
- [👥 Team](#-team)
- [📜 License](#-license)

---

## 🎯 Overview

MediStream OCMS is a mobile/web application designed to streamline patient data management for Kasr Al Ainy Hospital's 50+ outpatient clinics. It addresses manual inefficiencies in registration, tracking, and care delivery using modern tech for secure, scalable access. Built as a modular monolith (expanding to microservices), it supports Android/iOS/web with bilingual (English/Arabic) UI and AI enhancements. MVP focuses on Admin/Doctor portals; full rollout includes patient self-service and ML-driven features per SOW.

**Goals**: Reduce errors by 70%, enable offline access, ensure data privacy (GDPR/HIPAA-like), and scale for high-volume Egyptian public health.

---

## ✨ Features

### Core Modules (Per SOW)

#### Admin (Super User)
- Add/delete clinics (profiles: name, location, doctors)
- Manage users: Add/remove doctors/patients
- Doctor oversight: View/update/approve/delete
- View patients (read-only)
- System monitoring: Analytics dashboard
- QR code generation: Patient cards linked to National ID (offline history; Kasr Al Ainy doctors only)

#### Doctor
- Register/login with clinic selection
- Patient search/filter (by National ID/Name/other)
- Add/delete patients
- Profile management: View/update demographics (DOB, gender, National ID, name)
- History access/updates: Labs (e.g., blood tests), diagnoses (e.g., hypertension), treatments (e.g., meds), notes, visit dates, status (stable/improving)

#### Patient
- Profile: Past visits/results (meds, diagnoses, costs), upcoming appointments, EMR
- Booking/scheduling: Select clinic/doctors
- Medication notifications (email/push)
- Online/offline payments (secure gateway integration)

#### GenAI Chatbot
- Replaces FAQs for customer relations (e.g., service queries via NLP)

#### AI Enhanced EHR
- Automated summarization: Concise history/labs/issues prep
- Diagnostic aid: Analyze images (X-rays/CT/MRIs) for abnormalities (tumors/fractures); symptom/lab suggestions
- Medication safety: Drug-drug/gene interaction checks/alerts

#### Data Entry
- Speech-to-text: Dictate Arabic/English (editable, e.g., "dyspnea")
- OCR: Scan ID cards for auto-fill
- Bilingual support: Mixed-language handling
- Validation/editing: Review before save
- Integration: Feeds to patient history

### MVP Scope (Deadline: Thu, Nov 6, 2025)
- Admin: Add/delete clinics (list), view/update/approve/delete doctors, view patients
- Doctor: Register/choose clinic, search/filter/add/delete patients, view/update profile/history

---

## 🛠️ Technology Stack

### Frontend
| Tech | Version | Purpose |
|------|---------|---------|
| Next.js | 14+ (TS) | SSR/SSG, App Router for dashboards |
| React | 18.2.0 | UI components |
| Tailwind CSS | 3.4.17 | Responsive, bilingual (RTL) styling |
| Shadcn UI | 0.8.0 | Accessible tables/forms |
| React Query | ^4.29 | Data fetching/caching |
| Zustand | ^4.4 | State management |

### Backend
| Tech | Version | Purpose |
|------|---------|---------|
| Node.js/Express | TS | REST APIs, auth |
| MongoDB | Mongoose | Schemas (User, Clinic, Patient, History) |
| JWT/Bcrypt | Latest | Secure auth/RBAC |

### Other
- **AI/ML**: OpenAI/Groq (Chatbot), TensorFlow.js (EHR analysis), Azure Speech/OCR (Data Entry)
- **DevOps**: Docker/K8s (containerization), GitHub Actions (CI/CD), AWS (deployment)
- **i18n**: Middleware for /en/*, /ar/*; JSON locales

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x+, MongoDB, Git

### Setup
1. Clone: `git clone https://github.com/your-org/medistream-ocms.git && cd medistream-ocms`
2. Backend: `cd backend && npm i && cp .env.example .env && npm run dev` (Mongo URI in .env)
3. Frontend: `cd frontend && npm i && cp .env.example .env && npm run dev` (API_URL=http://localhost:3001)
4. Seed data: `npm run seed` (mocks for clinics/patients)

Access: [http://localhost:3000/en](http://localhost:3000/en) (switch to /ar for Arabic).

### Build/Deploy
```bash
npm run build  # Both FE/BE
npm start      # Prod server
# Deploy: Vercel (FE), Render (BE)
```

---

## 📁 Project Structure

```
medistream-ocms/
├── backend/                 # Express APIs, Mongo schemas
│   ├── models/              # ERD: User, Clinic, Patient, History
│   ├── routes/              # Auth, admin, doctor endpoints
│   ├── middleware/          # RBAC, encryption stubs
│   └── tests/               # Jest suites
├── frontend/                # Next.js app
│   ├── app/[locale]/        # i18n routes: admin/, doctor/
│   ├── components/          # Shadcn UI, dashboards
│   ├── lib/                 # Utils, API client
│   ├── store/               # Zustand: auth, theme
│   └── locales/             # en.json, ar.json
├── docs/                    # SOW, ERD, architecture diagrams
├── docker/                  # Containerization
└── README.md                # This file
```

---

## 🌍 Non-Functional Requirements

- **Offline Access**: Local storage for history/schedules
- **Scalability**: Up to 50 clinics; future sharding
- **Cloud-Native**: Microservices, Docker, CI/CD (GitHub Actions), DevOps/MLOps
- **Security**: AES-256 encryption, global privacy standards

---

## 📦 Deliverables

- **Prototype**: Full web/mobile app
- **Docs**: User manual, architecture diagrams, GitHub repo
- **Demo**: Live key features presentation
- **Source Code**: Clean/commented with setup
- **Testing Reports**: Bug logs/resolutions

---

## 👥 Team

| Student Name | Student ID |
|--------------|------------|
| Mahmoud Mohamed Abdelfattah Elsayed | 4220142 |
| Mohamed Ayman | 1200245 |
| Zeyad Khaled Badri | 1210100 |
| Youssef Hassanien Ahmed | 2220010 |
| AbdelRahman Hesham Zakaria | 1210148 |
| Seif Allah Alaa Mohamed El Shaer | 1200324 |

**Advisor**: Cairo University BDE Department  
**Spring 2026 Graduation Project**

---

## 📜 License

MIT License - See [LICENSE](LICENSE) for details.

---

<div align="center">

**Transforming Healthcare at Kasr Al Ainy – Built with ❤️ for Egypt's Public Health**

⭐ [Star on GitHub](https://github.com/your-org/medistream-ocms)  

[![Deploy](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/medistream-ocms)

</div>
