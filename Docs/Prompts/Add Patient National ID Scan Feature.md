# Add Patient with National ID Card OCR Scanning Feature

## 📋 Task Overview

**Objective:** Enhance the "Add Patient" workflow with optional National ID card scanning capability using device camera to automatically extract patient information (Full Name, Address, National ID number), reducing manual data entry errors and improving doctor productivity.

**Priority:** Mobile-First Implementation  
**Reusability:** Doctor-centric, simple and intuitive workflow  
**Timeline:** Post-MVP Enhancement (Q1 2025)

---

## 👤 User Story

**As a doctor**, I want to quickly register new patients by scanning their National ID card OR manually entering their information, so that I can save time and reduce data entry errors during busy clinic hours.

**Acceptance Criteria:**
1. Doctor can choose between two registration methods: "Scan ID" or "Manual Entry"
2. When selecting "Scan ID", the camera opens immediately for National ID capture
3. After successful scan, extracted data (Full Name, Address, National ID) is auto-populated in the form
4. Doctor can review and edit any auto-populated field before saving
5. If OCR fails or data is incomplete, doctor can manually correct/complete the information
6. Manual entry option works exactly as the current implementation (fallback)
7. All UI interactions are touch-optimized for mobile devices
8. The feature works seamlessly on iOS and Android devices

---

## 🎯 Technical Requirements

### 1. Architecture & Technology Stack

**Core Technologies:**
- **Next.js 15+** with App Router (Static Export for Capacitor)
- **TypeScript** (Strict mode, no `any` types)
- **Capacitor 6+** for native mobile capabilities
- **@capacitor/camera** for camera access
- **Backend AI Model** for OCR text extraction from ID cards (Python-based on backend)
- **Mock Data Service** for development until AI endpoint is ready
- **Shadcn UI + Konsta UI v5+** for native mobile feel
- **React Hook Form + Zod** for form validation
- **React Query** for API state management

**Reference Documentation:**
- Follow all guidelines in: `docs/Prompts/Web App to Native Mobile App with Capacitor.md`
- Maintain consistency with existing codebase patterns
- Ensure HIPAA/Privacy compliance for patient data handling

---

### 2. Backend API Contract

#### **National ID Scan Endpoint (To Be Implemented)**

**Endpoint:** `POST /api/v1/national-id/scan`

**Request:**
```json
{
  "image": "base64EncodedImageString..."
}
```

**Response (200 OK):**
```json
{
  "fullName": "أحمد محمد علي",
  "nationalId": "29501011234567",
  "address": "53 شارع التحرير، الدقي، الجيزة، مصر"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid image format or corrupted image
- `422 Unprocessable Entity`: Could not extract data from image (poor quality, wrong document type)
- `500 Internal Server Error`: AI model processing failed

**Notes:**
- Backend uses Python-based AI model (TensorFlow/PyTorch) for OCR
- Model trained on Egyptian National ID card format
- Expected processing time: 2-5 seconds
- Frontend derives gender and birthdate from the 14-digit National ID number
- Until this endpoint is ready, frontend uses mock data (see `mockNationalIdData.ts`)

#### **Existing Create Patient Endpoint (Already Implemented)**

**Endpoint:** `POST /api/v1/auth/patient/create`

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "language": 1,
  "socialSecurityNumber": "30202041234567",
  "address": "53 El tahrir street, Dokki, Giza, Egypt",
  "job": "Math teacher"
}
```

**Response (201 Created):**
```json
{
  "message": "Patient Created Successfully"
}
```

---

### 3. User Experience Flow (Mobile-First)

#### **Option A: Scan National ID (Recommended Flow)**

```
1. Doctor taps "Add New Patient" button
   ↓
2. Bottom sheet appears with two large touch-friendly options:
   - 📷 "Scan National ID" (Primary action)
   - ✍️ "Enter Manually" (Secondary action)
   ↓
3. [If "Scan National ID" selected]:
   - Camera opens in fullscreen mode
   - Display overlay guide (ID card frame outline)
   - Show capture button and cancel button
   - Display hint: "Align the front side of the National ID within the frame"
   ↓
4. After capture:
   - Show loading state: "Processing ID card..."
   - Send image to backend AI endpoint
   - Backend extracts (or mock returns):
     * Full Name (Arabic & English if available)
     * National ID Number (14 digits)
     * Address
     * Auto-derive: Gender, Birthdate (from ID number on frontend)
   ↓
5. Display confirmation preview:
   - Show captured image thumbnail (top)
   - Show extracted data in read-only cards
   - Two options:
     * ✅ "Use This Data" → Opens form with pre-filled data
     * 🔄 "Retake Photo" → Returns to camera
   ↓
6. Open AddPatientDialog with:
   - All extracted fields pre-populated
   - All fields remain editable (doctor can correct OCR errors)
   - Visual indicator showing "Auto-filled from ID scan"
   - Validation runs on submit (same as manual entry)
```

