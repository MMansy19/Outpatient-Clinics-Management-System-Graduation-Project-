# API Integration Status
**Project**: CodeBlue - MediStream OCMS  
**Last Updated**: January 18, 2026  
**Frontend Status**: 60% Complete | **Backend Integration**: 30% Complete

---


## ❌ NOT INTEGRATED ENDPOINTS (32+ Total)

These endpoints have frontend implementation ready but NO backend API exists yet.

### 👨‍⚕️ Admin - User Management (6 Endpoints)
**Frontend Integration**: [lib/api/queries/useUsers.ts](../lib/api/queries/useUsers.ts)  
**Components**: DoctorTable.tsx, PatientTable.tsx  
**Status**: ⚠️ Frontend complete, backend APIs missing

| # | Method | Endpoint | Description | Frontend Hook | Priority |
|---|--------|----------|-------------|---------------|----------|
| 16 | GET | `/api/admin/doctors` | List doctors (with clinic filter) | `useGetDoctors(clinicId?)` | 🔴 High |
| 17 | PATCH | `/api/admin/doctors/:id` | Update doctor | `useUpdateDoctor()` | 🟡 Medium |
| 18 | DELETE | `/api/admin/doctors/:id` | Soft delete doctor | `useDeleteDoctor()` | 🟢 Low |
| 19 | GET | `/api/admin/patients` | Search patients | `useGetPatients(query?)` | 🔴 High |
| 20 | PATCH | `/api/admin/patients/:id` | Update patient | `useUpdatePatient()` | 🟡 Medium |
| 21 | DELETE | `/api/admin/patients/:id` | Soft delete patient | `useDeletePatient()` | 🟢 Low |

**Expected Request/Response**:

<details>
<summary>GET /api/admin/doctors?clinic_id={id} (NEEDED)</summary>

```typescript
// Query params: ?clinic_id=uuid (optional)

// Response (200)
[
  {
    "id": "doctor-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@hospital.com",
    "phone": "+201015411320",
    "speciality": "Dermatology",
    "licenseNumber": "MED-12345",
    "clinicId": "clinic-uuid",
    "clinicName": "Dermatology Clinic"
  }
]
```
</details>

<details>
<summary>GET /api/admin/patients?search={query} (NEEDED)</summary>

```typescript
// Query params: ?search=john (searches name, national ID)

// Response (200)
[
  {
    "id": "patient-uuid",
    "firstName": "John",
    "lastName": "Smith",
    "nationalId": "30202041234567",
    "gender": "male",
    "birthdate": "2002-02-04",
    "phone": "+201234567890",
    "email": "john.smith@email.com"
  }
]
```
</details>

---

### 🔍 Doctor - Patient Search & Management (8 Endpoints)
**Frontend Integration**: [lib/api/queries/usePatients.ts](../lib/api/queries/usePatients.ts)  
**Components**: PatientSearch.tsx, PatientProfile.tsx  
**Status**: ⚠️ Frontend complete, backend APIs missing

| # | Method | Endpoint | Description | Frontend Hook | Priority |
|---|--------|----------|-------------|---------------|----------|
| 22 | GET | `/api/doctor/patients/search` | Search patients with filters | `useSearchPatients(filters)` | 🔴 High |
| 23 | GET | `/api/doctor/patients/:id` | Get patient profile | `useGetPatient(id)` | 🔴 High |
| 24 | PATCH | `/api/doctor/patients/:id` | Update patient demographics | `useUpdatePatient()` | 🟡 Medium |
| 25 | GET | `/api/doctor/patients/:id/visits` | Get patient visit history | `useGetPatientVisits(patientId)` | 🔴 High |
| 26 | GET | `/api/doctor/patients/:id/labs` | Get lab results timeline | `useGetPatientLabs(patientId)` | 🟡 Medium |
| 27 | GET | `/api/doctor/patients/:id/scans` | Get imaging timeline | `useGetPatientScans(patientId)` | 🟡 Medium |
| 28 | GET | `/api/doctor/patients/:id/medications` | Get medication history | `useGetPatientMedications(patientId)` | 🟡 Medium |
| 29 | GET | `/api/doctor/patients/:id/timeline` | Get unified medical timeline | `useGetMedicalHistoryTimeline(patientId)` | 🟡 Medium |

