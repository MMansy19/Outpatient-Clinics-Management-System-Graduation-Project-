# Phase 3: Admin Module - Implementation Guide

## ✅ Completed Components

### 1. Clinic Management System
- **Types & Schemas**:
  - `types/entities/Clinic.ts`: Clinic, ClinicWithStats, ClinicFormData interfaces
  - `lib/schemas/clinicSchema.ts`: Zod validation for clinic forms

- **API Hooks**:
  - `lib/api/queries/useClinics.ts`: React Query hooks for clinic CRUD
    - `useGetClinics()`: Fetch all clinics
    - `useGetClinicsWithStats()`: Fetch clinics with doctor/patient counts
    - `useGetClinic(id)`: Fetch single clinic
    - `useCreateClinic()`: Create new clinic
    - `useUpdateClinic()`: Update clinic
    - `useDeleteClinic()`: Soft delete clinic

- **Admin Components**:
  - `components/admin/ClinicTable.tsx`: Data table with search, edit, delete actions
  - `components/admin/AddClinicDialog.tsx`: Create clinic form dialog
  - `components/admin/EditClinicDialog.tsx`: Update clinic form dialog

- **Pages**:
  - `app/[locale]/admin/dashboard/page.tsx`: Admin dashboard with stats cards and clinic table

- **User Management API Hooks**:
  - `lib/api/queries/useUsers.ts`: React Query hooks for doctor/patient management
    - `useGetDoctors(clinicId?)`: Fetch all doctors (optionally filtered by clinic)
    - `useCreateDoctor()`: Create new doctor
    - `useUpdateDoctor()`: Update doctor
    - `useDeleteDoctor()`: Soft delete doctor
    - `useGetPatients(searchQuery?)`: Fetch patients with search
    - `useDeletePatient()`: Soft delete patient

- **Translations**:
  - `messages/en.json`: Added comprehensive admin module translations
  - `messages/ar.json`: Added Arabic translations with RTL support

## 📋 Installation Required

Before running the application, install dependencies:

```powershell
cd codeblue-frontend
pnpm install
```

Additional packages needed for remaining Phase 3 tasks:
```powershell
pnpm add qrcode @types/qrcode
```

## 🔌 Backend API Endpoints Expected

### Clinic Endpoints
- `GET /api/clinics` - List all clinics
- `GET /api/clinics/stats` - List clinics with statistics (doctor_count, patient_count, today_visits)
- `GET /api/clinics/:id` - Get single clinic
- `POST /api/clinics` - Create clinic (requires admin role)
- `PATCH /api/clinics/:id` - Update clinic (requires admin role)
- `DELETE /api/clinics/:id` - Soft delete clinic (requires admin role)

### Admin User Management Endpoints
- `GET /api/admin/doctors?clinic_id={id}` - List doctors (optionally by clinic)
- `POST /api/admin/doctors` - Create doctor account
- `PATCH /api/admin/doctors/:id` - Update doctor
- `DELETE /api/admin/doctors/:id` - Soft delete doctor
- `GET /api/admin/patients?search={query}` - List patients with search
- `DELETE /api/admin/patients/:id` - Soft delete patient

### Expected Request/Response Formats

**Create Clinic Request**:
```json
{
  "name": "Internal Medicine Clinic",
  "department": "Cardiology",
  "description": "Main cardiology clinic",
  "location": "Building A / Floor 2 / Room 201",
  "phone_number": "01234567890"
}
```

**Clinic Response**:
```json
{
  "id": 1,
  "global_id": "uuid-string",
  "name": "Internal Medicine Clinic",
  "department": "Cardiology",
  "description": "Main cardiology clinic",
  "location": "Building A / Floor 2 / Room 201",
  "phone_number": "01234567890",
  "is_deleted": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Clinic with Stats Response**:
```json
{
  "id": 1,
  "global_id": "uuid-string",
  "name": "Internal Medicine Clinic",
  "department": "Cardiology",
  "doctor_count": 5,
  "patient_count": 120,
  "today_visits": 8,
  ...other clinic fields
}
```

## 🎨 UI Components Used

All components use Shadcn UI components:
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableHead`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`
- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- `Input`, `Textarea`, `Button`
- `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`
- `AlertDialog` for delete confirmations

Install Shadcn components if not already installed:
```powershell
pnpm dlx shadcn-ui@latest add table dialog form input textarea button dropdown-menu alert-dialog
```

## 🔐 Route Protection

The admin dashboard is protected with `AuthGuard`:
```tsx
<AuthGuard allowedRoles={[UserRole.ADMIN]} locale={locale}>
  {/* Admin content */}
