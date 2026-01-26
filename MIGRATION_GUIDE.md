# Migration Guide: Doctor Screens Enhancement

## 📋 Overview

This guide helps you migrate from the old doctor screens to the new enhanced version with reusable components, dialog-based forms, and mobile-first design.

---

## 🚀 Quick Start

### Using New Components

```typescript
// OLD WAY - Importing individual components
import { VisitForm } from '@/components/doctor/VisitForm';
import { MedicationForm } from '@/components/doctor/MedicationForm';

// NEW WAY - Using index exports
import { VisitDialog, MedicationDialog } from '@/components/doctor';
import { EntityListItem, EmptyState } from '@/components/shared';
import { useFormState, usePatientData } from '@/src/hooks';
```

---

## 📝 Form Migration

### Visit Form

#### **Old Pattern:**
```typescript
// Old full-page form
<VisitForm
  patientId={String(patientId)}
  onSuccess={handleVisitCreated}
  onCancel={() => setCurrentView('profile')}
/>
```

#### **New Dialog Pattern:**
```typescript
// New dialog-based form
const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);

<>
  <Button onClick={() => setIsVisitDialogOpen(true)}>
    New Visit
  </Button>

  <VisitDialog
    open={isVisitDialogOpen}
    onOpenChange={setIsVisitDialogOpen}
    patientId={String(patientId)}
    onSuccess={() => setIsVisitDialogOpen(false)}
  />
</>
```

---

### Medication Form

#### **Old Pattern:**
```typescript
// Old full-page form
{isMedicationFormOpen && (
  <Card>
    <MedicationForm
      patientId={String(patientId)}
      onSuccess={() => setIsMedicationFormOpen(false)}
      onCancel={() => setIsMedicationFormOpen(false)}
    />
  </Card>
)}
```

#### **New Dialog Pattern:**
```typescript
// New dialog-based form
<MedicationDialog
  open={isMedicationDialogOpen}
  onOpenChange={setIsMedicationDialogOpen}
  patientId={String(patientId)}
  onSuccess={() => setIsMedicationDialogOpen(false)}
/>
```

---

## 📱 Patient Profile Migration

### **Old Pattern:**
```typescript
import { PatientProfile } from '@/components/doctor/PatientProfile';

<PatientProfile
  patientId={String(patientId)}
  patient={patientData}
  onNewVisit={handleNewVisit}
  onNewMedication={handleNewMedication}
  onNewLab={handleNewLab}
  onNewScan={handleNewScan}
/>
```

### **New Enhanced Pattern:**
```typescript
import { PatientProfileEnhanced } from '@/components/doctor/PatientProfileEnhanced';

// Use new enhanced profile with dialogs
<PatientProfileEnhanced
  patientId={String(patientId)}
  patient={patientData}
  onNewVisit={() => setIsVisitDialogOpen(true)}
/>

// Dialogs are handled internally
<VisitDialog ... />
<MedicationDialog ... />
<LabForm ... />
<ScanForm ... />
```

---

## 🎨 Component Migration

### EntityListItem

#### **Old Pattern:**
```typescript
// Custom list items with duplication
<div className="flex items-start justify-between gap-4 p-3 rounded-lg border hover:bg-accent">
  <div className="flex-1">
    <p className="font-medium">{visit.chief_complaint}</p>
    <p className="text-sm text-muted-foreground">{visit.diagnosis}</p>
  </div>
  <div className="text-right">
    <p className="text-sm font-medium">{formatDate(visit.created_at)}</p>
  </div>
</div>
```

#### **New Pattern:**
```typescript
import { EntityListItem } from '@/components/shared/EntityListItem';

<EntityListItem
  entity={visit}
  icon={Activity}
  title={visit.chief_complaint}
  subtitle={visit.diagnosis}
  date={visit.created_at}
  onClick={() => handleSelect(visit)}
  actions={
    <Button onClick={(e) => {
      e.stopPropagation();
      handleEdit(visit);
    }}>
      Edit
    </Button>
  }
/>
```

---

### EmptyState

#### **Old Pattern:**
```typescript
<div className="text-center py-8">
  <p className="text-muted-foreground">No visits found</p>
</div>
```

#### **New Pattern:**
```typescript
import { EmptyState } from '@/components/shared/EmptyState';

<EmptyState
  icon={Activity}
  title="No visits yet"
  description="Create your first visit to get started"
  action={{
    label: "Create Visit",
    onClick: () => setIsVisitDialogOpen(true),
  }}
/>
```

---

### QuickActionCard

#### **Old Pattern:**
```typescript
<Button
  onClick={() => setCurrentView('search')}
  className="h-20 bg-medical-primary hover:bg-medical-primary/90"
>
  <Search className="mr-2 h-5 w-5" />
  Search Patients
</Button>
```