**Expected Request/Response**:

<details>
<summary>GET /api/doctor/patients/search (NEEDED)</summary>

```typescript
// Query params: 
// ?query=john&period=today&clinic_id=uuid&start_date=2026-01-01&end_date=2026-01-18

// Response (200)
{
  "results": [
    {
      "id": "patient-uuid",
      "firstName": "John",
      "lastName": "Smith",
      "nationalId": "30202041234567",
      "gender": "male",
      "birthdate": "2002-02-04",
      "phone": "+201234567890",
      "lastVisit": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```
</details>

<details>
<summary>GET /api/doctor/patients/:id (NEEDED)</summary>

```typescript
// Response (200)
{
  "id": "patient-uuid",
  "firstName": "John",
  "lastName": "Smith",
  "nationalId": "30202041234567",
  "gender": "male",
  "birthdate": "2002-02-04",
  "age": 23,
  "phone": "+201234567890",
  "email": "john.smith@email.com",
  "address": "123 Main St, Cairo",
  "job": "Engineer",
  "emergencyContact": "+201987654321",
  "bloodType": "A+",
  "allergies": ["Penicillin"],
  "chronicConditions": ["Asthma"]
}
```
</details>

<details>
<summary>GET /api/doctor/patients/:id/visits (NEEDED)</summary>

```typescript
// Response (200)
[
  {
    "id": "visit-uuid",
    "patientId": "patient-uuid",
    "doctorId": "doctor-uuid",
    "doctorName": "Dr. Jane Smith",
    "clinicId": "clinic-uuid",
    "clinicName": "Cardiology Clinic",
    "date": "2026-01-15T10:00:00Z",
    "chiefComplaint": "Chest pain",
    "diagnosis": "Stable angina",
    "treatmentPlan": "Beta-blockers, lifestyle modification",
    "vitals": {
      "weight": 75,
      "height": 175,
      "temperature": 36.8,
      "heartRate": 72,
      "bloodPressureSystolic": 120,
      "bloodPressureDiastolic": 80,
      "respiratoryRate": 16,
      "oxygenSaturation": 98
    }
  }
]
```
</details>

---

### 📊 Doctor - Dashboard Statistics (2 Endpoints)
**Frontend Integration**: Doctor dashboard page  
**Components**: [app/[locale]/doctor/dashboard/page.tsx](../app/[locale]/doctor/dashboard/page.tsx)  
**Status**: ⚠️ Frontend shows "0" stats, backend APIs missing

| # | Method | Endpoint | Description | Frontend Usage | Priority |
|---|--------|----------|-------------|----------------|----------|
| 30 | GET | `/api/doctor/stats` | Dashboard statistics | Stats cards | 🟡 Medium |
| 31 | GET | `/api/doctor/visits/recent` | Recent visits list | Recent visits section | 🟡 Medium |

**Expected Request/Response**:

<details>
<summary>GET /api/doctor/stats (NEEDED)</summary>

```typescript
// Response (200)
{
  "todayPatients": 12,
  "pendingVisits": 3,
  "weekTotal": 45,
  "monthTotal": 180
}
```
</details>

<details>
<summary>GET /api/doctor/visits/recent?limit=5 (NEEDED)</summary>

```typescript
// Query params: ?limit=5

// Response (200)
[
  {
    "id": "visit-uuid",
    "patientId": "patient-uuid",
    "patientName": "John Smith",
    "chiefComplaint": "Headache",
    "diagnosis": "Migraine",
    "date": "2026-01-18T09:00:00Z"
  }
]
```
</details>

