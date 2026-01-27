# Untranslated English Strings - Comprehensive Report

## Overview
This report identifies all hardcoded English text strings in the codebase that need to be added to the translation files (`messages/en.json` and `messages/ar.json`) for proper Arabic localization support.

**Total Untranslated Strings Found:** 150+ unique strings

---

## 🔴 CRITICAL - High Priority Components

### 1. **components/doctor/AddPatientDialog.tsx**

#### Form Labels & Placeholders
```typescript
"First Name" → Add to: patient.firstName
"Last Name" → Add to: patient.lastName
"Job/Occupation *" → Add to: patient.job
"Preferred Language" → Add to: patient.preferredLanguage
"Select language" → Add to: patient.selectLanguage
"Arabic (العربية)" → Already translated ✓
"English" → Already translated ✓
```

#### Input Placeholders
```typescript
"John" → Add to: patient.firstNamePlaceholder
"Doe" → Add to: patient.lastNamePlaceholder
"123 Main Street, Cairo" → Add to: patient.addressPlaceholder
"Engineer" → Add to: patient.jobPlaceholder
```

---

### 2. **components/doctor/PatientProfile.tsx**

#### New Patient Alert Section
```typescript
"Patient Not Registered" → Add to: patient.notRegistered
"This National ID was scanned but the patient is not yet registered in the system. You can register them now or view the scanned information below." → Add to: patient.notRegisteredDescription
"Register New Patient" → Add to: patient.registerNew
```

#### Scanned Information Section
```typescript
"Scanned Information" → Add to: patient.scannedInfo
"Information extracted from National ID card" → Add to: patient.scannedInfoDescription
"Name" → Add to: patient.name
"National ID" → Add to: patient.nationalId
"Age" → Add to: patient.age
"years" → Add to: patient.years
"Unknown" → Add to: common.unknown
"Male" → Already translated ✓
"Female" → Already translated ✓
"Other" → Add to: common.other
```

#### Notification
```typescript
"Patient found via National ID scan" → Add to: patient.foundViaScan
```

#### Table Headers
```typescript
"Date" → Add to: table.date
"Doctor" → Add to: table.doctor
"Speciality" → Add to: table.speciality
"Diagnoses" → Add to: table.diagnoses
"Name" → Add to: table.name
"Dosage" → Add to: table.dosage
"Duration" → Add to: table.duration
"Comments" → Add to: table.comments
"Actions" → Add to: table.actions
"Type" → Add to: table.type
```

#### Vital Signs Units
```typescript
"kg" → Add to: vitals.kg
"cm" → Add to: vitals.cm
"mmHg" → Add to: vitals.mmHg
```

---

### 3. **components/doctor/NationalIdSearch.tsx**

```typescript
"Search by National ID" → Add to: scan.searchByNationalId
"Scan the patient's National ID or enter it manually" → Add to: scan.scanOrEnter
"Enter National ID" → Add to: scan.enterNationalId
"No patient found with this National ID" → Add to: scan.noPatientFound
"Would you like to register this patient?" → Add to: scan.registerPrompt
```

---

### 4. **components/doctor/PatientSearch.tsx**

```typescript
"Advanced Filters" → Add to: search.advancedFilters
"All Genders" → Add to: search.allGenders
"Min Age" → Add to: search.minAge
"Max Age" → Add to: search.maxAge
"Clinic" → Add to: search.clinic
"Enter national ID" → Add to: search.enterNationalId
"From" → Add to: search.from
"To" → Add to: search.to
```

---

## 🔴 DOCTOR FORM COMPONENTS

### 5. **components/doctor/LabForm.tsx**

```typescript
"Lab name is required" → Add to: validation.labNameRequired
"Lab created successfully" → Add to: lab.createdSuccess
"Lab Image" → Add to: lab.image
```

### 6. **components/doctor/ScanForm.tsx**

#### Scan Type Options
```typescript
"CT" → Add to: scanTypes.ct
"X-RAY" → Add to: scanTypes.xray
"ULTRA SOUND" → Add to: scanTypes.ultrasound
"PET CT" → Add to: scanTypes.petct
"MAMMOGRAPHY" → Add to: scanTypes.mammography
```

#### Validation & Messages
```typescript
"Scan name is required" → Add to: validation.scanNameRequired
"Scan type is required" → Add to: validation.scanTypeRequired
"Scan created successfully" → Add to: scan.createdSuccess
"Scan Image" → Add to: scan.image
```

### 7. **components/doctor/MedicationForm.tsx**

```typescript
"Unknown error" → Add to: validation.unknownError
```

### 8. **components/doctor/VisitDialog.tsx**

```typescript
"Diagnoses is required" → Add to: validation.diagnosesRequired
```

### 9. **components/doctor/VisitEditDialog.tsx**

```typescript
"Diagnosis" → Add to: visit.diagnosis
"Treatment Plan" → Add to: visit.treatmentPlan
"Notes" → Add to: visit.notes
"Diagnosis is required" → Add to: validation.diagnosisRequired
```

### 10. **components/doctor/LabEditDialog.tsx**