#### **Option B: Manual Entry (Fallback)**

```
1. Doctor taps "Add New Patient" button
   ↓
2. Bottom sheet appears with two options
   ↓
3. [If "Enter Manually" selected]:
   - Directly open AddPatientDialog
   - All fields empty (current behavior)
   - Standard form validation applies
```

---

### 3. UI/UX Design Requirements

#### **Mobile-First Design Principles**

**Touch Targets:**
- Minimum 44x44pt (iOS) / 48x48dp (Android) for all interactive elements
- Adequate spacing between buttons (16px minimum)
- No hover states (focus on tap/press states)

**Visual Hierarchy:**
- Primary action ("Scan ID") should be more prominent
- Use Konsta UI's native iOS/Android button styles
- Clear visual feedback for all interactions (ripple effects, pressed states)

**Loading States:**
- Skeleton loaders during OCR processing
- Progress indicators for camera initialization
- Clear error messages if camera permission denied

**Accessibility:**
- ARIA labels for all buttons
- Screen reader support for OCR results
- Haptic feedback on successful scan (iOS/Android)
- VoiceOver/TalkBack compatible

#### **Camera Interface (Fullscreen Native)**

```
┌─────────────────────────────┐
│  [×]                   [?]  │  ← Header (Close & Help icons)
│                             │
│                             │
│     ┌─────────────────┐     │
│     │                 │     │
│     │   ID CARD       │     │  ← Camera viewfinder with overlay guide
│     │   OUTLINE       │     │
│     │                 │     │
│     └─────────────────┘     │
│                             │
│  "Align ID within frame"    │  ← Instructional text
│                             │
│         [ CAPTURE ]         │  ← Large capture button (primary)
│         [ Cancel ]          │  ← Cancel button (text only)
└─────────────────────────────┘
```

#### **Selection Bottom Sheet (Native)**

```
┌─────────────────────────────┐
│    Add New Patient          │  ← Title
│─────────────────────────────│
│                             │
│  ┌───────────────────────┐  │
│  │   📷                  │  │
│  │   Scan National ID    │  │  ← Primary action (larger, colored)
│  │   Faster & Accurate   │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │   ✍️                   │  │
│  │   Enter Manually      │  │  ← Secondary action
│  │   Fill form yourself  │  │
│  └───────────────────────┘  │
│                             │
│         [ Cancel ]          │
└─────────────────────────────┘
```

#### **Preview Confirmation Screen**

```
┌─────────────────────────────┐
│  Review Scanned Data        │
│─────────────────────────────│
│  [ID Card Image Thumbnail]  │  ← Visual confirmation
│                             │
│  ┌─ Extracted Information ─┐│
│  │ Name: أحمد محمد علي     ││
│  │ ID: 29501011234567      ││
│  │ Address: Cairo, Egypt    ││
│  │ Gender: Male (auto)     ││
│  │ DOB: 01/01/1995 (auto) ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │   ✅ Use This Data      ││  ← Primary CTA
│  └─────────────────────────┘│
│                             │
│  🔄 Retake Photo            │  ← Secondary action (text link)
└─────────────────────────────┘
```

#### **Form with Pre-filled Data (AddPatientDialog Enhanced)**

```
┌─────────────────────────────┐
│  Add New Patient      [×]   │
│─────────────────────────────│
│  ℹ️ Auto-filled from ID scan │  ← Info badge
│                             │
│  First Name                 │
│  [ أحمد           ]  ✓      │  ← Pre-filled with checkmark
│                             │
│  Last Name                  │
│  [ علي            ]  ✓      │
│                             │
│  National ID                │
│  [ 29501011234567 ]  ✓      │
│                             │
│  Address                    │
│  [ Cairo, Egypt   ]  ✓      │
│                             │
│  ... (other fields)         │
│                             │
│  [ Cancel ]  [ Save Patient ]│
└─────────────────────────────┘
```

---

### 4. Technical Implementation Details

#### **File Structure**