#### **New Pattern:**
```typescript
import { QuickActionCard } from '@/components/shared/QuickActionCard';

<QuickActionCard
  icon={Search}
  title="Search Patients"
  description="Find existing patients"
  onClick={() => setCurrentView('search')}
  variant="primary"
/>
```

---

## 🔧 Hook Migration

### useFormState

#### **Old Pattern:**
```typescript
// Manual state management
const [isPending, setIsPending] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (data) => {
  setIsPending(true);
  setError(null);
  try {
    await createVisit(data);
    toast.success('Success!');
    onSuccess?.();
  } catch (err) {
    setError(err.message);
    toast.error(err.message);
  } finally {
    setIsPending(false);
  }
};
```

#### **New Pattern:**
```typescript
import { useFormState } from '@/src/hooks/useFormState';

// Simplified state management
const { isPending, execute } = useFormState({
  onSuccess: () => onSuccess?.(),
  successMessage: 'Visit created successfully!',
});

const handleSubmit = (data) => {
  execute(() => createVisit(data));
};
```

---

### usePatientData

#### **Old Pattern:**
```typescript
// Multiple separate queries
const { data: visits } = useGetPatientVisits(patientId);
const { data: medications } = useGetPatientMedications(patientId);
const { data: labs } = useGetPatientLabs(patientId);
const { data: scans } = useGetPatientScans(patientId);

const totalVisits = visits?.length || 0;
// Manual calculations...
```

#### **New Pattern:**
```typescript
import { usePatientData } from '@/src/hooks/usePatientData';

// Unified data fetching
const {
  visits,
  medications,
  labs,
  scans,
  isLoading,
  stats,
} = usePatientData(patientId);

// Pre-computed stats
const { totalVisits, latestVisit } = stats;
```

---

## 🎯 Dialog Migration

### Creating New Dialog

```typescript
import { BaseFormDialog } from '@/components/shared/BaseFormDialog';
import { useFormState } from '@/src/hooks/useFormState';

function MyEntityDialog({ open, onOpenChange, onSuccess }) {
  const form = useForm();
  const { isPending, execute } = useFormState({
    onSuccess: () => onSuccess?.(),
  });

  return (
    <BaseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Entity"
      isPending={isPending}
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      {/* Form fields */}
    </BaseFormDialog>
  );
}
```

---

## 📐 Responsive Design

### Old Mobile Pattern:
```typescript
// Manual responsive classes
<div className="flex flex-col gap-4 md:flex-row">
  <Button className="h-20" />
  <Button className="h-20" />
</div>
```

### New Mobile Pattern:
```typescript
// Using responsive components
<QuickActionCard
  title="Action"
  onClick={handleClick}
  className="min-h-[56px]" // Automatic responsive
/>
```

---

## 🔄 State Management

### Dialog State (Old → New)

#### **Old:**
```typescript
const [isLabFormOpen, setIsLabFormOpen] = useState(false);
const [isScanFormOpen, setIsScanFormOpen] = useState(false);
const [isMedicationFormOpen, setIsMedicationFormOpen] = useState(false);
```

#### **New:**
```typescript
// More semantic state names
const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
const [isMedicationDialogOpen, setIsMedicationDialogOpen] = useState(false);
// useFormState handles open/close internally
```

---

## 🎨 Styling Changes

### Old Button:
```typescript
<Button
  onClick={handleClick}
  className="h-20 bg-medical-primary hover:bg-medical-primary/90"
>
  <Icon className="mr-2 h-5 w-5" />
  Action
</Button>
```

### New QuickActionCard:
```typescript
<QuickActionCard
  icon={Icon}
  title="Action"
  description="Optional description"
  onClick={handleClick}
  variant="primary"
  size="lg"
/>
```

---

## 📦 Import Paths

### Old Paths:
```typescript
// Multiple individual imports
import { BaseFormDialog } from '@/components/shared/BaseFormDialog';
import { EntityListItem } from '@/components/shared/EntityListItem';
import { useFormState } from '@/src/hooks/useFormState';
```

### New Paths (Barrel Exports):
```typescript
// Consolidated imports
import {
  BaseFormDialog,
  EntityListItem,
  QuickActionCard,
  EmptyState,
} from '@/components/shared';

import { useFormState, usePatientData } from '@/src/hooks';
```

---

## 🔧 Type Definitions

### New Form Types:

```typescript
// Visit Dialog Props
interface VisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onSuccess?: (visitId: string) => void;
}

// Edit Dialog Props
interface VisitEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit: {
    id: string;
    diagnoses: string;
    clinicId?: string;
  };
  onSuccess?: () => void;
}
```

---

## 📊 Migration Checklist

