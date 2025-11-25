# Technical Product & UX Documentation for CodeBlue (MediStream OCMS)

## 1. Executive Summary & Problem Statement

In high-volume outpatient clinics like those at Kasr Al Ainy Hospital, doctors face significant inefficiencies in manual patient registration, data collection, and history tracking. Traditional paper-based or fragmented digital systems lead to prolonged wait times, incomplete records, and delayed clinical decisions, exacerbating issues in environments handling hundreds of patients daily. These challenges result in suboptimal patient outcomes, increased administrative burden, and limited ability to leverage historical data for informed care.

CodeBlue addresses these pain points with a mobile-first, AI-powered Doctor Module that streamlines patient data collection, history tracking, and clinical decision support. Leveraging voice-to-text for rapid entry, OCR for document scanning, and AI-driven differential diagnosis generation, the system enables doctors to capture structured clinical data in seconds. Built on Next.js 14 for the frontend and .NET Core with PostgreSQL for the backend, it ensures secure, offline-capable workflows that integrate seamlessly with hospital operations, ultimately improving efficiency, accuracy, and patient safety.

## 2. User Stories (Doctor-Centric)

The following user stories capture the core functionalities of the Doctor Module, focusing on patient data collection, history tracking, and clinical decision support. Each story follows the format: *As a [Doctor], I want to [Action], so that [Benefit]*.

- **Rapid Onboarding:** As a Doctor, I want to register with my credentials and select a specific clinic (e.g., Internal Medicine or Orthopedics), so that I can access clinic-specific patient lists and workflows without administrative delays.
- **Patient Identification:** As a Doctor, I want to search for patients by National ID or Name with filters for "Today," "Week," or "Month," so that I can quickly locate returning patients and prioritize immediate cases in a high-traffic environment.
- **Smart Data Entry:** As a Doctor, I want to create a new patient case using voice dictation (Speech-to-Text) for the "Chief Complaint" and "History of Present Illness," so that I can document detailed narratives hands-free, reducing typing errors and saving time during consultations.
- **Clinical Decision Support:** As a Doctor, I want to generate a differential diagnosis based on entered symptoms, demographics, and vitals, so that I can receive AI-assisted insights to inform my clinical judgment and expedite decision-making.
- **History Review:** As a Doctor, I want to view a chronological timeline of a patient's past Labs, Scans, and Medications, so that I can track disease progression, avoid redundant tests, and make evidence-based updates to treatment plans.

## 3. Advanced User Flows (Text Description)

The user flows are described in a step-by-step textual format for clarity, with optional Mermaid.js pseudocode for visualization. These flows emphasize the "New Visit" journey within the Doctor Module, integrating AI enhancements and offline capabilities.

### Flow A: The "New Visit" Journey

1. **Doctor Dashboard Entry:** The doctor navigates to the dashboard post-login, where a grid of **Smart Clinical Companions** (icons for Lab, Radiology, Drugs, Derma, Builder, Report) is displayed. Selecting "Patients" or a companion like "Journey" initiates the flow.
2. **Patient Search and Identification:** The doctor uses a search bar to query by National ID or Name, with toggle filters (Today/Week/Month/Custom Date Range). If no match, a "Add New Patient" button appears, triggering a modal for basic demographics (Name, National ID, Gender, Birthdate).
3. **Input Demographics and Vitals:** In the "New Patient/Case" form, the doctor enters or dictates epidemiological data (Age, Gender, Ethnicity, Residence) and vitals (Weight – mandatory for dosage, Height – optional). Fields use rounded inputs with dropdowns for Ethnicity/Residence and radio toggles for Gender.
4. **Record Case Details:** The doctor dictates or types the case narrative in a textarea ("Write your case details"), including chief complaint, symptoms chronology, past medical history, medications, allergies, family history, and lifestyle factors. A microphone icon activates Speech-to-Text for real-time transcription. Attachments (Labs, Dermatology/Radiology images) are uploaded via a "+" button, using OCR for auto-extraction where applicable.
5. **Generate and Confirm Diagnosis:** Upon completion, the "Generate a Differential Diagnosis" button triggers an AI call, displaying suggestions in a banner with a disclaimer ("AI-generated guidance – please confirm with your clinical judgment"). The doctor reviews, edits, and saves, updating the patient's history timeline.

**Mermaid.js Representation (Pseudocode for Flow Visualization):**
```
flowchart TD
    A[Doctor Dashboard] --> B[Select Smart Companion or Patients]
    B --> C[Search Patient by ID/Name + Filters]
    C -->|Patient Found| D[Load Existing Profile]
    C -->|Not Found| E[Add New Patient Modal]
    E --> F[Input Demographics & Vitals]
    D --> F
    F --> G[Record Case Details via Voice/Text + Upload Attachments]
    G --> H[Generate Differential Diagnosis]
    H --> I[Review & Confirm with Disclaimer]
    I --> J[Save to History Timeline]
    J --> K[Offline Sync on Reconnect]
```

This flow supports offline mode, caching inputs locally via IndexedDB and syncing upon reconnection.

## 4. UI/UX Design Specifications