```
components/
  doctor/
    AddPatientDialog.tsx                 (existing - enhance)
    PatientRegistrationSheet.tsx         (new - selection bottom sheet)
    NationalIdScanner.tsx                (new - camera + OCR)
    ScannedDataPreview.tsx               (new - review before form)
  
lib/
  api/
    nationalId.service.ts                (new - API calls for ID scanning)
    mockNationalIdData.ts                (new - mock OCR responses until API ready)
  services/
    nationalIdParser.service.ts          (new - parsing Egyptian ID format)
  hooks/
    useNationalIdScanner.ts              (new - manage scan flow)
    useCamera.ts                         (new - Capacitor camera wrapper)
    useScanNationalId.ts                 (new - React Query hook for API)
  schemas/
    auth.schemas.ts                      (enhance - add OCR validation)
  utils/
    nationalIdParser.ts                  (new - extract gender/DOB from ID)
    imageUtils.ts                        (new - image compression/base64 conversion)

types/
  ocr.ts                                 (new - OCR result interfaces)
```

#### **Key Components to Create**

##### **1. PatientRegistrationSheet Component**

```typescript
interface PatientRegistrationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectScanId: () => void;
  onSelectManualEntry: () => void;
}

// Native-feeling bottom sheet using Konsta UI
// Touch-optimized buttons with clear visual hierarchy
// Handles permission requests before opening camera
```

##### **2. NationalIdScanner Component**

```typescript
interface NationalIdScannerProps {
  open: boolean;
  onClose: () => void;
  onScanComplete: (data: ScannedIdData) => void;
  onError: (error: Error) => void;
}

interface ScannedIdData {
  fullNameArabic: string;
  fullNameEnglish?: string;
  nationalId: string;
  address: string;
  gender: 'male' | 'female'; // Auto-derived
  birthdate: Date; // Auto-derived
  confidence: number; // OCR confidence score
  rawImage: string; // Base64 for preview
}

// Features:
// - Fullscreen camera with overlay guide
// - Auto-capture on ID detection (optional)
// - Manual capture button
// - Image preprocessing (contrast, brightness, rotation)
// - Progress indicators during OCR
// - Error handling for permission/OCR failures
```

##### **3. ScannedDataPreview Component**

```typescript
interface ScannedDataPreviewProps {
  open: boolean;
  scannedData: ScannedIdData;
  onConfirm: (data: ScannedIdData) => void;
  onRetake: () => void;
  onCancel: () => void;
}

// Shows extracted data with confidence indicators
// Allows doctor to review before opening form
// Option to retake photo if OCR quality is poor
```

##### **4. Enhanced AddPatientDialog Component**

```typescript
// Existing component enhancements:
interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (patientId: number) => void;
  prefilledData?: Partial<CreatePatientFormData>; // NEW: Support pre-filled data
  dataSource?: 'manual' | 'scanned'; // NEW: Track data origin
}

// Add visual indicators for pre-filled fields
// Maintain all existing validation
// Allow editing of OCR-extracted data
// Show info badge when data is from scan
```

#### **Service Implementation**

##### **National ID API Service (nationalId.service.ts)**

```typescript
import { client } from './client';
import { mockScanNationalId } from './mockNationalIdData';

export interface ScanNationalIdRequest {
  image: string; // Base64 encoded image
}

export interface ScanNationalIdResponse {
  fullName: string; // Full name from ID card
  nationalId: string; // 14-digit National ID number
  address: string; // Address from ID card
}

// Feature flag to use mock data until backend AI endpoint is ready
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_SCAN === 'true';

export async function scanNationalId(
  imageBase64: string
): Promise<ScanNationalIdResponse> {
  // Use mock data until backend AI model endpoint is ready
  if (USE_MOCK_DATA) {
    console.log('🔧 Using mock National ID scan data (AI endpoint not ready)');
    return mockScanNationalId(imageBase64);
  }
  
  // TODO: Replace with actual endpoint when backend AI model is deployed
  // Expected endpoint: POST /api/v1/national-id/scan
  const response = await client.post<ScanNationalIdResponse>(
    '/api/v1/national-id/scan',
    { image: imageBase64 }
  );
  
  return response.data;
}
```

##### **Mock National ID Data (mockNationalIdData.ts)**

```typescript
import { ScanNationalIdResponse } from './nationalId.service';

/**
 * Mock OCR response for development until backend AI model is ready
 * Simulates realistic extraction with slight variations
 */
export function mockScanNationalId(imageBase64: string): Promise<ScanNationalIdResponse> {
  // Simulate network delay (500ms - 2s)
  const delay = 500 + Math.random() * 1500;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock data pool - randomly select one
      const mockResponses: ScanNationalIdResponse[] = [
        {
          fullName: 'أحمد محمد علي',
          nationalId: '29501011234567',
          address: '53 شارع التحرير، الدقي، الجيزة، مصر',
        },
        {
          fullName: 'فاطمة حسن إبراهيم',
          nationalId: '29612151234568',
          address: '12 شارع الهرم، الجيزة، مصر',
        },
        {
          fullName: 'محمود أحمد السيد',
          nationalId: '28803201234569',
          address: '25 شارع النيل، المعادي، القاهرة، مصر',
        },
        {
          fullName: 'سارة علي محمد',
          nationalId: '30105101234562',
          address: '8 شارع الجامعة، المنصورة، الدقهلية، مصر',
        },
      ];
      
      // Randomly select a mock response
      const randomIndex = Math.floor(Math.random() * mockResponses.length);
      const mockData = mockResponses[randomIndex];
      
      console.log('✅ Mock scan complete:', mockData);
      resolve(mockData);
    }, delay);
  });
}
```