```typescript
"Lab name is required" → Add to: validation.labNameRequired
"Lab updated successfully" → Add to: lab.updatedSuccess
```

### 11. **components/doctor/ScanEditDialog.tsx**

```typescript
"Scan name is required" → Add to: validation.scanNameRequired
"Scan type is required" → Add to: validation.scanTypeRequired
"Scan updated successfully" → Add to: scan.updatedSuccess
```

### 12. **components/doctor/MedicationEditDialog.tsx**

```typescript
"Unknown error" → Add to: validation.unknownError
// (Similar validation messages as MedicationForm)
```

### 13. **components/doctor/HistoryTimeline.tsx**

```typescript
"Systolic" → Add to: vitals.systolic
"Diastolic" → Add to: vitals.diastolic
"Date" → Add to: table.date
"Lab Test" → Add to: lab.defaultName
"Results available" → Add to: lab.resultsAvailable
"Imaging Study" → Add to: scan.defaultName
"Report available" → Add to: scan.reportAvailable
"Medication" → Add to: medication.defaultName
"As prescribed" → Add to: medication.asPrescribed
```

### 14. **components/doctor/NationalIdScanner.tsx**

```typescript
"Selected ID" → Add to: scan.selectedId
```

---

## 🔴 ADMIN COMPONENTS

### 15. **components/admin/CreateDoctorDialog.tsx**

#### Medical Specialities Array
```typescript
"Cardiology" → Add to: specialities.cardiology
"Dermatology" → Add to: specialities.dermatology
"Endocrinology" → Add to: specialities.endocrinology
"Gastroenterology" → Add to: specialities.gastroenterology
"General Practice" → Add to: specialities.generalPractice
"General Surgery" → Add to: specialities.generalSurgery
"Hematology" → Add to: specialities.hematology
"Internal Medicine" → Add to: specialities.internalMedicine
"Nephrology" → Add to: specialities.nephrology
"Neurology" → Add to: specialities.neurology
"Obstetrics & Gynecology" → Add to: specialities.obstetricsGynecology
"Oncology" → Add to: specialities.oncology
"Ophthalmology" → Add to: specialities.ophthalmology
"Orthopedics" → Add to: specialities.orthopedics
"Otolaryngology (ENT)" → Add to: specialities.ent
"Pediatrics" → Add to: specialities.pediatrics
"Psychiatry" → Add to: specialities.psychiatry
"Pulmonology" → Add to: specialities.pulmonology
"Radiology" → Add to: specialities.radiology
"Rheumatology" → Add to: specialities.rheumatology
"Urology" → Add to: specialities.urology
```

#### Form Placeholders
```typescript
"30202041234567" → Add to: auth.nationalIdPlaceholder
```

#### Error Messages
```typescript
"Failed to load clinics" → Add to: validation.failedToLoadClinics
"Please check the form and try again." → Add to: validation.checkFormAndRetry
```

### 16. **components/admin/AddClinicDialog.tsx**

```typescript
"Clinic name is required" → Add to: validation.clinicNameRequired
"Speciality is required" → Add to: validation.specialityRequired
"Clinic created successfully" → Add to: clinic.createdSuccess
"Failed to create clinic" → Add to: clinic.createError
"Create a new clinic in the system" → Add to: clinic.createDescription
"Enter clinic name" → Add to: clinic.enterName
"Enter speciality (e.g., Dermatology)" → Add to: clinic.enterSpeciality
"Creating..." → Add to: clinic.creating
```

### 17. **components/admin/EditClinicDialog.tsx**

```typescript
"Clinic name is required" → Add to: validation.clinicNameRequired
"Speciality is required" → Add to: validation.specialityRequired
"Clinic updated successfully" → Add to: clinic.updatedSuccess
"Failed to update clinic" → Add to: clinic.updateError
"Update clinic information" → Add to: clinic.updateDescription
```

### 18. **components/admin/VisitTable.tsx**

```typescript
"Unknown Patient" → Add to: patient.unknownPatient
"Unknown Doctor" → Add to: doctor.unknownDoctor
"Failed to load visits" → Add to: validation.failedToLoadVisits
```

### 19. **components/admin/PatientTable.tsx**

```typescript
"Failed to load patients" → Add to: validation.failedToLoadPatients
```

### 20. **components/admin/ClinicTable.tsx**

```typescript
"Failed to load clinics" → Add to: validation.failedToLoadClinics
"Clinic deleted successfully" → Add to: clinic.deletedSuccess
"Failed to delete clinic" → Add to: clinic.deleteError
```

### 21. **components/admin/DoctorTable.tsx**

```typescript
"Failed to load doctors" → Add to: validation.failedToLoadDoctors
```

### 22. **components/admin/QRCodeGenerator.tsx**

```typescript
"QR Code" → Add to: qr.code
```

---

## 🔴 PAGE COMPONENTS

### 23. **app/[locale]/doctor/dashboard/page.tsx**

```typescript
"Logging out..." → Add to: auth.loggingOut
"Logout" → Add to: auth.logout
"Loading..." → Add to: common.loading
"Total patients" → Add to: doctor.totalPatients
"No diagnosis" → Add to: visit.noDiagnosis
"Male" → Already translated ✓
"Female" → Already translated ✓
"Other" → Add to: common.other
"Edit patient feature coming soon" → Add to: patient.editComingSoon
```