The UI/UX design prioritizes a clean, intuitive interface optimized for mobile devices, ensuring quick interactions in busy clinics. All components adhere to accessibility standards (WCAG 2.1 AA), with keyboard navigation and ARIA labels.

### Design System
- **Color Palette (Medical-Grade):** 
  - **Primary:** Emerald/Teal (#10B981) for safe/stable actions (e.g., save buttons, success states).
  - **Secondary:** Navy Blue (#1E3A8A) for branding elements (e.g., headers, navigation).
  - **Error States:** Red (#EF4444) for critical alerts (e.g., missing Weight field).
  - **Neutrals:** Light backgrounds (#F9FAFB) for readability, with dark mode support via CSS variables.
- **Typography:** Sans-serif fonts (Inter for English) at scales from 14px (body) to 24px (headers), with bold emphasis on mandatory fields.
- **Spacing & Layout:** Mobile-first grid with 16px base spacing, rounded corners (8px radius) for inputs/buttons.

### Component Breakdown
- **The Doctor Dashboard:** A responsive grid layout (3x2 on mobile) displaying **Smart Clinical Companions** as cards with icons (e.g., Lab: beaker icon, Radiology: radiation icon). Each card has a "Pro" badge for premium features. A prominent "Start BrainStorming Now" banner encourages AI use, with bottom navigation (Home, Patients, Calculator, Menu) for quick access.
- **The Patient Form:** Based on wireframes, features stacked sections: "Epidemiological Data" with inputs for Age (numeric field + "Years"), Gender (radio toggles: Male/Female), Ethnicity/Residence (dropdowns defaulting to "Egyptian/Egypt"). Vitals use unit-labeled fields (Weight: Kg, Height: cm). The "Write your case details" textarea includes a placeholder for comprehensive narratives. A green microphone button enables voice input, and a dashed "+" box allows image uploads (Labs/Derma/Radiology). The form ends with a gray "Generate a Differential Diagnosis" button.
- **Feedback Systems:** 
  - **Error States:** Red borders and tooltips for invalid inputs (e.g., "Weight is mandatory for dosage calculations").
  - **AI-Disclaimer Banners:** Pink background banners at the top of diagnosis outputs, with text: "AI-generated guidance – please confirm with your clinical judgment before applying."
  - **Loading & Success:** Skeleton loaders for patient lists, green checkmarks for saved entries.

## 5. Data Collection & Schema Strategy (Based on ERD)

Data collection in the Doctor Module aligns with the provided ERD, ensuring relational integrity and HIPAA-compliant security. The frontend constructs JSON payloads for backend APIs, using React Query for mutations and Zod for validation.

### Data Modeling
- **Patients Entity:** Captures core demographics (national_id: integer, name: text, gender: varchar, birthdate: date). Frontend form maps inputs directly, enforcing 14-digit National ID via Zod schema.
- **Visits Entity:** Links to patient_id, doctor_id, and clinic_id (all integers), with diagnosis: text for case narratives. Each new visit creates a record with timestamped created_at.
- **MedicalHistory (Broken Down):** 
  - **Labs:** patient_id/doctor_id (integers), photo_url: text (for uploads), name: varchar, comments: text (extracted from voice notes).
  - **Scans:** Similar to Labs, with type: enum (e.g., X-Ray, CT) and comments.
  - **Medications:** patient_id/doctor_id, name: varchar, dosage: integer, period: enum (e.g., Daily, Weekly).

All entities include global_id: uuid for unique tracking, is_deleted: bool for soft deletes, and timestamps. Foreign keys (e.g., doctor_id in Visits) prevent orphaned records.

### Data Entry Optimization
The UI handles unstructured data (e.g., voice dictation) by transcribing via Speech-to-Text APIs, then parsing with NLP (stubbed for AI integration) to extract entities like "Hypertension" for **Diagnoses** (stored in Visits.diagnosis). OCR scans attachments to auto-populate fields (e.g., lab values into Labs.comments). Payloads are structured as nested JSON:
```json
{
  "patient": { "national_id": 12345678901234, "name": "John Doe", "gender": "Male" },
  "visit": { "diagnosis": "Extracted from voice: Chronic headache..." },
  "labs": [{ "name": "CBC", "comments": "Hemoglobin: 12.5" }]
}
```
Backend validates with [Authorize] middleware, hashing sensitive data.

## 6. Data Analysis & Clinical Insights

The structured data collected enables advanced analytics, enhancing clinical and operational efficiency.

- **Longitudinal Analysis:** By querying Visits and linked entities (Labs, Scans, Medications) via patient_id, the system generates timelines for vitals tracking (e.g., Weight/BMI trends using birthdate and height/weight). Frontend visualizes this in a chronological card layout, highlighting changes (e.g., dosage adjustments over visits).
- **Operational Analytics:** Fast retrieval of "Today's Patients" uses created_at filters on Visits, aggregated by clinic_id for load balancing. Total patients query counts non-deleted Patients records, supporting dashboard metrics like "No Patients" placeholders.
- **AI Readiness:** Structured entities feed into Smart Companions for predictive analysis (e.g., differential diagnosis via symptom matching from diagnosis text). Future expansions include ML models on aggregated data (anonymized) for insights like common allergies in Egyptian residences, with offline caching ensuring continuity.