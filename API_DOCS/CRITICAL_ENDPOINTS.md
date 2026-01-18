## 📋 Overview

These 4 endpoints are **critical for MVP functionality** and must be implemented by the backend team.

| # | Method | Endpoint | Description | Frontend Hook | Priority |
|---|--------|----------|-------------|---------------|----------|
| 1 | GET | `/api/doctors` | Get all doctors | `useGetAllDoctors()` | 🔴 High |
| 2 | GET | `/api/patients` | Get all patients | `useGetAllPatients()` | 🔴 High |
| 3 | PATCH | `/api/patients/:id` | Update patient information | `useUpdatePatient()` | 🔴 High |
| 4 | GET | `/api/visits` | Get all visits | `useGetAllVisits()` | 🔴 High |

---

## 1️⃣ GET /api/doctors

**Description**: Retrieves a list of all doctors in the system.

**Method**: `GET`  
**Endpoint**: `/api/doctors`  
**Authentication**: Required (Cookie-based JWT)  
**Authorization**: Admin, Doctor

### Response (200 - Success)

```typescript
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

---

## 2️⃣ GET /api/patients

**Description**: Retrieves a list of all patients in the system.

**Method**: `GET`  
**Endpoint**: `/api/patients`  
**Authentication**: Required (Cookie-based JWT)  
**Authorization**: Admin, Doctor

### Response (200 - Success)

```typescript
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

---

## 3️⃣ PATCH /api/patients/:id

**Description**: Updates patient demographic information.

**Method**: `PATCH`  
**Endpoint**: `/api/patients/:id`  
**Authentication**: Required (Cookie-based JWT)  
**Authorization**: Admin, Doctor

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | INTEGER | Patient ID (not globalId) |

### Request Body

```typescript
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+201234567890",
  "email": "john.smith@email.com",
  "address": "123 Main St, Cairo",
  "job": "Engineer"
}
```

### Response (200 - Success)

```typescript
{
  "id": 1,
  "globalId": "patient-uuid",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+201234567890",
  "email": "john.smith@email.com",
  "address": "123 Main St, Cairo",
  "job": "Engineer",
  "updatedAt": "2026-01-18T10:00:00Z"
}
```
---

## 4️⃣ GET /api/visits

**Description**: Retrieves a list of all visit records in the system.

**Method**: `GET`  
**Endpoint**: `/api/visits`  
**Authentication**: Required (Cookie-based JWT)  
**Authorization**: Admin, Doctor

### Response (200 - Success)

```typescript
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
---