##### **National ID Parser (nationalIdParser.ts)**

```typescript
/**
 * Egyptian National ID Format: XYYMMDDSSNNNNC
 * X = Century (2=1900s, 3=2000s)
 * YY = Year
 * MM = Month
 * DD = Day
 * SS = Governorate code
 * NNNN = Sequential number
 * C = Check digit
 * 
 * Gender: Odd NNNN = Male, Even = Female
 */

export function extractBirthdateFromNationalId(nationalId: string): Date | null {
  if (nationalId.length !== 14) return null;
  
  const century = nationalId[0] === '2' ? 1900 : 2000;
  const year = century + parseInt(nationalId.substring(1, 3));
  const month = parseInt(nationalId.substring(3, 5));
  const day = parseInt(nationalId.substring(5, 7));
  
  return new Date(year, month - 1, day);
}

export function extractGenderFromNationalId(nationalId: string): 'male' | 'female' | null {
  if (nationalId.length !== 14) return null;
  
  const sequentialNumber = parseInt(nationalId.substring(9, 13));
  return sequentialNumber % 2 === 0 ? 'female' : 'male';
}

export function extractGovernorateCode(nationalId: string): string | null {
  if (nationalId.length !== 14) return null;
  return nationalId.substring(7, 9);
}

export function validateNationalId(nationalId: string): boolean {
  // Validate format, date validity, check digit
  return /^\d{14}$/.test(nationalId) && 
         extractBirthdateFromNationalId(nationalId) !== null;
}
```

##### **Camera Hook (useCamera.ts)**

```typescript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export function useCamera() {
  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        width: 1920, // High resolution for OCR
        height: 1080,
      });
      
      return image.base64String;
    } catch (error) {
      if (error.message.includes('permission')) {
        throw new CameraPermissionError('Camera access denied');
      }
      throw error;
    }
  };
  
  const checkPermissions = async () => {
    const permissions = await Camera.checkPermissions();
    if (permissions.camera !== 'granted') {
      const request = await Camera.requestPermissions();
      return request.camera === 'granted';
    }
    return true;
  };
  
  return { takePicture, checkPermissions };
}
```

##### **Scan National ID Hook (useScanNationalId.ts)**

```typescript
import { useMutation } from '@tanstack/react-query';
import { scanNationalId, ScanNationalIdResponse } from '@/lib/api/nationalId.service';
import { extractGenderFromNationalId, extractBirthdateFromNationalId } from '@/lib/utils/nationalIdParser';

export interface EnrichedScanData extends ScanNationalIdResponse {
  gender: 'male' | 'female';
  birthdate: Date;
}

export function useScanNationalId() {
  return useMutation({
    mutationFn: async (imageBase64: string): Promise<EnrichedScanData> => {
      // Send image to backend (or mock)
      const scanResult = await scanNationalId(imageBase64);
      
      // Frontend enrichment: Extract gender and birthdate from National ID
      const gender = extractGenderFromNationalId(scanResult.nationalId);
      const birthdate = extractBirthdateFromNationalId(scanResult.nationalId);
      
      if (!gender || !birthdate) {
        throw new Error('Invalid National ID format');
      }
      
      return {
        ...scanResult,
        gender,
        birthdate,
      };
    },
    onError: (error) => {
      console.error('❌ National ID scan failed:', error);
    },
  });
}
```

---

### 5. Implementation Flow Integration

#### **Updated User Flow in Doctor Dashboard**

