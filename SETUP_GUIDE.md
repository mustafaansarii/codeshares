# CodeShare - Complete Setup Guide

## Project Structure Alignment with Doc-Service

CodeShare is now fully aligned with the doc-service architecture pattern.

### Frontend Structure
```
src/
├── pages/              - Page components (HomePage, LoginPage, etc.)
├── components/         - Reusable components (auth, navbar, footer, etc.)
├── services/           - API client services (auth, problems, user)
├── App.jsx             - Root component with routing
└── index.css           - Tailwind CSS + custom styles
```

### Backend Structure
```
src/main/java/com/codeshare/
├── config/             - SecurityConfig, AppProperties
├── controller/         - REST API endpoints
├── service/            - Business logic
├── security/           - Auth, JWT, OAuth2
├── entity/             - JPA entities
├── repo/               - Spring Data repositories
├── dto/                - API DTOs
└── util/               - Utilities
```

---

## Environment Variables (RENDER BACKEND)

Set these in your Render dashboard under Environment Variables:

### **Authentication & OAuth2**
```
OAUTH_SUCCESS_REDIRECT=https://frontend-theta-woad-22.vercel.app
OAUTH_REDIRECT_URI=https://codeshares-backend-latest.onrender.com/login/oauth2/code/{registrationId}
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=None
```

### **CORS**
```
CORS_ALLOWED_ORIGINS=https://frontend-theta-woad-22.vercel.app
```

### **JWT & Security**
```
AUTH_JWT_SECRET=your-256-bit-secret-key-must-be-at-least-32-characters-long
AUTH_JWT_EXPIRY_MS=3600000
AUTH_SESSION_EXPIRY_MS=2592000000
```

### **Google OAuth (from Google Cloud Console)**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### **Database**
```
DATABASE_URL=your-postgres-url
DATABASE_USERNAME=your-db-user
DATABASE_PASSWORD=your-db-password
```

---

## Frontend Deployment (VERCEL)

### 1. Vercel Configuration (`frontend/vercel.json`)
Already configured to:
- Rewrite `/codeshare/:path*` → backend `/api/:path*` (strips prefix)
- Serve React app for unmatched routes

### 2. Service Layer (`src/services/`)
- `auth.service.js` - OAuth2, login, logout
- `problems.service.js` - Problem CRUD, run/submit code
- `user.service.js` - User profile, solutions

### 3. Routing (`src/components/route-manage/PrivateRoute.jsx`)
- Protected routes require authentication
- Unauthenticated users redirected to `/login`

---

## OAuth2 Flow Diagram

```
1. User clicks "Continue with Google"
   ↓
2. Frontend → `/codeshare/oauth2/authorization/google`
   ↓
3. Vercel proxy rewrites to backend `/oauth2/authorization/google`
   ↓
4. Backend redirects to Google OAuth consent screen
   ↓
5. User logs in on Google
   ↓
6. Google redirects to `https://codeshares-backend-latest.onrender.com/login/oauth2/code/google?code=...&state=...`
   ↓
7. Backend exchanges code for access token
   ↓
8. Backend stores JWT in HttpOnly cookie with:
   - SameSite=None (for cross-origin)
   - Secure=true (HTTPS only)
   ↓
9. Backend redirects to `https://frontend-theta-woad-22.vercel.app`
   ↓
10. Frontend verifies auth via `/codeshare/api/auth/me`
    ↓
11. Browser sends cookie automatically (withCredentials: true)
    ↓
12. User is authenticated ✓
```

---

## Key Alignment Points with Doc-Service

### Backend
✅ OAuth2 + JWT hybrid authentication  
✅ HttpOnly cookies with SameSite=None & Secure=true  
✅ Role-based access control via CSV  
✅ Proper service layer abstraction  
✅ Spring Data JPA + PostgreSQL  

### Frontend
✅ React Router with PrivateRoute  
✅ Service layer for API calls  
✅ Tailwind CSS with dark mode support  
✅ OAuth2 buttons (Google, GitHub)  
✅ Toast notifications for user feedback  

### Deployment
✅ Vercel proxy configuration for API calls  
✅ Backend on Render with Docker  
✅ CORS properly configured  
✅ Cookie handling for cross-origin requests  

---

## Testing the Complete Flow

1. **Deploy changes:**
   ```bash
   # Frontend automatically deploys on git push to Vercel
   # Backend automatically deploys on git push to Render (if connected)
   ```

2. **Test OAuth Login:**
   - Go to `https://frontend-theta-woad-22.vercel.app/login`
   - Click "Continue with Google"
   - Should redirect to Google login
   - After login, should redirect back to home and be authenticated

3. **Test API Calls:**
   - Verify `/codeshare/api/auth/me` works via Vercel proxy
   - Check browser Network tab for cookie headers

4. **Test Protected Routes:**
   - Try accessing `/problems/{id}` without auth → redirects to `/login`
   - After auth, should load problem editor

---

## API Endpoints

### Authentication
- `POST /api/auth/logout` - Logout (clears cookie)
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/profile` - Update profile

### Problems
- `GET /api/problems` - List all problems (paginated, filtered)
- `GET /api/problems/{id}` - Get problem details
- `POST /api/problems` - Create problem (admin only)
- `PUT /api/problems/{id}` - Update problem (admin only)
- `DELETE /api/problems/{id}` - Delete problem (admin only)

### Code Execution
- `POST /api/problems/run` - Run sample tests
- `POST /api/problems/submit` - Submit solution (runs all tests)

### Health
- `GET /health` - Service health check

---

## Common Issues & Solutions

### OAuth2 Redirect Loop
**Issue:** Stuck on `/login` after OAuth  
**Fix:** Ensure `OAUTH_SUCCESS_REDIRECT` is set correctly in Render env vars

### 401 Unauthorized on API Calls
**Issue:** Auth fails even after login  
**Fix:** Check that cookies are being sent:
```bash
curl -b "ACCESS_TOKEN=..." https://codeshares-backend-latest.onrender.com/api/auth/me
```

### CORS Error
**Issue:** Cross-origin request blocked  
**Fix:** Ensure `CORS_ALLOWED_ORIGINS` includes frontend URL with https

### Cookie Not Sent
**Issue:** Cookie not appearing in network requests  
**Fix:** Ensure axios has `withCredentials: true`:
```javascript
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,  // ← CRITICAL
});
```

---

## Next Steps

1. ✅ Set environment variables on Render
2. ✅ Test OAuth2 flow end-to-end
3. ✅ Test protected routes
4. ✅ Test API calls through Vercel proxy
5. 🔄 Monitor error logs in Render dashboard
6. 🔄 Update Google Cloud Console redirect URIs (if needed)

---

Generated: Doc-Service Alignment Complete