---

### 📋 Additional Critical Endpoints (4 Endpoints)
**Frontend Status**: ⚠️ Partially implemented, needs backend  
**Priority**: 🔴 High (Required for MVP)

| # | Method | Endpoint | Description | Frontend Hook | Priority |
|---|--------|----------|-------------|---------------|----------|
| 32 | GET | `/api/doctors` | Get all doctors | `useGetAllDoctors()` | 🔴 High |
| 33 | GET | `/api/patients` | Get all patients | `useGetAllPatients()` | 🔴 High |
| 34 | PATCH | `/api/patients/:id` | Update patient information | `useUpdatePatient()` | 🔴 High |
| 35 | GET | `/api/visits` | Get all visits | `useGetAllVisits()` | 🔴 High |

**Expected Request/Response**:

<details>
<summary>GET /api/doctors (NEEDED)</summary>

```typescript
// Response (200)
[
  {
    "id": 1,
    "globalId": "doctor-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@hospital.com",
    "phone": "+201015411320",
    "speciality": "Dermatology",
    "licenseNumber": "MED-12345",
    "clinicId": 1,
    "createdAt": "2026-01-01T10:00:00Z",
    "updatedAt": "2026-01-01T10:00:00Z",
    "deletedAt": null
  }
]
```
</details>

<details>
<summary>GET /api/patients (NEEDED)</summary>

```typescript
// Response (200)
[
  {
    "id": 1,
    "globalId": "patient-uuid",
    "firstName": "John",
    "lastName": "Smith",
    "socialSecurityNumber": "30202041234567",
    "gender": "male",
    "birthdate": "2002-02-04",
    "phone": "+201234567890",
    "email": "john.smith@email.com",
    "address": "123 Main St, Cairo",
    "job": "Engineer",
    "language": 1,
    "createdAt": "2026-01-01T10:00:00Z",
    "updatedAt": "2026-01-01T10:00:00Z",
    "deletedAt": null
  }
]
```
</details>

<details>
<summary>PATCH /api/patients/:id (NEEDED)</summary>

```typescript
// Request
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+201234567890",
  "email": "john.smith@email.com",
  "address": "123 Main St, Cairo",
  "job": "Engineer"
}

// Response (200)
{
  "id": 1,
  "globalId": "patient-uuid",
  "firstName": "John",
  "lastName": "Smith",
  "updatedAt": "2026-01-18T10:00:00Z"
}
```
</details>

<details>
<summary>GET /api/visits (NEEDED)</summary>

```typescript
// Response (200)
[
  {
    "id": 1,
    "globalId": "visit-uuid",
    "diagnoses": "Common cold, 3 Days rest, Panadol 500 mg twice per day",
    "doctorId": 1,
    "patientId": 1,
    "createdAt": "2026-01-18T10:00:00Z",
    "updatedAt": "2026-01-18T10:00:00Z",
    "deletedAt": null
  }
]
```
</details>

---

## �️ Database Schema Reference

### Key Tables Structure

<details>
<summary><b>Visits Table</b></summary>

```sql
CREATE TABLE `Visits` (
  `id` SERIAL,
  `globalId` UUID,
  `diagnoses` TEXT,
  `doctorId` INTEGER,
  `patientId` INTEGER,
  `createdAt` TIMESTAMP,
  `updatedAt` TIMESTAMP,
  `deletedAt` TIMESTAMP
);
```

**Description**: Stores patient visit records with diagnoses and treatment information.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Auto-incrementing primary key | PRIMARY KEY |
| `globalId` | UUID | Unique global identifier | UNIQUE, NOT NULL |
| `diagnoses` | TEXT | Visit diagnoses and treatment plan | NOT NULL |
| `doctorId` | INTEGER | Foreign key to Doctors table | REFERENCES Doctors(id) |
| `patientId` | INTEGER | Foreign key to Patients table | REFERENCES Patients(id) |
| `createdAt` | TIMESTAMP | Record creation timestamp | DEFAULT NOW() |
| `updatedAt` | TIMESTAMP | Last update timestamp | DEFAULT NOW() |
| `deletedAt` | TIMESTAMP | Soft delete timestamp | NULL (active records) |