```typescript
// In DoctorPatientListPage or similar

const [showRegistrationSheet, setShowRegistrationSheet] = useState(false);
const [showScanner, setShowScanner] = useState(false);
const [showPreview, setShowPreview] = useState(false);
const [showAddDialog, setShowAddDialog] = useState(false);
const [scannedData, setScannedData] = useState<ScannedIdData | null>(null);
const [prefilledData, setPrefilledData] = useState<Partial<CreatePatientFormData> | null>(null);

const handleAddPatientClick = () => {
  setShowRegistrationSheet(true); // First: show selection sheet
};

const handleSelectScanId = async () => {
  setShowRegistrationSheet(false);
  const hasPermission = await checkCameraPermission();
  if (hasPermission) {
    setShowScanner(true); // Second: open camera
  } else {
    toast.error('Camera permission required');
  }
};

const handleSelectManualEntry = () => {
  setShowRegistrationSheet(false);
  setShowAddDialog(true); // Direct to form
};

const handleScanComplete = (data: ScannedIdData) => {
  setScannedData(data);
  setShowScanner(false);
  setShowPreview(true); // Third: show preview
};

const handleConfirmScannedData = (data: ScannedIdData) => {
  // Map scanned data to form structure
  setPrefilledData({
    firstName: data.fullNameArabic.split(' ')[0],
    lastName: data.fullNameArabic.split(' ').slice(1).join(' '),
    socialSecurityNumber: data.nationalId,
    address: data.address,
    language: Language.ARABIC, // Detected from scan
  });
  setShowPreview(false);
  setShowAddDialog(true); // Fourth: open form with data
};

const handleRetake = () => {
  setShowPreview(false);
  setShowScanner(true); // Back to camera
};

return (
  <>
    <Button onClick={handleAddPatientClick}>
      <Plus className="mr-2" /> Add New Patient
    </Button>
    
    <PatientRegistrationSheet
      open={showRegistrationSheet}
      onOpenChange={setShowRegistrationSheet}
      onSelectScanId={handleSelectScanId}
      onSelectManualEntry={handleSelectManualEntry}
    />
    
    <NationalIdScanner
      open={showScanner}
      onClose={() => setShowScanner(false)}
      onScanComplete={handleScanComplete}
      onError={(error) => toast.error(error.message)}
    />
    
    <ScannedDataPreview
      open={showPreview}
      scannedData={scannedData!}
      onConfirm={handleConfirmScannedData}
      onRetake={handleRetake}
      onCancel={() => setShowPreview(false)}
    />
    
    <AddPatientDialog
      open={showAddDialog}
      onOpenChange={setShowAddDialog}
      prefilledData={prefilledData || undefined}
      dataSource={prefilledData ? 'scanned' : 'manual'}
      onSuccess={handlePatientCreated}
    />
  </>
);
```

---

### 6. Error Handling & Edge Cases

#### **Camera Permissions**

```typescript
// User denies camera permission
if (!hasPermission) {
  showNativeAlert({
    title: 'Camera Access Required',
    message: 'To scan National ID cards, please enable camera access in Settings.',
    buttons: [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => openAppSettings() }
    ]
  });
}
```

#### **OCR Failures**

```typescript
// Low confidence OCR result (< 60%)
if (ocrResult.confidence < 0.6) {
  showWarningToast(
    'ID scan quality is low',
    'Please retake the photo in better lighting or enter data manually'
  );
  return; // Don't proceed to preview
}

// No National ID number detected
if (!ocrResult.nationalId) {
  showErrorToast(
    'Could not detect National ID',
    'Please ensure the ID card is clearly visible and try again'
  );
}
```

#### **Invalid ID Format**

```typescript
// Extracted ID fails validation
if (!validateNationalId(scannedData.nationalId)) {
  showWarningDialog({
    title: 'Invalid National ID Format',
    message: 'The scanned ID number appears incorrect. You can edit it manually in the next step.',
    action: 'Continue',
  });
  // Still allow proceeding with manual correction
}
```

#### **Offline Support**

```typescript
// No internet during scan
// - Camera works offline (image capture)
// - OCR requires backend connection (AI model)
// - If offline: Save captured image and queue for processing
// - Show indicator: "Will process when online"
// - Auto-retry when connection restored

if (!navigator.onLine) {
  toast.info(
    'Offline Mode',
    'Image will be processed when internet connection is restored'
  );
  await Storage.set({ key: 'pending_scan_image', value: imageBase64 });
}
```

---

### 7. Performance Optimization

#### **Image Processing & API Performance**

```typescript
// Compress image before sending to backend (reduce payload size)
const compressedImage = await compressImage(originalImage, {
  maxWidth: 1920, // Keep high resolution for AI model accuracy
  maxHeight: 1080,
  quality: 0.90, // Balance quality vs size
});

// Use React Query for automatic retry and caching
const { mutate: scanId, isPending } = useScanNationalId({
  retry: 2, // Retry failed requests
  retryDelay: 1000,
});

// Optimistic UI: Show preview with loading state
// Backend processing time: ~2-5 seconds for AI model
```

#### **Bundle Size Optimization**

```typescript
// No heavy OCR libraries needed (processing on backend)
// Lazy load scanner components for better initial load
const NationalIdScanner = dynamic(
  () => import('@/components/doctor/NationalIdScanner'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

// Separate Capacitor plugins into mobile-only chunks
if (Platform.is('capacitor')) {
  await import('@/lib/hooks/useCamera');
}
```

