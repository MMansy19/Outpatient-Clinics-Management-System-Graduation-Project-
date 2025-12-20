# Patient Search Implementation Guide

## Overview

The patient search module provides comprehensive search and filtering capabilities for doctors to quickly find patients using multiple criteria.

## Features

### ✅ Implemented Search Capabilities

#### 1. **General Text Search** (`query`)
- Searches across multiple fields simultaneously:
  - Patient name (partial match, case-insensitive)
  - National ID (partial match)
  - Email address (partial match)
  - Phone number (partial match)
- **Debounced**: 500ms delay to reduce API calls
- **Performance**: Optimal for real-time search

**Example:**
```typescript
// Search for "Ahmed" - will match:
// - Name: "Ahmed Mohamed"
// - Email: "ahmed@example.com"
// - Phone: "01234567890" (if contains "ahmed")
```

#### 2. **National ID Search** (`nationalId`)
- **Exact match** search for specific patient
- Separate from general query for precision
- **Debounced**: 300ms (faster than general search)
- **Use case**: When you have the exact national ID

**Example:**
```typescript
// National ID: "29501011234567" (exact match)
```

#### 3. **Age Range Filtering** (`minAge`, `maxAge`)
- Filter patients by age range
- Calculated from birthdate automatically
- Can use min only, max only, or both
- **Range**: 0-150 years

**Examples:**
```typescript
// Pediatric patients: minAge: 0, maxAge: 18
// Adult patients: minAge: 18, maxAge: 65
// Elderly: minAge: 65
```

#### 4. **Gender Filter** (`gender`)
- Filter by: Male, Female, or All
- Works in combination with other filters

#### 5. **Date Period Filter** (`period`)
- Pre-defined periods:
  - Today
  - This week
  - This month
  - Custom range (with startDate/endDate)
- Filters based on patient creation date

#### 6. **Clinic Filter** (`clinicId`)
- Filter patients by specific clinic
- Shows "All Clinics" by default
- Useful for multi-clinic practices

---

## Optimal Search Strategies

### 🎯 Best Practices

#### **Scenario 1: Quick Patient Lookup by Name**
```typescript
// Use general query search
filters = {
  query: "ahmed"  // Fast, case-insensitive, partial match
}
```
**Performance**: Excellent ⚡ (debounced, single field search)

---

#### **Scenario 2: Find Patient by National ID**
```typescript
// Use dedicated nationalId field
filters = {
  nationalId: "29501011234567"  // Exact match
}
```
**Performance**: Fastest 🚀 (exact match, indexed field)

**Why not use `query`?**: 
- `nationalId` is more precise
- Avoids false positives
- Faster execution (exact match vs partial)

---

#### **Scenario 3: Filter Pediatric Patients**
```typescript
filters = {
  minAge: 0,
  maxAge: 18,
  period: "month"  // Recent patients
}
```
**Performance**: Good ✅ (calculated field, but cached)

---

#### **Scenario 4: Complex Multi-Filter Search**
```typescript
filters = {
  query: "cardiac",     // Search in name/notes
  gender: "male",
  minAge: 40,
  maxAge: 70,
  clinicId: 1,          // Cardiology clinic
  period: "month"
}
```
**Performance**: Moderate ⚠️ (multiple filters, use pagination)

---

## Performance Optimization Tips

### 1. **Debouncing**
```typescript
// General search: 500ms
const debouncedSearch = useDebounce(searchQuery, 500);

// National ID: 300ms (faster, more specific)
const debouncedNationalId = useDebounce(nationalId, 300);
```

### 2. **Conditional Query Execution**
The search only executes when at least one filter is active:

```typescript
enabled: !!filters.query || !!filters.period || !!filters.nationalId || 
         !!filters.gender || filters.minAge !== undefined
```

This prevents unnecessary API calls on page load.

### 3. **Query Caching**
```typescript
staleTime: 2 * 60 * 1000, // 2 minutes cache
```
- Results are cached for 2 minutes
- Same search reuses cached data
- Reduces backend load

### 4. **Filter Combination Efficiency**

**Most Efficient (Order of execution):**
1. `nationalId` - Exact match, fastest
2. `gender` - Simple enum comparison
3. `clinicId` - Indexed foreign key
4. `minAge`/`maxAge` - Calculated, moderate
5. `query` - Text search, slowest (but still fast with debouncing)

**Recommendation**: Use specific filters first, then add general query

---

## Backend Integration

### API Endpoint
```
GET /doctor/patients?search=query&national_id=xxx&gender=male&min_age=18&max_age=65&clinic_id=1
```

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | General text search | `ahmed` |
| `national_id` | string | Exact national ID | `29501011234567` |
| `gender` | enum | `male` or `female` | `male` |
| `min_age` | number | Minimum age | `18` |
| `max_age` | number | Maximum age | `65` |
| `clinic_id` | number | Clinic filter | `1` |
| `period` | enum | Time period | `today`, `week`, `month` |
| `start_date` | ISO date | Custom start date | `2024-01-01T00:00:00Z` |
| `end_date` | ISO date | Custom end date | `2024-12-31T23:59:59Z` |

### Expected Response
```typescript
{
  patients: Patient[];
  total: number;
}
```
