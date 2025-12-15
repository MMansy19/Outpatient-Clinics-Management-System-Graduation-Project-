# 🧪 Testing Guide - Backend Integration

## ⚡ Quick Start

### 1. Environment Setup
Ensure `.env.local` is configured:
```env
NEXT_PUBLIC_API_BASE_URL=https://api-gateway.yellowgrass-a3ce385a.westeurope.azurecontainerapps.io/api/v1
NODE_ENV=development
```

### 2. Start Development Server
```bash
cd GP-Frontend
pnpm install  # If not already installed
pnpm dev
```

Open browser to: `http://localhost:3000/en/login`

---

## 🔑 Test Credentials

### Super Admin Account
**Contact Backend Team** for production credentials:
- **Email**: `youssefhassanein17@gmail.com`
- **Password**: [Request from backend team]
- **Role**: SUPER_ADMIN (Full access)

---

## ✅ Test Checklist

### Phase 1: Login Flow Testing

#### Step 1: Basic Login
- [ ] Navigate to `/en/login`
- [ ] Enter test credentials
- [ ] Click "Login" button
- [ ] **Expected**: Success toast message
- [ ] **Expected**: Redirect to `/en/admin/dashboard` (for SUPER_ADMIN)

#### Step 2: Verify Cookie
- [ ] Open DevTools → Application → Cookies
- [ ] **Expected**: See `accessToken` cookie
- [ ] **Expected**: Cookie is HTTP-only ✓
- [ ] **Expected**: Cookie is Signed ✓
- [ ] **Expected**: Token NOT in response body

#### Step 3: Verify Auth State
- [ ] Open React DevTools
- [ ] Check Zustand store (`auth-storage`)
- [ ] **Expected**: User object contains `{ name, language, role }`
- [ ] **Expected**: No token in localStorage
- [ ] **Expected**: `isAuthenticated: true`

#### Step 4: Network Tab Inspection
- [ ] Open DevTools → Network
- [ ] Check login request
- [ ] **Expected**: POST to `/api/v1/auth/login`
- [ ] **Expected**: Request body: `{ email, password }`
- [ ] **Expected**: Response: `{ name, language, role }` (no token!)
- [ ] **Expected**: Response headers include `Set-Cookie`

---

### Phase 2: Protected Routes Testing

#### Admin Dashboard
- [ ] While logged in, navigate to `/en/admin/dashboard`
- [ ] **Expected**: Page loads successfully
- [ ] **Expected**: No redirect to login

#### Logout & Access
- [ ] Click logout (if implemented) OR clear localStorage
- [ ] Try accessing `/en/admin/dashboard`
- [ ] **Expected**: Redirect to `/en/login?redirect=/en/admin/dashboard`

#### Wrong Role Access
- [ ] Login as DOCTOR (when available)
- [ ] Try accessing `/en/admin/dashboard`
- [ ] **Expected**: Redirect to unauthorized or doctor dashboard

---

### Phase 3: Create Doctor Testing

#### Step 1: Open Dialog
- [ ] Navigate to admin dashboard
- [ ] Click "Create Doctor" button
- [ ] **Expected**: Dialog opens with form

#### Step 2: Fill Form with Valid Data
```
First Name: Ahmed
Last Name: Hassan
National ID: 30202041234567
Email: ahmed.hassan@kasralainy.edu.eg
Phone: +201012345678
Speciality: Cardiology
Password: TestDoctor123!
Language: English
```

#### Step 3: Validate National ID
- [ ] Enter National ID: `30202041234567`
- [ ] **Expected**: See "Detected: MALE • Born: 2/20/2004"
- [ ] Try invalid ID: `12345678901234`
- [ ] **Expected**: Validation error

#### Step 4: Submit Form
- [ ] Click "Create Doctor"
- [ ] **Expected**: Loading spinner appears
- [ ] **Expected**: Success toast with doctor ID
- [ ] **Expected**: Dialog closes
- [ ] **Expected**: Form resets

#### Step 5: Verify Network Request
- [ ] Check Network tab
- [ ] **Expected**: POST to `/api/v1/auth/doctor/create`
- [ ] **Expected**: Cookie automatically included
- [ ] **Expected**: No Authorization header
- [ ] **Expected**: Response: `{ message: "Doctor is successfully created", id: "uuid" }`

---

### Phase 4: Validation Testing

#### Invalid Inputs
- [ ] Empty email → **Expected**: "Email is required"
- [ ] Invalid email format → **Expected**: "Invalid email format"
- [ ] Short password (< 8 chars) → **Expected**: "Password must be at least 8 characters"
- [ ] Weak password → **Expected**: Complexity error message
- [ ] Invalid phone format → **Expected**: "Phone must be in format +201XXXXXXXXX"
- [ ] Short National ID → **Expected**: "National ID must be exactly 14 digits"