</details>

<details>
<summary><b>Doctors Table</b></summary>

```sql
CREATE TABLE `Doctors` (
  `id` SERIAL,
  `globalId` UUID,
  `firstName` VARCHAR(255),
  `lastName` VARCHAR(255),
  `email` VARCHAR(255),
  `phone` VARCHAR(20),
  `speciality` VARCHAR(255),
  `licenseNumber` VARCHAR(100),
  `clinicId` INTEGER,
  `createdAt` TIMESTAMP,
  `updatedAt` TIMESTAMP,
  `deletedAt` TIMESTAMP
);
```

**Description**: Stores doctor information and credentials.
4. **Additional Critical Endpoints** (Endpoints 32, 33, 34, 35)
   - GET /api/doctors - Get all doctors
   - GET /api/patients - Get all patients
   - PATCH /api/patients/:id - Update patient
   - GET /api/visits - Get all visits

**Estimated Backend Effort**: 3-4
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Auto-incrementing primary key | PRIMARY KEY |
| `globalId` | UUID | Unique global identifier | UNIQUE, NOT NULL |
| `firstName` | VARCHAR(255) | Doctor's first name | NOT NULL |
| `lastName` | VARCHAR(255) | Doctor's last name | NOT NULL |
| `email` | VARCHAR(255) | Doctor's email address | UNIQUE, NOT NULL |
| `phone` | VARCHAR(20) | Doctor's phone number | NOT NULL |
| `speciality` | VARCHAR(255) | Medical specialization | NOT NULL |
| `licenseNumber` | VARCHAR(100) | Medical license number | UNIQUE |
| `clinicId` | INTEGER | Foreign key to Clinics table | REFERENCES Clinics(id) |
| `createdAt` | TIMESTAMP | Record creation timestamp | DEFAULT NOW() |
| `updatedAt` | TIMESTAMP | Last update timestamp | DEFAULT NOW() |
| `deletedAt` | TIMESTAMP | Soft delete timestamp | NULL (active records) |

</details>

<details>
<summary><b>Patients Table</b></summary>

```sql
CREATE TABLE `Patients` (
  `id` SERIAL,
  `globalId` UUID,
  `firstName` VARCHAR(255),
  `lastName` VARCHAR(255),
  `socialSecurityNumber` VARCHAR(14),
  `gender` ENUM('male', 'female'),
  `birthdate` DATE,
  `phone` VARCHAR(20),
  `email` VARCHAR(255),
  `address` TEXT,
  `job` VARCHAR(255),
  `language` INTEGER,
  `createdAt` TIMESTAMP,
  `updatedAt` TIMESTAMP,
  `deletedAt` TIMESTAMP
);
```

**Description**: Stores patient demographic and contact information.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Auto-incrementing primary key | PRIMARY KEY |
| `globalId` | UUID | Unique global identifier | UNIQUE, NOT NULL |
| `firstName` | VARCHAR(255) | Patient's first name | NOT NULL |
| `lastName` | VARCHAR(255) | Patient's last name | NOT NULL |
| `socialSecurityNumber` | VARCHAR(14) | National ID (14 digits) | UNIQUE, NOT NULL |
| `gender` | ENUM | Patient's gender | 'male' OR 'female' |
| `birthdate` | DATE | Date of birth | NOT NULL |
| `phone` | VARCHAR(20) | Patient's phone number | NOT NULL |
| `email` | VARCHAR(255) | Patient's email address | NULLABLE |
| `address` | TEXT | Patient's residential address | NOT NULL |
| `job` | VARCHAR(255) | Patient's occupation | NOT NULL |
| `language` | INTEGER | Preferred language (0=English, 1=Arabic) | DEFAULT 1 |
| `createdAt` | TIMESTAMP | Record creation timestamp | DEFAULT NOW() |
| `updatedAt` | TIMESTAMP | Last update timestamp | DEFAULT NOW() |
| `deletedAt` | TIMESTAMP | Soft delete timestamp | NULL (active records) |

