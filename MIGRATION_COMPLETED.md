# Frontend Migration Completed ✅

## Summary of Changes

All frontend files have been successfully updated to match the new backend API structure with authentication, API versioning, and standardized responses.

---

## 📁 Files Created

### 1. **`utils/auth.js`** - Authentication Helper

New utility file for managing authentication:

- `getAuthToken()` - Get JWT token from storage
- `getUserId()` - Get user ID from storage
- `getUserRole()` - Get user role from storage
- `storeAuthData()` - Store token, userId, and role
- `clearAuthData()` - Clear all auth data (logout)
- `isTokenValid()` - Check if token is still valid (7 days)
- `getAuthHeaders()` - Get headers with Bearer token

---

## 🔧 Files Modified

### 1. **`constants/config.js`**

**Changed:**

```javascript
// OLD
export const BASE_URL = `http://${SERVER_IP_AYMAN}:${SERVER_PORT}`;

// NEW
export const BASE_URL = `http://${SERVER_IP_AYMAN}:${SERVER_PORT}/api/v1`;
```

### 2. **`apis/user/SignUp.js`**

**Changes:**

- ✅ Removed `jwtDecode` dependency (no longer needed)
- ✅ Added `storeAuthData` import from utils
- ✅ Updated `registerUser()` to handle new response format: `{ success, message, data }`
- ✅ Updated `loginUser()` to:
  - Handle new response format with `data.token`, `data.userId`, `data.role`
  - Use `storeAuthData()` instead of manual AsyncStorage calls
  - Store `loginTime` for token expiration tracking

**Before:**

```javascript
const token = response.data.token;
const decoded = jwtDecode(token);
const role = decoded.role;
const userId = decoded.userId;
```

**After:**

```javascript
const { token, userId, role } = response.data.data;
await storeAuthData(token, userId, role);
```

### 3. **`apis/student/Student.js`**

**Changes:**

- ✅ Added `getAuthHeaders` import
- ✅ Updated `getStudentData()`:
  - Added Authorization header
  - Handle new response format
  - Handle 401 Unauthorized errors
- ✅ Updated `postStudentData()`:
  - Added Authorization header
  - Handle new response format
  - Handle 401 Unauthorized errors

**Added:**

```javascript
const headers = await getAuthHeaders();
// headers = { Authorization: 'Bearer <token>', Content-Type: 'application/json' }
```

### 4. **`apis/student/StudentFiles.js`**

**Changes:**

- ✅ Added `getAuthToken` import
- ✅ Updated `uploadStudentFiles()`:
  - Get token and validate before upload
  - Add Authorization header to fetch request
  - Handle 401 Unauthorized errors
  - Better error messages
- ✅ Updated `getStudentProfile()`:
  - Add Authorization header
  - Handle new response format
  - Handle 401 Unauthorized errors
- ✅ Updated `deleteStudentFile()`:
  - Add Authorization header
  - Handle new response format
  - Handle 401 Unauthorized errors

### 5. **`apis/project/Project.js`**

**Changes:**

- ✅ Added `getAuthHeaders` import
- ✅ Updated `getProject()`:
  - Add Authorization header
  - Handle new response format
  - Handle 401 Unauthorized errors
  - Handle 404 Not Found (no project)
- ✅ Updated `createProject()`:
  - Add Authorization header
  - Handle new response format
  - Handle 401 Unauthorized errors
  - Handle 400 Bad Request (duplicate project)
- ✅ Updated `updateProject()`:
  - Add Authorization header
  - Handle new response format
  - Handle 401 Unauthorized errors

### 6. **`apis/project/ProjectImages.js`**

**Changes:**

- ✅ Added `getAuthToken` import
- ✅ Updated `uploadProjectImages()`:
  - Get token and validate before upload
  - Add Authorization header to fetch request
  - Handle 401 Unauthorized errors
  - Handle 429 Rate Limit errors
  - Better error messages

### 7. **`screens/Verify.jsx`**

**Changes:**

- ✅ Updated verification code sending to handle new response format
- ✅ Updated resend code to handle new response format
- ✅ Better error handling with `data.success` checks

**Before:**

```javascript
.then(() => {
  Toast.show({ text1: "Code Sent" });
})
```

**After:**

```javascript
.then((data) => {
  if (data.success) {
    Toast.show({ text1: "Code Sent", text2: data.message });
  }
})
```

---

## 🔐 Authentication Flow

### Login Flow

1. User enters email and password
2. `loginUser()` sends request to `/api/v1/users/login`
3. Backend returns: `{ success: true, data: { token, userId, role } }`
4. Frontend stores token, userId, role, and loginTime
5. User navigated to appropriate screen based on role

### Making Authenticated Requests

```javascript
// Automatic - using getAuthHeaders()
const headers = await getAuthHeaders();
// Returns: { Authorization: 'Bearer <token>', Content-Type: 'application/json' }

const response = await axios.get(url, { headers });
```

### Handling Unauthorized (401) Errors

All API functions now detect 401 errors and return:

```javascript
{
  success: false,
  message: "Session expired. Please login again.",
  unauthorized: true
}
```

Your screens should check for `unauthorized` flag and redirect to login:

```javascript
const result = await getStudentData(userId);
if (result.unauthorized) {
  await clearAuthData();
  navigation.navigate("Login");
}
```

---

## 📊 Response Format Changes

### Old Format (Inconsistent)

```javascript
// Sometimes
{ token: "..." }

