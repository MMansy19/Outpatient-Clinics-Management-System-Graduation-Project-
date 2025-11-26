# Mock Data Guide - No Backend Required! 🚀

The app now works **without a backend** using mock data stored in browser localStorage.

## Quick Start

1. **Start the development server:**
   ```powershell
   pnpm run dev
   ```

2. **Open the app:** `http://localhost:3000`

## Pre-configured Accounts

### Doctor Account
- **Email:** `ahmed@kasralainy.edu.eg`
- **Password:** `password123`
- **Role:** Doctor (Cardiologist)

### Admin Account
- **Email:** `admin@kasralainy.edu.eg`
- **Password:** `admin123`
- **Role:** Admin

## Or Register a New Account

Go to `/en/register` and create a new account. You can register as:
- **Doctor** - with specialization and license
- **Admin** - for management features

## Pre-loaded Mock Data

The app comes with realistic sample data:

### 3 Patients
1. **Mohamed Ali** (PAT001)
   - Blood Type: O+
   - Allergies: Penicillin
   - Conditions: Hypertension
   - Recent visit for chest pain

2. **Sarah Hassan** (PAT002)
   - Blood Type: A+
   - Conditions: Diabetes Type 2
   - Recent visit for high blood sugar

3. **Omar Khalil** (PAT003)
   - Blood Type: B+
   - Allergies: Shellfish

### 3 Clinics
- Kasr Al Ainy Main Clinic
- Emergency Department
- Cardiology Clinic

### Medical Records
- 2 Recent visits with diagnoses
- Lab results (CBC, HbA1c)
- ECG scan results
- Active medications (Aspirin, Nitroglycerin, Metformin)

## App Flow Walkthrough

### As a Doctor (`ahmed@kasralainy.edu.eg`)

1. **Login** → `/en/login`
2. **Dashboard** → See patient search interface
3. **Search Patients:**
   - Try searching: "Mohamed", "Sarah", or "PAT001"
   - Click on a patient to view their profile
4. **View Patient Profile:**
   - See personal info, medical history timeline
   - View visits, labs, scans, medications
5. **Add New Visit:**
   - Record chief complaint, diagnosis, treatment
   - Visits are saved to localStorage

### As an Admin (`admin@kasralainy.edu.eg`)

1. **Login** → `/en/login`
2. **Dashboard** → Admin panel
3. **Manage Clinics:**
   - View, add, edit, delete clinics
   - See clinic statistics
4. **View Doctors:**
   - See all registered doctors
   - View their specializations and clinics
5. **View Patients:**
   - Browse all patients in the system
6. **Generate QR Codes:**
   - Create QR codes for clinic registration

## Key Features to Test

✅ **Authentication** - Login/Register with validation
✅ **Multi-language** - Switch between English (`/en/`) and Arabic (`/ar/`)
✅ **Patient Search** - Search by name or ID
✅ **Medical History Timeline** - Chronological view of all records
✅ **Visit Recording** - Add new patient visits
✅ **Clinic Management** - CRUD operations for clinics
✅ **Beautiful UI** - Background images on login/register pages
✅ **Responsive Design** - Works on mobile and desktop

## Data Persistence

All data is stored in **browser localStorage** with keys:
- `mock_users` - User accounts
- `mock_patients` - Patient records
- `mock_clinics` - Clinic information
- `mock_visits` - Visit history
- `mock_labs`, `mock_scans`, `mock_medications` - Medical records

**To reset all data:** Clear your browser's localStorage or just clear site data for localhost:3000

## Switching to Real Backend

When you're ready to connect to a real backend:

1. Open each file in `lib/api/queries/`
2. Change `const USE_MOCK_DATA = true` to `const USE_MOCK_DATA = false`
3. Make sure your `.env.local` has the correct `NEXT_PUBLIC_API_URL`

## Pages to Explore

- `/en/login` - Login page with bg-gemini.png background
- `/en/register` - Register page with bg-chatgpt.png background
- `/en/doctor/dashboard` - Doctor's patient management interface
- `/en/admin/dashboard` - Admin management panel
- `/ar/login` - Arabic RTL version

Enjoy exploring CodeBlue! 🏥✨
