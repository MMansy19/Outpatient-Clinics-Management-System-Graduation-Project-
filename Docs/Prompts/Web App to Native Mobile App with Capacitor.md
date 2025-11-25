### 📋 Main Project Instructions

**1. Project Objective**  
* **Goal:** Convert the existing Next.js web app into a downloadable native mobile app for iOS and Android using Capacitor, enhancing it for the CodeBlue Outpatient Clinic Management System at Kasr Al Ainy Hospital.  
* **Primary Users:** Doctors (focus on clinical workflows) and Admins.  
* **Deadline:** Post-MVP integration, targeting deployment by December 2025.

**2. Core Modules to Build (Mobile Enhancements)**  
* **Admin Module:** Retain clinic/doctor/patient management with native offline caching.  
* **Doctor Module (The "Smart Companion"):**  
    * **Registration:** Native secure storage for JWT.  
    * **Patient Management:** Search/filter/add with camera OCR for National ID.  
    * **Clinical Workflow:** Voice-to-text for case details; camera for scans/labs.  
    * **History Tracking:** Offline viewing of cached data.

**3. Frontend Instructions (Next.js + Capacitor)**  
* **Framework:** Next.js 15+ with App Router, static export for Capacitor compatibility.  
* **Language:** Strict TypeScript.  
* **UI Library:** Shadcn UI + Tailwind CSS, enhanced with Konsta UI v5+ for native mobile feel.  
* **Localization:** Bilingual (English/Arabic) with dynamic RTL support via Konsta themes and Zustand.  
* **State Management:** Zustand for global state (auth, locale, theme); React Query for API caching, integrated with Capacitor Storage for offline.

**4. Backend Instructions (.NET Core)**  
* **Framework:** C# .NET Core (unchanged; mobile app consumes existing APIs).  
* **Database:** PostgreSQL.  
* **Schema:** Follow ERD (`CodeBlue_ERD.pdf`) for data models.  
* **Auth:** JWT with RBAC, stored securely in Capacitor Storage.

---

### ⚠️ Development Rules (The "Non-Negotiables")

**1. Data & Security Rules**  
* **HIPAA/Privacy Compliance:** Use Capacitor Secure Storage for JWT and sensitive data; no patient data in unsecured local storage. APIs remain [Authorize]-guarded.  
* **Data Integrity:** Sync offline changes upon reconnect; validate foreign keys client-side where possible.  
* **Encryption:** Hash passwords backend-side; encrypt local caches if storing notes.

**2. UI/UX Rules**  
* **Medical Theme:** Emerald/Teal primary, Navy Blue secondary, Red errors—adapt to Konsta iOS/Android modes.  
* **Accessibility:** Keyboard navigation, voice-over support; labels on all inputs.  
* **Offline-First Mindset:** Cache patient lists/history with React Query + Capacitor Storage for low-connectivity clinics.

**3. Workflow Rules**  
* **Validation:** Zod on forms; double-check OCR/voice inputs.  
* **AI Disclaimers:** Display for differential diagnosis in native alerts/toasts.  
* **No Hard Deletes:** Reflect `is_deleted` in UI; offline soft deletes sync later.

**4. Code Quality Rules**  
* **No `any` Type:** Define interfaces for native plugin responses (e.g., `SpeechRecognitionResult`).  
* **Component Modularity:** Wrap Shadcn in Konsta (e.g., `KonstaPage` around `PatientForm`).  
* **Commit Message Style:** Conventional commits (e.g., `feat(mobile): add voice-to-text integration`).

---

# Guide to Converting Next.js Web App to Native Mobile App with Capacitor

As a Senior Solution Architect and Mobile Developer with 15+ years in HealthTech, this guide transforms your existing Next.js 15+ PWA into native iOS/Android apps using Capacitor (v6+ as of 2025). Based on Capgo tutorials, Capacitor docs, and best practices from sources like NextNative and Ionic forums, it ensures compatibility with Next.js features like enhanced SSR and Turbopack. The focus is on retaining MVP features while adding native enhancements for voice-to-text, OCR, offline, and bilingual RTL support. All steps assume your Next.js app is in a root folder (e.g., `codeblue-frontend`).

## 1. Prerequisites

- **Node.js:** v20+ (LTS as of 2025).
- **npm/yarn/pnpm:** Latest (use pnpm for faster installs).
- **Xcode:** v17+ for iOS (macOS required; includes iOS Simulator).
- **Android Studio:** v2024.1+ (Hedgehog or later) for Android emulation/builds.
- **Java JDK:** v17+ for Android.
- **CocoaPods:** For iOS dependencies (`sudo gem install cocoapods`).
- **Git:** For version control.
- **Apple Developer Account:** For App Store submission (enroll in Apple Developer Program).
- **Google Play Console Account:** For Android deployment.
- **Existing Next.js App:** Fully built PWA with service workers and React Query offline caching.
- **Icons/Splash Screens:** Prepare 1024x1024 app icon and splash images (use tools like AppIcon.co).