### Forms:
- [ ] Replace full-page forms with dialogs
- [ ] Use `useFormState` hook
- [ ] Add proper loading states
- [ ] Test on mobile (fullscreen)

### Lists:
- [ ] Replace custom list items with `EntityListItem`
- [ ] Add `EmptyState` for empty data
- [ ] Add loading skeletons

### Actions:
- [ ] Replace buttons with `QuickActionCard`
- [ ] Add proper icons
- [ ] Use appropriate variants

### Data Fetching:
- [ ] Replace multiple queries with `usePatientData`
- [ ] Use computed stats
- [ ] Add refetchAll function

### Mobile:
- [ ] Test all interactions on mobile
- [ ] Ensure touch targets ≥ 44px
- [ ] Test dialog fullscreen mode
- [ ] Verify bottom tabs work

---

## 🚨 Breaking Changes

### 1. Form Components Renamed:
- `VisitForm` → `VisitDialog`
- `MedicationForm` → `MedicationDialog`

### 2. Patient Profile:
- `PatientProfile` → `PatientProfileEnhanced`

### 3. Import Paths:
- Components now use barrel exports

### 4. Dialog State:
- Must manage `open` and `onOpenChange` props

---

## 📝 Step-by-Step Migration

### Step 1: Update Imports
```typescript
// Replace individual imports with barrel exports
import {
  VisitDialog,
  MedicationDialog,
  LabForm,
  ScanForm,
} from '@/components/doctor';

import {
  BaseFormDialog,
  EntityListItem,
  QuickActionCard,
  EmptyState,
} from '@/components/shared';

import { useFormState, usePatientData } from '@/src/hooks';
```

### Step 2: Replace Forms
```typescript
// Old: <VisitForm ... />
// New:
const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);

<Button onClick={() => setIsVisitDialogOpen(true)}>
  New Visit
</Button>

<VisitDialog
  open={isVisitDialogOpen}
  onOpenChange={setIsVisitDialogOpen}
  patientId={String(patientId)}
  onSuccess={() => setIsVisitDialogOpen(false)}
/>
```

### Step 3: Update Lists
```typescript
// Old: Custom list items
// New: EntityListItem
<EntityListItem
  entity={item}
  icon={Icon}
  title={item.title}
  subtitle={item.subtitle}
  onClick={() => handleSelect(item)}
/>
```

### Step 4: Add Loading States
```typescript
// Old: Basic loading
{loading ? <div>Loading...</div> : <List />}

// New: Skeleton loading
{loading ? (
  <div className="space-y-2">
    <div className="skeleton h-16 w-full" />
    <div className="skeleton h-16 w-full" />
  </div>
) : (
  <List />
)}
```

### Step 5: Test Mobile
- [ ] Open dialogs (should be fullscreen)
- [ ] Touch targets ≥ 44px
- [ ] Bottom tabs work
- [ ] FAB accessibility

---

## 🎓 Best Practices

### 1. Always Use Dialogs
✅ **DO:**
```typescript
<VisitDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  ...
/>
```

❌ **DON'T:**
```typescript
{isOpen && <VisitForm /> /* Full page form */}
```

### 2. Use Custom Hooks
✅ **DO:**
```typescript
const { isPending, execute } = useFormState({ ... });
```

❌ **DON'T:**
```typescript
// Manual state management
const [loading, setLoading] = useState(false);
// ... more state
```

### 3. Mobile-First Design
✅ **DO:**
```typescript
<QuickActionCard ... />
// Automatic responsive
```

❌ **DON'T:**
```typescript
<Button className="h-20 md:h-20" // Manual responsive
```

### 4. Use EntityListItem
✅ **DO:**
```typescript
<EntityListItem entity={item} ... />
```

❌ **DON'T:**
```typescript
// Custom list items with duplication
<div className="..."> ... </div>
```

---

## 🆘 Troubleshooting

### Issue: Dialog not opening
**Solution:** Check `open` and `onOpenChange` props are properly set

### Issue: Form submission fails
**Solution:** Ensure `execute` function from `useFormState` is called

### Issue: Mobile view looks broken
**Solution:** Use `BaseFormDialog` which handles responsive automatically

### Issue: List items not styled correctly
**Solution:** Use `EntityListItem` component

### Issue: Loading states not showing
**Solution:** Use `FormSkeleton` or manual skeleton loading

---

## 📚 Resources

- **ENHANCEMENTS.md** - Comprehensive documentation
- **Components** - `/components/shared/` and `/components/doctor/`
- **Hooks** - `/src/hooks/`
- **Utils** - `/src/utils/`

---

## 💬 Support

For questions or issues:
1. Check this migration guide
2. Review component examples
3. Test on actual devices
4. Use React DevTools for debugging

---

**Migration Complete!** 🎉

Your app now uses modern, reusable components with mobile-first design!