#### **Caching Strategy**

```typescript
// Cache scan results with React Query (5 minutes)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Cache recently scanned data temporarily (with user consent)
// For quick re-registration if initial submission fails
import { Storage } from '@capacitor/storage';
await Storage.set({
  key: 'pending_scan_data',
  value: JSON.stringify(scanResult),
});
```

---

### 8. Testing Requirements

#### **Unit Tests**

```typescript
// nationalIdParser.test.ts
describe('National ID Parser', () => {
  it('should extract correct birthdate from valid ID', () => {
    const id = '29501011234567';
    const birthdate = extractBirthdateFromNationalId(id);
    expect(birthdate).toEqual(new Date(1995, 0, 1));
  });
  
  it('should determine gender correctly', () => {
    expect(extractGenderFromNationalId('29501011234561')).toBe('male'); // odd
    expect(extractGenderFromNationalId('29501011234562')).toBe('female'); // even
  });
});

// nationalId.service.test.ts
describe('National ID API Service', () => {
  it('should send image to backend and receive extracted data', async () => {
    const mockImage = 'base64ImageString...';
    const result = await scanNationalId(mockImage);
    expect(result.nationalId).toMatch(/^\d{14}$/);
    expect(result.fullName).toBeTruthy();
    expect(result.address).toBeTruthy();
  });
  
  it('should use mock data when flag is enabled', async () => {
    process.env.NEXT_PUBLIC_USE_MOCK_SCAN = 'true';
    const mockImage = 'base64ImageString...';
    const result = await scanNationalId(mockImage);
    expect(result).toHaveProperty('fullName');
    expect(result).toHaveProperty('nationalId');
    expect(result).toHaveProperty('address');
  });
});
```

#### **Integration Tests**

```typescript
// Test full scan-to-form flow
describe('Add Patient with ID Scan', () => {
  it('should pre-fill form with scanned data', async () => {
    const { getByText, getByLabelText } = render(<DoctorDashboard />);
    
    // Click add patient
    fireEvent.click(getByText('Add New Patient'));
    
    // Select scan option
    fireEvent.click(getByText('Scan National ID'));
    
    // Mock camera capture
    await mockCameraCapture('sample-id.jpg');
    
    // Verify form is pre-filled
    expect(getByLabelText('National ID')).toHaveValue('29501011234567');
    expect(getByLabelText('First Name')).toHaveValue('أحمد');
  });
});
```

#### **E2E Tests (Capacitor)**

```typescript
// Use Appium or Detox for native testing
describe('Camera Permission Flow', () => {
  it('should request camera permission on first scan', async () => {
    await device.launchApp({ permissions: { camera: 'unset' } });
    
    await element(by.text('Add New Patient')).tap();
    await element(by.text('Scan National ID')).tap();
    
    // Expect native permission dialog
    await expect(element(by.text('Allow Camera Access'))).toBeVisible();
    
    await element(by.text('Allow')).tap();
    
    // Camera should open
    await expect(element(by.id('camera-viewfinder'))).toBeVisible();
  });
});
```

#### **Manual Testing Checklist**

- [ ] Camera opens correctly on iOS and Android
- [ ] ID overlay guide is visible and properly positioned
- [ ] Captured image has sufficient quality for OCR
- [ ] Arabic text is extracted correctly (RTL handling)
- [ ] Gender and birthdate auto-populate correctly
- [ ] Form validation works with pre-filled data
- [ ] Manual editing of scanned data is possible
- [ ] Retake photo functionality works
- [ ] Manual entry fallback works when OCR fails
- [ ] Permission denial is handled gracefully
- [ ] Offline mode: OCR works without internet
- [ ] Loading states are clear during processing
- [ ] Error messages are helpful and actionable
- [ ] Success flow: patient is created with correct data
- [ ] UI is responsive on various screen sizes (5" to 7" phones)
- [ ] Touch targets are adequately sized (44pt+)
- [ ] Haptic feedback occurs on successful scan
- [ ] Accessibility: VoiceOver/TalkBack compatibility

---

### 9. Localization (Bilingual Support)

#### **Translation Keys (messages/en.json & ar.json)**

