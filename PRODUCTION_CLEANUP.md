# Production Readiness Cleanup

**Branch**: `chore/production-cleanup` → PR into `production`
**Date**: 2026-05-31
**Owner**: Frontend team

## Goal

Prepare the codebase for the production branch by removing development-only
artifacts (mock-data overrides, dev-only routes, source-mappable bundles,
verbose logging) without weakening real error handling.

## Audit baseline

A read-only audit of the source tree (excluding `node_modules`, `.next`,
`dist`, `build`) found:

| Category                          | Count | Notes                                                |
| --------------------------------- | ----- | ---------------------------------------------------- |
| Executable `console.*` calls      | 0     | All matches were in JSDoc `@example` blocks.         |
| `debugger;` statements            | 0     | —                                                    |
| `@ts-ignore` / `@ts-expect-error` | 0     | Clean.                                               |
| File-level `eslint-disable`       | 0     | Clean.                                               |
| Hardcoded mock-data flags         | 1     | `lib/api/queries/useMedicalHistory.ts`.              |
| Dev-only public routes            | 1     | `app/[locale]/api-test/` (unprotected, hardcoded creds). |
| Empty `catch` blocks              | 1     | `lib/api/nationalId.service.ts`.                     |
| Open TODOs                        | 4     | Logout endpoint, legacy hook, forgot-password.       |
| Stray root `.md` notes            | 2     | `16-2-2026.md`, `ENDPOINTS_INTEGRATION_SUMMARY.md`.  |

The actionable surface is therefore narrow and focused, not a sweeping
log-stripping exercise.

## Changes applied

### 1. Mock-data flag is now env-driven

- `lib/api/queries/useMedicalHistory.ts`
  - **Before**: `const USE_MOCK_DATA = true;` (hardcoded; overrode env config and
    served fake labs / scans / medications in production).
  - **After**: `const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';`
- `lib/api/queries/useAuth.ts`
  - Removed dead `useLoginOld` legacy hook (zero importers).
  - Replaced hardcoded `USE_MOCK_DATA = false` with the same env-driven flag.

Mock-data files (`lib/api/mockData.ts`, `lib/api/mockNationalIdData.ts`) are
left on disk; tree-shaking will drop them from the production bundle when
`NEXT_PUBLIC_USE_MOCK_DATA !== 'true'`.

### 2. Dev-only `/api-test` route removed

- Deleted `app/[locale]/api-test/page.tsx` (full directory).
- Removed nav link in `components/landing/Navbar.tsx`.
- Removed shortcut button + unused imports in `app/[locale]/register/page.tsx`.
- Removed `nav.apiTest` keys from `messages/en.json` and `messages/ar.json`.

The page contained hardcoded test credentials and sample SSNs, so deletion is
preferred over gating (gating still ships the source through history and the
bundle).

### 3. Build hardening — `next.config.ts`

- Added `compiler.removeConsole: { exclude: ['error', 'warn'] }` for
  production builds. Defense-in-depth so any future stray log is stripped from
  prod bundles while genuine errors and warnings remain.
- Added `productionBrowserSourceMaps: false` — HIPAA / IP protection. No
  source maps will be served to browsers in production.
- `reactStrictMode`, image patterns, and security headers are unchanged.

### 4. Code quality

- `lib/api/nationalId.service.ts` — empty catch now explicitly resets
  `gender` / `birthdate` to `null` (so the existing default-fallback flow runs)
  and documents why the swallow is safe (UI re-prompts for confirmation).
- Stale legacy TODOs in `lib/api/queries/useAuth.ts` removed.
- Backend-blocked TODOs left in place where they accurately describe
  upstream work (logout endpoint in `lib/api/auth.service.ts`,
  forgot-password in `components/auth/LoginForm.tsx`).

### 5. Documentation tidy

- `16-2-2026.md` → `docs/archive/16-2-2026.md`
- `ENDPOINTS_INTEGRATION_SUMMARY.md` → `docs/integration/ENDPOINTS_INTEGRATION_SUMMARY.md`
- This file added at `docs/PRODUCTION_CLEANUP.md`.

## Production environment checklist

The deployment environment **must** set:

```
NODE_ENV=production
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_USE_MOCK_SCAN=false
NEXT_PUBLIC_ENABLE_DEV_TOOLS=false
NEXT_PUBLIC_API_BASE_URL=/api/proxy
BACKEND_API_URL=<production backend URL>
```

`.env.local` is for development and is gitignored. Confirm the host
(Vercel / etc.) has the production values set in its dashboard before promoting
the build.

## Audit commands (rerun any time)

```powershell
# Executable console statements (excluding doc comments).
rg "console\.(log|debug|info|warn|error|trace|table|dir)" `
   --glob "!**/node_modules/**" --glob "!**/.next/**" `
   --glob "{app,components,lib,hooks,src,stores,types,middleware.ts,next.config.ts,i18n.ts}/**"

# Debugger / TS suppressions / TODOs.
rg "debugger;|@ts-ignore|@ts-expect-error|TODO|FIXME|HACK|XXX" `
   --glob "!**/node_modules/**" --glob "!**/.next/**"

# Stale dev-only references.
rg "api-test|TestPassword123|USE_MOCK_DATA\s*=\s*true" `
   --glob "!**/node_modules/**" --glob "!**/.next/**"

# Verify production bundle does not leak the dev route.
rg "api-test|TestPassword123" .next/
```

## Verification

Before pushing the PR:

1. `pnpm install`
2. `pnpm lint`
3. `pnpm type-check`
4. `pnpm build`
5. Smoke test (production build):
   - Login → doctor flow (patient search, visit, labs, scans, medications).
   - Admin flow (clinics, doctors, patients, visits dialogs).
   - Super-admin flow.
   - Locale switch (en ↔ ar, RTL).
   - Offline / service-worker behavior.
   - `/api-test` returns 404.
   - ReactQueryDevtools panel is absent.

## Git workflow

```powershell
git checkout -b chore/production-cleanup
git add -A
git commit -m "chore: production cleanup - mock flags, dev routes, build hardening"
git push -u origin chore/production-cleanup
```

Open a PR into `production`. **Do not push directly to `production`. Do not
force-push.** Require CI green and one review before merge.

## Rollback

Cleanup commits are intentionally non-functional (no behavior change for the
real-data path). If issues surface post-merge, revert the merge commit as a
unit:

```powershell
git revert -m 1 <merge-commit-sha>
```