Install global tools:
```bash
npm install -g @capacitor/cli
```

## 2. Installation & Setup

Navigate to your Next.js project root.

1. **Install Capacitor Core:**
   ```bash
   npm install @capacitor/core @capacitor/cli
   ```

2. **Init Capacitor:**
   ```bash
   npx cap init
   ```
   - App Name: CodeBlue
   - App ID: com.kasralainy.codeblue (unique bundle ID).

3. **Add Platforms:**
   ```bash
   npx cap add ios
   npx cap add android
   ```

4. **Install Konsta UI v5+:**
   ```bash
   npm install konsta
   ```
   (Konsta v5+ supports Tailwind v4+ and adaptive iOS/Android themes.)

5. **Install Native Plugins:**
   - Camera (for OCR): `npm install @capacitor/camera`
   - Storage (offline): `npm install @capacitor/storage`
   - Push Notifications: `npm install @capacitor/push-notifications`
   - Speech Recognition (community): `npm install @capacitor-community/speech-recognition`
   - Tesseract.js (OCR): `npm install tesseract.js`

6. **Sync Plugins:**
   ```bash
   npx cap sync
   ```

## 3. Configuration Changes

1. **Next.js Config for Static Export:**
   Update `next.config.js` for static generation (Capacitor requires static HTML/JS):
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export', // Static export mode
     images: { unoptimized: true }, // Disable Image optimization for Capacitor
     basePath: '', // Adjust if needed
     trailingSlash: true, // For Capacitor routing
     experimental: { turbopack: true }, // 2025 optimization
   };

   module.exports = nextConfig;
   ```
   Note: Dynamic routes (SSR) must be converted to SSG/ISR; use `generateStaticParams` for patient pages.

2. **Capacitor Config:**
   Edit `capacitor.config.ts`:
   ```typescript
   import { CapacitorConfig } from '@capacitor/cli';

   const config: CapacitorConfig = {
     appId: 'com.kasralainy.codeblue',
     appName: 'CodeBlue',
     webDir: 'out', // Next.js static export dir
     server: { androidScheme: 'https' },
     plugins: {
       SplashScreen: { launchShowDuration: 3000 },
       PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
     },
   };

   export default config;
   ```

3. **App Manifests:**
   - Add `public/manifest.json` for PWA fallback.
   - Prepare `ios/App/App/Assets.xcassets` and `android/app/src/main/res` with icons/splashes (use `npx cap copy` after adding).

4. **Permissions:**
   - iOS: Edit `ios/App/App/Info.plist` for camera/microphone (NSCameraUsageDescription, NSMicrophoneUsageDescription).
   - Android: Add to `android/app/src/main/AndroidManifest.xml`:
     ```xml
     <uses-permission android:name="android.permission.CAMERA" />
     <uses-permission android:name="android.permission.RECORD_AUDIO" />
     ```

## 4. Integrate Native Plugins

Wrap plugins in hooks for TypeScript safety.

1. **Voice-to-Text (Speech Recognition):**
   Hook example (`lib/hooks/useVoiceToText.ts`):
   ```typescript
   import { useState } from 'react';
   import { SpeechRecognition } from '@capacitor-community/speech-recognition';

   export const useVoiceToText = () => {
     const [text, setText] = useState('');

     const startDictation = async () => {
       await SpeechRecognition.requestPermissions();
       await SpeechRecognition.start({ language: 'en-US' }); // Or 'ar-EG' for Arabic
       SpeechRecognition.addListener('partialResults', (data) => setText(data.matches[0]));
     };

     const stopDictation = async () => {
       await SpeechRecognition.stop();
     };

     return { text, startDictation, stopDictation };
   };
   ```
   Use in `ClinicalForm.tsx` for case details.

2. **OCR (Camera + Tesseract):**
   Hook (`lib/hooks/useOCR.ts`):
   ```typescript
   import { Camera, CameraResultType } from '@capacitor/camera';
   import { createWorker } from 'tesseract.js';

   export const useOCR = () => {
     const scanDocument = async () => {
       const image = await Camera.getPhoto({ resultType: CameraResultType.Uri });
       const worker = await createWorker('eng'); // Add 'ara' for Arabic
       const { data: { text } } = await worker.recognize(image.webPath!);
       await worker.terminate();
       return text; // e.g., extract National ID
     };

     return { scanDocument };
   };
   ```
   Integrate for patient add (National ID scanning).

3. **Offline Storage:**
   Use with React Query:
   ```typescript
   import { Storage } from '@capacitor/storage';

   // Persist query cache
   const persistCache = async (key: string, value: any) => {
     await Storage.set({ key, value: JSON.stringify(value) });
   };
   ```
   Stub in Query persister for patient lists.

4. **Push Notifications:**
   Setup in `App.tsx`:
   ```typescript
   import { PushNotifications } from '@capacitor/push-notifications';

   useEffect(() => {
     PushNotifications.requestPermissions();
     PushNotifications.register();
     // Add listeners for tokens/received
   }, []);
   ```
   Stub for future alerts (e.g., patient updates).

## 5. UI Adaptation with Konsta

1. **Setup Konsta:**
   In `tailwind.config.js`, add Konsta plugin:
   ```javascript
   const konsta = require('konsta/config');

   module.exports = konsta({
     content: ['./app/**/*.{js,ts,jsx,tsx}'],
     theme: { extend: { colors: { primary: '#10B981' /* Emerald */ } } },
   });
   ```

2. **Wrap Layout:**
   In `app/layout.tsx`:
   ```tsx
   import { App as KonstaApp } from 'konsta/react';
   import { useZustandStore } from '@/stores'; // Locale from Zustand

   export default function RootLayout({ children }) {
     const { locale } = useZustandStore();
     const dir = locale === 'ar' ? 'rtl' : 'ltr';
     const theme = 'ios'; // Or 'material' for Android; detect via Capacitor Platform

     return (
       <html lang={locale} dir={dir}>
         <body>
           <KonstaApp theme={theme} rtl={dir === 'rtl'}>
             {children}
           </KonstaApp>
         </body>
       </html>
     );
   }
   ```

3. **Adapt Components:**
   Wrap Shadcn: e.g., in `PatientSearch.tsx`:
   ```tsx
   import { Page, Navbar, Searchbar } from 'konsta/react';

   <Page>
     <Navbar title="Patients" />
     <Searchbar /* Shadcn input wrapped */ />
   </Page>
   ```
   Dynamic RTL: Use Zustand to toggle locale, triggering re-render.

## 6. Build & Sync Process

1. **Build Next.js Static:**
   ```bash
   npm run build  # Outputs to 'out/'
   ```

2. **Sync to Native:**
   ```bash
   npx cap sync
   ```

3. **Run on Emulators/Devices:**
   - iOS: `npx cap open ios` (opens Xcode; build/run).
   - Android: `npx cap open android` (opens Android Studio; build/run).

## 7. Live Reload & Development Workflow

1. **Enable Live Reload:**
   In `capacitor.config.ts`: `server: { url: 'http://192.168.x.x:3000' }` (your dev server IP).
   ```bash
   npm run dev  # Next.js server
   npx cap run ios --livereload --external
   npx cap run android --livereload --external
   ```

2. **Emulation:**
   - iOS Simulator via Xcode.
   - Android Emulator via Android Studio.
   - Test offline: Toggle network in emulators; verify cached data.

3. **Iteration:** Changes in Next.js auto-reload on device via WebSocket.

## 8. Deployment to Stores

1. **Prepare Builds:**
   - iOS: In Xcode, archive build; submit via App Store Connect. Include privacy manifest for camera/microphone.
   - Android: In Android Studio, generate signed APK/AAB; upload to Google Play Console.

2. **HealthTech Tips:**
   - Compliance: Add data safety section (no sharing patient data); get HIPAA audit if expanding.
   - OTA Updates: Use Capgo for post-submission updates (bypass store reviews for bug fixes).
   - Testing: Beta tracks in Play Console; TestFlight for iOS.

Follow Google/Apple checklists; expect 1-7 days review.

## 9. Best Practices & Troubleshooting

- **Bundle Optimization:** Use Turbopack; split chunks; minify with Terser. Target <50MB APK.
- **Low-Connectivity:** React Query staleTime=Infinity for caches; sync mutations on reconnect.
- **Accessibility/Offline:** ARIA in Konsta; test voice-over; use IndexedDB fallback if Storage limits hit.
- **Troubleshooting:**
  - Image Issues: Set `images.unoptimized=true`; use Capacitor Filesystem for uploads.
  - RTL Bugs: Test layout flips; fix with Konsta's rtl prop.
  - Plugin Errors: Check permissions; fallback to Web APIs (e.g., Web Speech for voice).
  - Performance: Profile with Chrome DevTools on device; avoid heavy Tesseract on low-end phones.

## 10. Code Snippets

- **next.config.js:** (As in section 3)
- **capacitor.config.ts:** (As in section 3)
- **layout.tsx:** (As in section 5)
- **useVoiceToText.ts:** (As in section 4)
- **useOCR.ts:** (As in section 4)

This guide ensures a secure, performant native app retaining web MVP features with enhanced clinical tools. Test thoroughly for Kasr Al Ainy's environment.