#### Duplicate User
- [ ] Try creating doctor with existing email
- [ ] **Expected**: Error toast "Doctor already exists!"

---

### Phase 5: Error Handling Testing

#### Network Error
- [ ] Turn off internet/backend
- [ ] Try to login
- [ ] **Expected**: Error toast "Network error or server unreachable"

#### Invalid Credentials
- [ ] Login with wrong password
- [ ] **Expected**: Error toast "Invalid credentials"

#### 401 Unauthorized
- [ ] Login successfully
- [ ] Clear cookies manually
- [ ] Try accessing protected route
- [ ] **Expected**: Auto-redirect to login

#### 403 Forbidden
- [ ] Login as normal ADMIN
- [ ] Try creating admin (SUPER_ADMIN only)
- [ ] **Expected**: Error message

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network error" on login
**Check**:
- [ ] Is backend URL correct in `.env.local`?
- [ ] Is backend server running?
- [ ] Check CORS configuration

**Test Backend**:
```bash
curl https://api-gateway.yellowgrass-a3ce385a.westeurope.azurecontainerapps.io/api/v1/auth
```

### Issue 2: Cookie not set
**Check**:
- [ ] DevTools → Application → Cookies
- [ ] Look for `accessToken` cookie
- [ ] Check if domain matches

**Debug**:
- [ ] Network tab → Response Headers → `Set-Cookie`
- [ ] If no Set-Cookie header, backend issue
- [ ] If header present but no cookie, check browser settings

### Issue 3: "Token expired" after page refresh
**Normal behavior**:
- Cookies expire after configured time
- User must login again
- Check `COOKIES_EXPIRATION_TIME` in backend

### Issue 4: TypeScript errors
**Common fixes**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
pnpm install

# Restart dev server
pnpm dev
```

### Issue 5: React Query not caching
**Check**:
- [ ] Is `QueryClientProvider` wrapping app?
- [ ] Check React Query DevTools (bottom-left icon)
- [ ] Look for mutation status

---

## 📊 Success Criteria

### Login Flow ✅
- [x] User can login with valid credentials
- [x] JWT stored in HTTP-only cookie
- [x] User redirected based on role
- [x] Auth state persists across refreshes (until cookie expires)

### Doctor Creation ✅
- [x] Form validates all inputs
- [x] National ID extracts gender/birthdate
- [x] Success message shows doctor ID
- [x] Doctor appears in list (when implemented)

### Security ✅
- [x] No token in localStorage
- [x] Cookie is HTTP-only
- [x] Validation prevents invalid data
- [x] RBAC enforced on backend

---

## 🔍 Manual Testing Scenarios

### Scenario 1: Full Login to Dashboard Flow
1. Open fresh browser tab (incognito mode)
2. Navigate to `http://localhost:3000/en/login`
3. Enter super admin credentials
4. Submit form
5. Verify redirect to admin dashboard
6. Check cookie in DevTools
7. Refresh page → still authenticated ✅

### Scenario 2: Create Multiple Doctors
1. Login as SUPER_ADMIN
2. Create doctor #1 (different email)
3. Create doctor #2 (different email)
4. Try doctor #1 email again → expect error
5. Verify both created successfully

### Scenario 3: Role-Based Access
1. Login as SUPER_ADMIN
2. Access admin dashboard ✅
3. Logout
4. Login as DOCTOR (when available)
5. Try admin dashboard → redirected ✅

---

## 📝 Test Results Template

### Test Session: [Date]
**Tester**: [Name]  
**Environment**: Development  
**Backend**: Production API  

#### Results:
| Test | Status | Notes |
|------|--------|-------|
| Login Flow | ✅ Pass | - |
| Cookie Set | ✅ Pass | - |
| Auth State | ✅ Pass | - |
| Create Doctor | ✅ Pass | - |
| Validation | ✅ Pass | - |
| Error Handling | ✅ Pass | - |

**Issues Found**:
- None / [List issues]

**Screenshots**: [Attach if needed]

---

## 🚀 Next Steps After Testing

Once all tests pass:
1. [ ] Implement patient creation form
2. [ ] Add doctor listing/approval
3. [ ] Implement logout endpoint call
4. [ ] Add more protected routes
5. [ ] Remove remaining mock data

---

## 📞 Support

**Issues?**
- Check browser console for errors
- Check Network tab for failed requests
- Review [BACKEND_ARCHITECTURE_ANALYSIS.md](./BACKEND_ARCHITECTURE_ANALYSIS.md)
- Contact backend team for API issues

---

**Last Updated**: December 15, 2025  
**Status**: Ready for Testing ✅
