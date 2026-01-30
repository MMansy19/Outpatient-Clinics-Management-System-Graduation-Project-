# Quick Reference Guide - Doctor Screens Enhancement

## 🎯 Most Important Components

### 1. **BaseFormDialog** - The Foundation
```typescript
import { BaseFormDialog } from '@/components/shared';

<BaseFormDialog
  open={open}
  onOpenChange={setOpen}
  title="Create Entity"
  isPending={isPending}
  onSubmit={form.handleSubmit(onSubmit)}
  submitLabel="Save"
  cancelLabel="Cancel"
  size="lg"
>
  {/* Your form fields here */}
</BaseFormDialog>
```

### 2. **useFormState** - State Management
```typescript
import { useFormState } from '@/src/hooks';

const { isPending, execute } = useFormState({
  onSuccess: () => onSuccess?.(),
  successMessage: 'Created successfully!',
});

execute(() => myMutation.mutateAsync(data));
```

### 3. **EntityListItem** - Lists
```typescript
import { EntityListItem } from '@/components/shared';

<EntityListItem
  entity={visit}
  icon={Activity}
  title={visit.chief_complaint}
  subtitle={`Dr. ${visit.doctor.name}`}
  date={visit.created_at}
  onClick={() => handleSelect(visit)}
  actions={<Button>Edit</Button>}
/>
```

### 4. **QuickActionCard** - Actions
```typescript
import { QuickActionCard } from '@/components/shared';

<QuickActionCard
  icon={Plus}
  title="New Visit"
  description="Create a new visit"
  onClick={() => setIsVisitDialogOpen(true)}
  variant="primary"
  size="lg"
/>
```

### 5. **EmptyState** - Empty Data
```typescript
import { EmptyState } from '@/components/shared';

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

## 📱 Mobile-First Pattern

### Desktop: Centered Dialog
```typescript
<BaseFormDialog open={isOpen} ... />
// Appears as centered modal
```

### Mobile: Fullscreen Dialog
```typescript
<BaseFormDialog open={isOpen} ... />
// Automatically fullscreen on mobile
```

---

## 🔧 Dialog Pattern

### Step 1: Create State
```typescript
const [isDialogOpen, setIsDialogOpen] = useState(false);
```

### Step 2: Add Button
```typescript
<Button onClick={() => setIsDialogOpen(true)}>
  New Entity
</Button>
```

### Step 3: Add Dialog
```typescript
<MyDialog
  open={isDialogOpen}
  onOpenChange={setIsDialogOpen}
  onSuccess={() => setIsDialogOpen(false)}
/>
```

---

## 📦 Import Patterns

### Old Way (Individual)
```typescript
import { BaseFormDialog } from '@/components/shared/BaseFormDialog';
import { EntityListItem } from '@/components/shared/EntityListItem';
```

### New Way (Barrel Exports)
```typescript
import { BaseFormDialog, EntityListItem } from '@/components/shared';
```

---

## 🎨 Common Patterns

### List with Empty State
```typescript
{isLoading ? (
  <div className="space-y-2">
    <div className="skeleton h-16 w-full" />
    <div className="skeleton h-16 w-full" />
  </div>
) : items.length > 0 ? (
  <div className="space-y-3">
    {items.map(item => (
      <EntityListItem
        key={item.id}
        entity={item}
        icon={Icon}
        title={item.title}
        onClick={() => handleSelect(item)}
      />
    ))}
  </div>
) : (
  <EmptyState
    icon={Icon}
    title="No items yet"
    action={{ label: "Create", onClick: () => setOpen(true) }}
  />
)}
```

### Form with Loading
```typescript
const { isPending, execute } = useFormState({
  onSuccess: () => onSuccess?.(),
});

<BaseFormDialog
  open={open}
  onOpenChange={setOpen}
  isPending={isPending}
  onSubmit={form.handleSubmit((data) => {
    execute(() => createMutation.mutateAsync(data));
  })}
>
  <FormField ... />
</BaseFormDialog>
```

---

## 📱 Mobile Features

### Bottom Tabs (PatientProfile)
```typescript
// Automatic on mobile, tabs on desktop
<Tabs defaultValue="visits">
  <TabsList className="hidden md:grid"> {/* Desktop */}
    <TabsTrigger>Visits</TabsTrigger>
  </TabsList>
  <MobileTabNavigation ... /> {/* Mobile */}
</Tabs>
```

### Touch Targets
```typescript
// Always use minimum 44px height
<Button className="min-h-[44px]">
  Action
</Button>
```

---

## 🎯 Quick Decisions

### Need a list item? → Use EntityListItem
### Need an action button? → Use QuickActionCard
### Need an empty state? → Use EmptyState
### Need a form? → Use BaseFormDialog
### Need state management? → Use useFormState
### Need responsive? → Already built-in!

---

## 📚 Documentation Links

- **ENHANCEMENTS.md** - Full documentation
- **MIGRATION_GUIDE.md** - Migration instructions
- **QUICK_REFERENCE.md** - This file

---

## 🚀 Quick Start Checklist

- [ ] Import from barrel exports
- [ ] Use BaseFormDialog for all forms
- [ ] Use useFormState for form logic
- [ ] Use EntityListItem for lists
- [ ] Use QuickActionCard for actions
- [ ] Use EmptyState for empty data
- [ ] Test on mobile devices
- [ ] Ensure 44px minimum touch targets

---

**💡 Pro Tip**: All components are mobile-first and automatically responsive. Just use them and they'll work on all devices!