</AuthGuard>
```

Non-admin users attempting to access `/admin/dashboard` will be redirected to `/login?redirect=/admin/dashboard`.

## 🧪 Testing Checklist

1. **Clinic Management**:
   - [ ] Navigate to `/en/admin/dashboard` (admin login required)
   - [ ] Click "Add Clinic" button, fill form with validation
   - [ ] Search for clinics using the search input
   - [ ] Edit clinic via dropdown menu
   - [ ] Delete clinic with confirmation dialog
   - [ ] Verify stats cards show correct counts

2. **User Management** (not yet implemented in UI):
   - API hooks ready: `useGetDoctors`, `useGetPatients`, `useDeleteDoctor`, `useDeletePatient`

3. **Bilingual Support**:
   - [ ] Switch to Arabic locale `/ar/admin/dashboard`
   - [ ] Verify RTL layout and Arabic translations

4. **Validation**:
   - [ ] Try creating clinic with empty name (should show error)
   - [ ] Try phone number with letters (should show "Invalid phone number")
   - [ ] Test description length limit (500 chars)

## ✅ Additional Components Completed

### 1. Doctor Management Table ✅
- **Component**: `components/admin/DoctorTable.tsx`
- Display doctors with clinic names (using `useGetDoctors`)
- Filter by clinic dropdown with all clinics option
- Search by name, email, or specialization
- Delete action with confirmation dialog
- Shows: name, specialization, license number, clinic, email, phone

### 2. Patient Management Table ✅
- **Component**: `components/admin/PatientTable.tsx`
- Display patients with search (using `useGetPatients`)
- Shows: national_id, name, gender, age, phone, email
- Delete action with confirmation dialog
- Age calculated from birthdate
- Gender badges with color coding

### 3. QR Code Generator ✅
- **Component**: `components/admin/QRCodeGenerator.tsx`
- Generates QR codes for patient registration URLs
- Clinic selection dropdown
- QR code includes: `${baseUrl}/register?clinic_id=${id}&role=patient`
- Download QR code as PNG with clinic name in filename
- Medical theme colors (Navy blue for QR code)

### 4. Dashboard Enhancement ✅
- **Updated**: `app/[locale]/admin/dashboard/page.tsx`
- Tabbed interface for Clinics, Doctors, Patients management
- QR Code Generator button in header
- All tables integrated into single dashboard
- Maintains stats cards for overview

### 5. Additional Pages ✅
- **Created**: `app/[locale]/admin/doctors/page.tsx` - Dedicated doctor management page
- **Created**: `app/[locale]/admin/patients/page.tsx` - Dedicated patient management page
- Both pages protected with AuthGuard (admin only)

## 🚧 Optional Enhancements

### 1. Dashboard Stats Integration
- Connect stats cards to real API data from `useGetClinicsWithStats`
- Add aggregate stats endpoint: `/api/admin/stats`
- Show total clinics, doctors, patients, today's visits

### 2. System Monitoring Dashboard
- Create `app/[locale]/admin/monitoring/page.tsx`
- Display system health metrics
- Show recent activity logs
- Performance metrics

## 📝 Code Quality Notes

- ✅ All components use TypeScript strict mode (no 'any' types)
- ✅ Forms validated with Zod schemas
- ✅ React Query hooks with proper error handling
- ✅ Bilingual support with next-intl
- ✅ Medical theme colors applied
- ✅ Soft delete pattern implemented
- ✅ Components under 100 lines (modular)
- ✅ Toast notifications for user feedback

## 🔄 Next Steps

1. Install remaining dependencies: `pnpm add qrcode @types/qrcode`
2. Test clinic CRUD operations with backend
3. Implement doctor management UI
4. Implement patient management UI
5. Add QR code generation feature
6. Create system monitoring dashboard (Phase 3.5)

## 📚 Related Documentation

- [Phase 2 Auth Guide](./PHASE_2_AUTH_GUIDE.md)
- [Technical Documentation](./Docs/Prompts/Technical%20Documentation.md)
- [UI & UX Documentation](./Docs/Prompts/UI%20&%20UX%20Documentation.md)
- [Phased Development Plan](./Docs/Prompts/Phased%20Development%20Plan.md)