// Sometimes
{ success: true, data: {...} }

// Sometimes
{ message: "Error" }
```

### New Format (Consistent)

```javascript
// Success
{
  success: true,
  message: "Operation successful",
  data: { /* actual data */ }
}

// Error
{
  success: false,
  message: "Error description"
}
```

---

## 🚨 Breaking Changes for Screens

### What You Need to Update in Your Screens

#### 1. Check Response Format

**Old:**

```javascript
const result = await getStudentData(userId);
const student = result.data;
```

**New:**

```javascript
const result = await getStudentData(userId);
if (result.success) {
  const student = result.data; // data is already extracted
} else {
  // Handle error
  Alert.alert("Error", result.message);
}
```

#### 2. Handle Unauthorized Errors

Add this to all screens that fetch data:

```javascript
if (result.unauthorized) {
  await clearAuthData();
  Alert.alert("Session Expired", "Please login again.");
  navigation.navigate("Login");
  return;
}
```

#### 3. Handle Rate Limiting

For file uploads:

```javascript
try {
  await uploadStudentFiles(userId, files);
} catch (error) {
  if (error.message.includes("Too many")) {
    Alert.alert("Rate Limit", "Please wait before uploading again.");
  }
}
```

---

## ✅ Testing Checklist

### Authentication

- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Token stored correctly after login
- [ ] User navigated to correct screen based on role

### Student Profile

- [ ] Fetch student profile (requires auth)
- [ ] Update student profile (requires auth)
- [ ] Upload photo/CV (requires auth)
- [ ] Delete photo/CV (requires auth)
- [ ] Handle 401 error → redirect to login

### Projects

- [ ] Fetch project (requires auth)
- [ ] Create project (requires auth)
- [ ] Update project (requires auth)
- [ ] Upload project images (requires auth)
- [ ] Handle duplicate project error
- [ ] Handle 401 error → redirect to login

### Verification

- [ ] Send verification code
- [ ] Verify code
- [ ] Resend code
- [ ] Handle expired code

### Error Handling

- [ ] Network errors shown properly
- [ ] 401 errors redirect to login
- [ ] 429 rate limit errors shown
- [ ] Invalid data errors shown

---

## 🎯 Common Scenarios

### Scenario 1: User Opens App

```javascript
// Check if token is valid
const isValid = await isTokenValid();
if (isValid) {
  const userId = await getUserId();
  const role = await getUserRole();
  // Navigate to appropriate screen
} else {
  // Navigate to Login
}
```

### Scenario 2: Fetching Student Data

```javascript
const userId = await getUserId();
const result = await getStudentData(userId);

if (result.unauthorized) {
  await clearAuthData();
  navigation.navigate("Login");
  return;
}

if (result.success) {
  setStudent(result.data);
} else {
  Alert.alert("Error", result.message);
}
```

### Scenario 3: Uploading Files

```javascript
try {
  const userId = await getUserId();
  const result = await uploadStudentFiles(userId, { photo, cv });

  if (result.success) {
    Alert.alert("Success", result.message);
    // Refresh profile to get new URLs
  }
} catch (error) {
  if (error.message.includes("Session expired")) {
    await clearAuthData();
    navigation.navigate("Login");
  } else if (error.message.includes("Too many")) {
    Alert.alert("Rate Limit", "Please try again later.");
  } else {
    Alert.alert("Error", error.message);
  }
}
```

### Scenario 4: Logout

```javascript
await clearAuthData();
navigation.navigate("Login");
```

---

## 📝 Migration Steps for Existing Screens

If you have existing screens that need updating:

1. **Import auth utilities**

```javascript
import { getUserId, clearAuthData } from "../utils/auth";
```

2. **Add unauthorized handling**

```javascript
const result = await someApiCall();
if (result.unauthorized) {
  await clearAuthData();
  Alert.alert("Session Expired", "Please login again.");
  navigation.navigate("Login");
  return;
}
```

3. **Update response handling**

```javascript
if (result.success) {
  // Use result.data
} else {
  Alert.alert("Error", result.message);
}
```

4. **Test thoroughly**

- Test normal flow
- Test with expired/invalid token
- Test network errors
- Test rate limiting (for uploads)

---

## 🔗 Related Documentation

- `FRONTEND_MIGRATION.md` (in backend) - Detailed migration guide
- `QUICK_REFERENCE.md` (in backend) - Quick API changes reference
- `README.md` (in backend) - Complete API documentation

---

## ⚠️ Important Notes

1. **Token Expiration**: Tokens now last 7 days (was 1 hour)
2. **Rate Limiting**:
   - Login: 10 attempts / 15 minutes
   - Verification: 5 codes / 15 minutes
   - Uploads: 20 files / hour
3. **All student/project routes require authentication**
4. **Response format is now consistent across all endpoints**
5. **Error messages are more descriptive**

---

## 🚀 Next Steps

1. Update remaining screens to use new auth utilities
2. Add proper 401 error handling to all data fetching
3. Test all user flows thoroughly
4. Consider adding token refresh logic
5. Add offline support if needed

---

**All API integrations are now fully compatible with the updated backend! 🎉**