```json
{
  "doctor": {
    "addPatient": {
      "title": "Add New Patient",
      "selectMethod": "Choose Registration Method",
      "scanId": "Scan National ID",
      "scanIdDescription": "Faster & More Accurate",
      "manualEntry": "Enter Manually",
      "manualEntryDescription": "Fill form yourself",
      
      "scanner": {
        "title": "Scan National ID",
        "instruction": "Align the front of the ID card within the frame",
        "captureButton": "Capture",
        "retakeButton": "Retake Photo",
        "processing": "Processing ID card...",
        "help": "Tips for better scanning",
      },
      
      "preview": {
        "title": "Review Scanned Data",
        "extractedInfo": "Extracted Information",
        "useData": "Use This Data",
        "retake": "Retake Photo",
        "lowConfidence": "Scan quality is low. You can retake or edit manually.",
      },
      
      "form": {
        "autoFilled": "Auto-filled from ID scan",
        "canEdit": "You can edit any field below",
      },
      
      "errors": {
        "cameraPermission": "Camera access is required to scan ID cards",
        "cameraPermissionAction": "Open Settings",
        "ocrFailed": "Could not read ID card. Please try again or enter manually.",
        "invalidIdFormat": "The scanned National ID appears invalid",
        "lowQuality": "Image quality is too low. Please retake in better lighting.",
      },
      
      "success": {
        "scanComplete": "ID card scanned successfully",
        "patientCreated": "Patient registered successfully",
      }
    }
  }
}
```

#### **RTL Support**

```typescript
// Ensure camera overlay and buttons adapt to RTL
<div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
  <KonstaButton>{t('scanner.captureButton')}</KonstaButton>
</div>

// Arabic text extraction in OCR
const ocrLanguage = locale === 'ar' ? 'ara+eng' : 'eng';
```

---

### 10. Security & Privacy Considerations

#### **Data Protection**

```typescript
// 1. Captured images should NOT be stored permanently
// Delete image after successful OCR or form cancellation
await Camera.cleanupTemporaryFiles();

// 2. Sensitive data in memory only (no logs)
// Never log National ID or patient details
console.log('OCR complete'); // ✅ Safe
// console.log('Extracted ID:', nationalId); // ❌ Forbidden

// 3. HTTPS only for API calls (already enforced)
// Capacitor config: androidScheme: 'https'

// 4. Secure storage for any cached data
import { Storage } from '@capacitor/storage';
await Storage.set({
  key: 'pending_patient_data',
  value: JSON.stringify(encryptedData), // Encrypt before storing
});
```

#### **HIPAA Compliance**

- No patient images stored on device
- OCR processing happens locally (offline-first = more secure)
- All API communication encrypted (TLS 1.3)
- Audit logs for patient creation (backend responsibility)
- User authentication required before accessing camera feature

---

### 11. Rollout & Feature Flags

#### **Progressive Rollout**

```typescript
// Feature flag to enable/disable ID scanning
const FEATURE_FLAGS = {
  NATIONAL_ID_SCAN: process.env.NEXT_PUBLIC_ENABLE_ID_SCAN === 'true',
};

// Conditional rendering
{FEATURE_FLAGS.NATIONAL_ID_SCAN ? (
  <PatientRegistrationSheet {...props} />
) : (
  <AddPatientDialog {...props} /> // Old behavior
)}
```

#### **Analytics Tracking**

```typescript
// Track feature adoption
analytics.track('patient_registration_method', {
  method: 'scan' | 'manual',
  success: boolean,
  ocrConfidence: number,
  timeTaken: number,
});

// Monitor OCR accuracy
analytics.track('ocr_result', {
  confidence: 0.85,
  fieldsExtracted: ['name', 'id', 'address'],
  errors: ['address_parsing_failed'],
});
```

---

### 12. Documentation & Training

#### **Doctor User Guide**

Create quick-start guide (PDF/Video):
1. "How to scan a National ID in 3 steps"
2. "Troubleshooting: What if the scan fails?"
3. "Understanding auto-filled data"

#### **Technical Documentation**

Update existing docs:
- `docs/PHASE_4_DOCTOR_IMPLEMENTATION.md` → Add "ID Scanning Feature"
- `docs/integration/TESTING_GUIDE.md` → Add OCR testing scenarios
- `README.md` → Update features list

---

## 🎯 Success Criteria

**The feature is considered successful if:**

1. ✅ **Adoption Rate:** >60% of doctors use ID scanning (vs manual entry)
2. ✅ **Accuracy:** OCR correctly extracts National ID number >90% of the time
3. ✅ **Speed:** Scan-to-form flow completed in <30 seconds
4. ✅ **Errors:** <5% of patients created with invalid National ID format
5. ✅ **Usability:** Zero "how to use" support requests after first week
6. ✅ **Performance:** Camera opens in <2 seconds, OCR completes in <5 seconds
7. ✅ **Accessibility:** Passes iOS VoiceOver and Android TalkBack testing
8. ✅ **Responsiveness:** Works on devices from iPhone SE (2022) to iPad Mini

---

## 📦 Deliverables