</details>

<details>
<summary><b>Clinics Table</b></summary>

```sql
CREATE TABLE `Clinics` (
  `id` SERIAL,
  `globalId` UUID,
  `name` VARCHAR(255),
  `department` VARCHAR(255),
  `location` TEXT,
  `phone` VARCHAR(20),
  `createdAt` TIMESTAMP,
  `updatedAt` TIMESTAMP,
  `deletedAt` TIMESTAMP
);
```

**Description**: Stores clinic information and locations.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Auto-incrementing primary key | PRIMARY KEY |
| `globalId` | UUID | Unique global identifier | UNIQUE, NOT NULL |
| `name` | VARCHAR(255) | Clinic name | NOT NULL |
| `department` | VARCHAR(255) | Medical department | NOT NULL |
| `location` | TEXT | Physical location/address | NOT NULL |
| `phone` | VARCHAR(20) | Clinic phone number | NOT NULL |
| `createdAt` | TIMESTAMP | Record creation timestamp | DEFAULT NOW() |
| `updatedAt` | TIMESTAMP | Last update timestamp | DEFAULT NOW() |
| `deletedAt` | TIMESTAMP | Soft delete timestamp | NULL (active records) |

</details>

<details>
<summary><b>Medications Table</b></summary>

```sql
CREATE TABLE `Medications` (
  `id` SERIAL,
  `globalId` UUID,
  `name` VARCHAR(255),
  `dosage` INTEGER,
  `period` INTEGER,
  `comments` TEXT,
  `patientId` INTEGER,
  `createdAt` TIMESTAMP,
  `updatedAt` TIMESTAMP,
  `deletedAt` TIMESTAMP
);
```

**Description**: Stores medication prescriptions for patients.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Auto-incrementing primary key | PRIMARY KEY |
| `globalId` | UUID | Unique global identifier | UNIQUE, NOT NULL |
| `name` | VARCHAR(255) | Medication name | NOT NULL |
| `dosage` | INTEGER | Dosage amount per administration | NOT NULL |
| `period` | INTEGER | Treatment period in days | NOT NULL |
| `comments` | TEXT | Additional instructions or notes | NULLABLE |
| `patientId` | INTEGER | Foreign key to Patients table | REFERENCES Patients(id) |
| `createdAt` | TIMESTAMP | Record creation timestamp | DEFAULT NOW() |
| `updatedAt` | TIMESTAMP | Last update timestamp | DEFAULT NOW() |
| `deletedAt` | TIMESTAMP | Soft delete timestamp | NULL (active records) |

</details>

### Database Relationships

```
Clinics (1) ----< (Many) Doctors
Doctors (1) ----< (Many) Visits
Patients (1) ----< (Many) Visits
Patients (1) ----< (Many) Medications
```

**Key Notes**:
- All tables use **soft deletes** (`deletedAt` field) - never hard delete records
- `globalId` (UUID) used for external APIs, `id` (SERIAL) for internal relations
- All foreign keys should have indexes for query performance
- `createdAt`/`updatedAt` automatically managed by database triggers

---

## �🔧 Integration Testing Guide

### How to Test Integrated Endpoints

1. **Start development server**:
   ```powershell
   cd GP-Frontend
   pnpm dev
   ```

2. **Open API test page**:
   ```
   http://localhost:3000/en/api-test
   ```

3. **Test each endpoint**:
   - Gateway health check
   - Create patient
   - Create visit
   - Create medication

4. **Check browser DevTools**:
   - Network tab: See API calls
   - Console: Check for errors

