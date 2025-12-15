# 🚀 Quick Start - Test the Integration NOW!

## ⚡ 3-Minute Setup

### Step 1: Start the Server (30 seconds)
```bash
cd GP-Frontend
pnpm dev
```

Wait for: `Ready on http://localhost:3000`

### Step 2: Open Browser
Navigate to: **http://localhost:3000/en/login**

### Step 3: Get Credentials
**Contact Backend Team** for:
- Email: `youssefhassanein17@gmail.com`
- Password: [Request this]

---

## 🧪 Quick Tests

### Test 1: Login (2 minutes)

1. **Enter credentials** in login form
2. **Click "Login"**
3. **Check**: Success toast appears
4. **Check**: Redirected to `/en/admin/dashboard`

**Verify Cookie:**
- Press `F12` (DevTools)
- Go to **Application** → **Cookies**
- Find: `accessToken` (should be HTTP-only ✓)

**Expected Response:**
```json
{
  "name": "Youssef Hassanien",
  "language": 1,
  "role": "SUPER_ADMIN"
}
```

❌ **NOT Expected:** Token in response body

### Test 2: Create Doctor (3 minutes)

**Add to Admin Dashboard:**
```typescript
// app/[locale]/admin/dashboard/page.tsx
import { CreateDoctorDialog } from '@/components/admin/CreateDoctorDialog';

export default function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <CreateDoctorDialog />
    </div>
  );
}
```

**Fill Form:**
```
First Name: Ahmed
Last Name: Hassan  
National ID: 30202041234567
Email: ahmed.test@kasralainy.edu.eg
Phone: +201012345678
Speciality: Cardiology
Password: TestDoc123!
Language: English
```

**Click Submit** → Should see:
✅ Success toast with doctor ID
✅ Dialog closes
✅ Form resets

### Test 3: Protected Routes (1 minute)

1. **Open new tab** (incognito)
2. **Go to**: `http://localhost:3000/en/admin/dashboard`
3. **Expected**: Auto-redirect to login
4. **Login** → Access granted ✅

---

## 🔍 Debug Checklist

### Login Not Working?

**Check Network Tab (F12 → Network):**
- ✅ Request to `/api/v1/auth/login`
- ✅ Status 200 or 201
- ✅ Response has `Set-Cookie` header
- ✅ Cookie appears in Cookies tab

**If 400/401 Error:**
- Wrong credentials
- Contact backend team

**If Network Error:**
```bash
# Test backend directly:
curl https://api-gateway.yellowgrass-a3ce385a.westeurope.azurecontainerapps.io/api/v1/auth
```

**If CORS Error:**
- Backend needs to add your origin to CORS
- Contact backend team

### Cookie Not Set?

**Check Response Headers:**
```
Set-Cookie: accessToken=eyJhbG...; HttpOnly; Secure; SameSite=None
```

**If missing:**
- Backend issue - contact backend team

**If present but not in Cookies:**
- Check browser settings (cookies enabled?)
- Try different browser

### Validation Errors?

**National ID:**
- Must be exactly 14 digits
- Must start with 2 or 3
- Example: `30202041234567`

**Phone:**
- Must match: `+201XXXXXXXXX`
- Example: `+201012345678`

**Password:**
- Minimum 8 characters
- Must have: uppercase, lowercase, number, special char
- Example: `TestDoc123!`

---

## 📸 What Success Looks Like

### 1. Login Success
![Login Flow](https://via.placeholder.com/800x400?text=Login+Success)
- ✅ Toast: "Login successful"
- ✅ URL changes to `/en/admin/dashboard`
- ✅ Cookie in DevTools

### 2. Create Doctor Success
![Create Doctor](https://via.placeholder.com/800x400?text=Doctor+Created)
- ✅ Toast: "Doctor created successfully! ID: abc-123..."
- ✅ Dialog closes
- ✅ Network shows 201 response

### 3. Protected Route
![Protected Route](https://via.placeholder.com/800x400?text=Auth+Guard+Working)
- ✅ Without login: Redirect to `/en/login`
- ✅ With login: Page loads

---

## 🎯 Expected Behavior

### Login Flow
```
User enters credentials
     ↓
Click "Login"
     ↓
[API Call] POST /api/v1/auth/login
     ↓
Backend validates → Generates JWT → Sets cookie
     ↓
Frontend receives: { name, language, role }
     ↓
Store updates → Redirect to dashboard
     ↓
✅ SUCCESS
```

### Create Doctor Flow
```
User fills form
     ↓
Click "Create Doctor"
     ↓
Zod validates inputs
     ↓
[API Call] POST /api/v1/auth/doctor/create
     ↓
Cookie automatically included in request
     ↓
Backend creates doctor → Returns ID
     ↓
Success toast → Dialog closes
     ↓
✅ SUCCESS
```

---

## 🆘 Still Stuck?

### Check Console Logs
```javascript
// You should see:
[API Request] POST /auth/login
[API Response] 201 /auth/login
[AuthGuard] User authenticated
```

### Check React Query DevTools
- Bottom-left icon in dev mode
- Should show mutations for login/create doctor
- Check status: success/error/loading

### Contact Support
1. **Screenshot** the error
2. **Copy** the network request (right-click → Copy as cURL)
3. **Share** in team chat with:
   - What you're testing
   - Expected vs actual behavior
   - Screenshots/errors

---

## ✅ Success Checklist

After testing, you should have:
- [x] Logged in successfully
- [x] Cookie visible in DevTools
- [x] Redirected to admin dashboard
- [x] Created a test doctor
- [x] Verified protected routes work
- [x] Confirmed validation works

---

## 🎉 Next Steps

Once all tests pass:
1. **Create similar components:**
   - CreatePatientDialog
   - CreateAdminDialog
2. **Add to dashboards:**
   - Admin dashboard: Doctor management
   - Doctor dashboard: Patient management
3. **Replace mock data:**
   - User tables
   - Hardcoded credentials
4. **Implement logout:**
   - Clear auth state
   - Show login page

---

## 📞 Get Help

**Backend Issues:**
- API not responding
- Wrong credentials
- CORS errors
→ Contact: Backend Team

**Frontend Issues:**
- Components not rendering
- TypeScript errors
- React Query not working
→ Check: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

**Documentation:**
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Full testing guide
- [BACKEND_ARCHITECTURE_ANALYSIS.md](./BACKEND_ARCHITECTURE_ANALYSIS.md) - How backend works
- [FRONTEND_BACKEND_INTEGRATION_GUIDE.md](./FRONTEND_BACKEND_INTEGRATION_GUIDE.md) - Integration guide

---

**Ready? Start testing! 🚀**

```bash
pnpm dev
```

Open: http://localhost:3000/en/login

Good luck! 🍀