1. **Code:**
   - [ ] `PatientRegistrationSheet` component (Konsta UI bottom sheet)
   - [ ] `NationalIdScanner` component (Capacitor Camera + overlay)
   - [ ] `ScannedDataPreview` component (review before form)
   - [ ] Enhanced `AddPatientDialog` (support pre-filled data)
   - [ ] `nationalId.service` (API integration for backend AI)
   - [ ] `mockNationalIdData` (mock responses until API ready)
   - [ ] `nationalIdParser` utility (parse Egyptian ID format)
   - [ ] `useCamera` hook (Capacitor camera wrapper)
   - [ ] `useScanNationalId` hook (React Query mutation)
   - [ ] `useNationalIdScanner` hook (orchestrate flow)

2. **Tests:**
   - [ ] Unit tests for ID parser functions (>90% coverage)
   - [ ] Integration tests for scan-to-form flow
   - [ ] E2E tests for camera permissions (iOS + Android)

3. **Documentation:**
   - [ ] Update `PHASE_4_DOCTOR_IMPLEMENTATION.md`
   - [ ] Create `ID_SCANNING_USER_GUIDE.md`
   - [ ] Update API integration docs (if backend changes needed)

4. **Design Assets:**
   - [ ] Camera overlay SVG (ID card frame guide)
   - [ ] Success/error icons for preview screen
   - [ ] Loading animations (OCR processing)

---

## 🚀 Implementation Checklist (For Developer)

### Phase 1: Foundation (Day 1-2)
- [ ] Install dependencies (`@capacitor/camera`)
- [ ] Create file structure (components, services, hooks)
- [ ] Implement `nationalIdParser` utility with tests
- [ ] Create mock data service (`mockNationalIdData.ts`)
- [ ] Set up environment variable `NEXT_PUBLIC_USE_MOCK_SCAN=true`
- [ ] Set up Capacitor camera permissions in iOS/Android configs

### Phase 2: Core Components (Day 3-5)
- [ ] Build `PatientRegistrationSheet` component (Konsta UI)
- [ ] Build `NationalIdScanner` component (camera + overlay)
- [ ] Implement `nationalId.service` with mock data integration
- [ ] Create `useScanNationalId` React Query hook
- [ ] Create `useCamera` hook (permission handling)
- [ ] Add image compression utility

### Phase 3: Preview & Form Integration (Day 6-7)
- [ ] Build `ScannedDataPreview` component
- [ ] Enhance `AddPatientDialog` to accept `prefilledData` prop
- [ ] Add visual indicators for auto-filled fields
- [ ] Implement field-level edit capability

### Phase 4: Error Handling & UX (Day 8-9)
- [ ] Add permission denial handling
- [ ] Implement OCR failure fallbacks
- [ ] Add loading states and progress indicators
- [ ] Implement haptic feedback (success/error)
- [ ] Add tooltips and help text

### Phase 5: Testing & Polish (Day 10-12)
- [ ] Write unit tests (parser, OCR service)
- [ ] Write integration tests (full flow)
- [ ] Manual testing on iOS and Android devices
- [ ] Accessibility audit (VoiceOver/TalkBack)
- [ ] Performance optimization (bundle size, OCR speed)

### Phase 6: Localization & Documentation (Day 13-14)
- [ ] Add all translation keys (EN/AR)
- [ ] Test RTL layout for Arabic
- [ ] Update technical documentation
- [ ] Create user guide with screenshots
- [ ] Record demo video for training

### Phase 7: Deployment & Monitoring (Day 15)
- [ ] Deploy behind feature flag
- [ ] Set up analytics tracking
- [ ] Monitor error rates and performance metrics
- [ ] Gather initial user feedback
- [ ] Iterate based on feedback

---

## 🛠 Technical Constraints & Assumptions

**Assumptions:**
1. Egyptian National ID format remains 14 digits (no format changes)
2. ID cards have consistent layout (government-issued standard)
3. Devices have rear camera with minimum 5MP resolution
4. Doctors have stable internet for patient creation API call
5. Backend accepts existing `CreatePatientFormData` schema (no changes needed)

**Known Limitations:**
1. OCR accuracy depends on lighting conditions (may require retakes)
2. Backend AI model requires internet connection (not fully offline)
3. Processing time depends on backend server load (typically 2-5 seconds)
4. Camera API not available in web browser (Capacitor only)
5. Mock data used until backend AI endpoint is deployed

**Mitigation Strategies:**
- Provide clear instructions for optimal photo capture
- Always allow manual editing of scanned data
- Implement manual entry as first-class fallback
- Show confidence scores and warnings for low-quality scans
- Cache OCR models for faster subsequent scans

---