### 24. **app/[locale]/admin/dashboard/page.tsx**

#### Admin Dashboard Strings
```typescript
// All admin dashboard strings appear to be already translated ✓
```

### 25. **app/[locale]/api-test/page.tsx**

```typescript
"Success!" → Add to: api.success
"Failed: " → Add to: api.failed
"Admin creation endpoint - Implement as needed" → Add to: api.adminImplNeeded
"Doctor creation endpoint - Implement as needed" → Add to: api.doctorImplNeeded
"Clinic endpoint - Implement as needed" → Add to: api.clinicImplNeeded
```

---

## 📊 SUMMARY BY CATEGORY

### Form Labels & Placeholders: 45+ strings
- Patient registration forms
- Doctor creation forms
- Clinic management forms
- Input placeholders

### Validation Error Messages: 25+ strings
- Required field validations
- Success/error notifications
- Network error messages

### Toast/Notification Messages: 30+ strings
- Action confirmations
- Error messages
- Loading states

### Table Headers: 15+ strings
- Patient, Visit, Medication tables
- Sorting and filtering labels

### Button Text: 20+ strings
- Action buttons
- Navigation buttons
- Loading states

### Display Values: 20+ strings
- Gender options
- Status indicators
- Default/fallback text

### Select Options: 10+ strings
- Scan types
- Gender selection
- Language preferences

### Medical Specialties: 21 strings
- Complete list of medical specialties for doctor creation

---

## 🎯 RECOMMENDED ACTION PLAN

### Phase 1: Critical Patient-Facing Strings
1. PatientProfile.tsx - Patient information display
2. AddPatientDialog.tsx - Patient registration
3. NationalIdSearch.tsx - ID scanning

### Phase 2: Doctor Workflow Strings
4. VisitDialog.tsx & VisitEditDialog.tsx - Visit documentation
5. LabForm.tsx & LabEditDialog.tsx - Lab results
6. ScanForm.tsx & ScanEditDialog.tsx - Imaging
7. MedicationForm.tsx & MedicationEditDialog.tsx - Prescriptions

### Phase 3: Admin Management Strings
8. CreateDoctorDialog.tsx - Doctor creation (includes all medical specialties)
9. AddClinicDialog.tsx & EditClinicDialog.tsx - Clinic management
10. Table components (VisitTable, PatientTable, etc.)

### Phase 4: Dashboard & Navigation
11. Doctor dashboard page
12. Admin dashboard page
13. API test page

### Phase 5: Timeline & Charts
14. HistoryTimeline.tsx - Patient history visualization

---

## 📝 TRANSLATION KEY NAMING CONVENTION

**Recommended structure:**
- `common.*` - Shared across components (loading, error, success, etc.)
- `patient.*` - Patient-related strings
- `doctor.*` - Doctor-specific strings
- `admin.*` - Admin-specific strings
- `visit.*` - Visit documentation strings
- `lab.*` - Lab test strings
- `scan.*` - Imaging/scan strings
- `medication.*` - Medication strings
- `clinic.*` - Clinic management strings
- `table.*` - Table headers and labels
- `vitals.*` - Vital signs units and labels
- `validation.*` - Error messages and validations
- `specialities.*` - Medical specialties
- `scanTypes.*` - Types of scans/imaging
- `qr.*` - QR code related strings
- `api.*` - API test page strings

---

## ✅ IMPLEMENTATION NOTES

1. **Use existing translation files:**
   - `messages/en.json` (English - source)
   - `messages/ar.json` (Arabic - target)

2. **Translation function:**
   - Components use `useTranslations()` hook
   - Call `t('key')` to get translated string
   - Example: `t('patient.firstName')`

3. **Fallback handling:**
   - Some components use pattern: `t('key') || 'English Fallback'`
   - Remove fallbacks once translations are added

4. **Testing:**
   - Test in both English (`/en`) and Arabic (`/ar`) locales
   - Verify RTL (Right-to-Left) layout for Arabic
   - Check text expansion (Arabic text is 20-30% longer)

---

## 🚨 IMPORTANT NOTES

1. **Medical Specialties:** All 21 specialties in CreateDoctorDialog.tsx need Arabic translations
2. **Scan Types:** All imaging types (CT, X-RAY, etc.) need Arabic translations
3. **Units:** Vital signs units (kg, cm, mmHg) should remain as abbreviations
4. **Gender Options:** Ensure "Other" option is added and translated
5. **Form Validation:** All validation messages must be translated for user experience

---

## 📞 NEXT STEPS

1. **Create translation keys** in `messages/en.json`
2. **Add Arabic translations** in `messages/ar.json`
3. **Update components** to use `t('key')` instead of hardcoded strings
4. **Test thoroughly** in both locales
5. **Deploy and verify** Arabic support

---

*Report generated on: 2026-01-27*
*Total files analyzed: 25+ files*
*Total strings identified: 150+ unique strings*