### Environment Configuration

Create `.env.local`:
```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=https://api-gateway.yellowgrass-a3ce385a.westeurope.azurecontainerapps.io/api/v1

# Use mock data (false = real backend)
NEXT_PUBLIC_USE_MOCK_DATA=false
```

---

## 📋 Backend Development Priority

### Phase 1: MVP Critical (High Priority) 🔴
**Must have for MVP demo by Feb 2026**:

1. **Admin - Clinic Management** (Endpoints 10, 13)
   - GET /api/clinics - List clinics
   - POST /api/clinics - Create clinic

2. **Admin - User Management** (Endpoints 16, 19)
   - GET /api/admin/doctors - List doctors
   - GET /api/admin/patients - Search patients

3. **Doctor - Patient Search** (Endpoints 22, 23, 25)
   - GET /api/doctor/patients/search - Search patients
   - GET /api/doctor/patients/:id - Get patient profile
   - GET /api/doctor/patients/:id/visits - Get visit history

**Estimated Backend Effort**: 2-3 days

---

### Phase 2: Enhanced Features (Medium Priority) 🟡
**Nice to have for complete MVP**:

4. **Admin - Full CRUD** (Endpoints 11, 12, 14, 17, 20)
   - Clinic stats, updates
   - Doctor updates
   - Patient updates

5. **Doctor - Medical History** (Endpoints 26, 27, 28)
   - Labs timeline
   - Scans timeline
   - Medication history

6. **Doctor - Dashboard** (Endpoints 30, 31)
   - Statistics
   - Recent visits

**Estimated Backend Effort**: 3-4 days

---

### PAI/ML Integration** (Future)
   - GenAI chatbot
   - Diagnostic assistance
   - Medical image analysis
   - Medication interaction checks

**Estimated Backend Effort**: Future phase
9. **AI/ML Integration**
   - Chatbot
   - Diagnostic assistance
   - Image analysis

**Estimated Backend Effort**: 2-3 weeks
12 endpoints)
- [ ] Match request/response schemas in examples above
- [ ] Follow database schema structure (see Database Schema Reference section)
- [ ] Enable CORS for frontend domain
- [ ] Use cookie-based JWT authentication
- [ ] Implement soft deletes (`deletedAt` field) - never hard delete
- [ ] Use `globalId` (UUID) for external APIs, `id` (SERIAL) for internal relations
- [ ] Return proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- [ ] Ensure all foreign key constraints are properly defined
- [ ] Add database indexes on foreign keys for performance
- [ ] Implement all 🔴 High Priority endpoints (8 endpoints)
- [ ] Match request/response schemas in examples above
- [ ] Enable CORS for frontend domain
- [ ] Use cookie-based JWT authentication
- [ ] Implement soft deletes (deleted_at field)
- [ ] Return proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)

### For Frontend Team
- [x] Complete HistoryTimeline component (Nivo charts)
- [ ] End-to-end testing with real backend
- [ ] Remove mock data flags
- [ ] Error handling for all endpoints
- [ ] Loading states for all operations
- [ ] Success/error toast notifications

---

## 📞 Contact & Resources

**Frontend Repository**: GP-Frontend  
**Backend Base URLs**: 
- Gateway: `https://api-gateway.yellowgrass-a3ce385a.westeurope.azurecontainerapps.io/api/v1`
- Doctor API: `http://code-blue-apis.me/api/v1`

**Documentation**:
- [Professional Integration Guide](integration/PROFESSIONAL_BE_INTEGRATION_GUIDE.md)
- [Environment Configuration](integration/ENVIRONMENT_CONFIGURATION.md)
- [Testing Guide](integration/INTEGRATION_TESTING_GUIDE.md)

**Test Page**: `/en/api-test` (in development)

---

**Generated**: January 18, 2026  
**Next Review**: After backend implementation of High Priority endpoints
