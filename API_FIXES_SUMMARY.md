# API Endpoints Fix Summary

## Issue
The patient profile tabs (visits, medications, labs, scans) were showing "Loading..." with no data because:
1. The API endpoints were incorrect
2. The code was using `patientId` (numeric) instead of `socialSecurityNumber` (string)
3. The backend API expects `socialSecurityNumber` in the URL path

## Fixed Endpoints

### Correct API Endpoints (as per your specification):
```
GET /api/v1/doctor/patient/{socialSecurityNumber}/visits
GET /api/v1/doctor/patient/{socialSecurityNumber}/medications
GET /api/v1/doctor/patient/{socialSecurityNumber}/labs
GET /api/v1/doctor/patient/{socialSecurityNumber}/scans
```

### Previous (Incorrect) Endpoints:
```
GET /api/v1/doctor/visit/patient/{patientId}  ❌
```

## Changes Made

### 1. Fixed API Service (`lib/api/doctor.service.ts`)
- **Updated `getPatientVisits` endpoint**: Changed from `/doctor/visit/patient/${patientId}` to `/doctor/patient/${socialSecurityNumber}/visits`
- **Updated parameter**: Changed from `patientId: string` to `socialSecurityNumber: string`

### 2. Updated Query Hooks
Changed all patient data queries to use `socialSecurityNumber` instead of `patientId`:

#### `lib/api/queries/useVisits.ts`
- ✅ `useGetPatientVisits(socialSecurityNumber: string)`
- ✅ Uses correct endpoint: `/doctor/patient/${socialSecurityNumber}/visits`

#### `lib/api/queries/useMedications.ts`
- ✅ `useGetPatientMedications(socialSecurityNumber: string)`
- ✅ Uses correct endpoint: `/doctor/patient/${socialSecurityNumber}/medications`

#### `lib/api/queries/useLabs.ts`
- ✅ `useGetPatientLabs(socialSecurityNumber: string)`
- ✅ Uses correct endpoint: `/doctor/patient/${socialSecurityNumber}/labs`

#### `lib/api/queries/useScans.ts`
- ✅ `useGetPatientScans(socialSecurityNumber: string)`
- ✅ Uses correct endpoint: `/doctor/patient/${socialSecurityNumber}/scans`

### 3. Updated PatientProfile Component
Changed from:
```typescript
// OLD - Using numeric patientId
useGetPatientVisits(Number(patient.id))
useGetPatientMedications(Number(patient.id))
```

To:
```typescript
// NEW - Using string socialSecurityNumber
useGetPatientVisits(String(patient.national_id))
useGetPatientMedications(String(patient.national_id))
useGetPatientLabs(String(patient.national_id))
useGetPatientScans(String(patient.national_id))
```

### 4. Environment Configuration
- ✅ Enabled mock data: `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env.local`
- ✅ Added mock data initialization in `SessionInitializer.tsx`
- ✅ Added comprehensive debug logging

### 5. Mock Data Setup
Mock data includes:
- **Patient 1** (ID: 1, SSN: 29005151234567)
  - 1 Visit
  - 2 Medications (Aspirin, Nitroglycerin)
  - 1 Lab (Complete Blood Count)
  - 1 Scan (X-Ray)

- **Patient 2** (ID: 2, SSN: 28508201234567)
  - 1 Visit
  - 1 Medication (Metformin)
  - 1 Lab (HbA1c Test)
  - 0 Scans

- **Patient 3** (ID: 3, SSN: 29503101234567)
  - No data (fresh patient)

## Testing Steps

1. **Restart the development server** (required for env var changes):
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12) to see debug logs

3. **Navigate to Doctor Dashboard**

4. **Click on any patient** (e.g., Mohamed Ali or Sarah Hassan)

5. **Verify tabs show data**:
   - ✅ Visits tab: Shows clinical visits
   - ✅ Medications tab: Shows prescribed medications
   - ✅ Labs tab: Shows lab test results
   - ✅ Scans tab: Shows imaging studies

## Debug Information

Check console logs for:
- Mock data initialization messages
- Query execution logs
- API endpoint calls
- Data retrieval confirmation

## Notes

- The queries now use `socialSecurityNumber` (National ID) as the primary identifier
- Mock data still uses `patientId` internally but maps from SSN for demonstration
- In production, the backend API will handle the SSN-to-ID mapping internally
- All forms (LabForm, ScanForm, MedicationDialog) already receive the correct `socialSecurityNumber` parameter
