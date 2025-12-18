# 🔧 Google OAuth Redirect URI Fix

## Problem

You got this error:
```
Error 400: redirect_uri_mismatch
Request details: redirect_uri=http://localhost:3000/api/guests/google/callback
```

## Solution

The redirect URI should point to the **Next.js frontend**, not the backend API.

## ✅ Correct Setup

### 1. Google Cloud Console

Set redirect URI to:
```
http://localhost:3000/connect/google/callback
```

**NOT** ~~`http://localhost:3000/api/guests/google/callback`~~  
**NOT** ~~`http://localhost:4000/api/guests/google/callback`~~

### 2. Backend .env File

Create `apps/backend/.env` with:

```env
# Google OAuth (REQUIRED)
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/connect/google/callback

# MongoDB (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/your-database

# JWT Secret (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key

# Session Secret (REQUIRED)
SESSION_SECRET=your-super-secret-session-key

# Port (optional)
PORT=4000

# Frontend URL (REQUIRED)
FRONTEND_URL=http://localhost:3000
```

### 3. Restart Backend

```bash
cd apps/backend
npm run dev
# or
bun run dev
```

## 🔄 How It Works Now

### New Flow (Frontend Callback)

```
1. User clicks "Connect Google Account"
   ↓
2. Redirects to Google OAuth
   ↓
3. Google redirects to: http://localhost:3000/connect/google/callback?code=xxx
   ↓
4. Next.js callback page loads (beautiful UI!)
   ↓
5. Page calls backend API with code
   ↓
6. Backend exchanges code for tokens
   ↓
7. Page shows success animation
   ↓
8. Redirects back to Guests page
   ↓
9. Green "Connected" banner appears!
```

### Benefits

✅ **Better UX**: Beautiful loading and success states  
✅ **Error Handling**: User-friendly error messages  
✅ **Return Path**: Automatically returns to previous page  
✅ **Professional**: Feels like a native app  

## 📍 Redirect URIs for Different Environments

### Development
```
http://localhost:3000/connect/google/callback
```

### Staging
```
https://staging.yourdomain.com/connect/google/callback
```

### Production
```
https://yourdomain.com/connect/google/callback
```

## 🎨 Callback Page Features

The new callback page (`/connect/google/callback`) shows:

### Loading State
- 🔵 Blue spinning loader
- "Authenticating with Google..."
- Animated dots

### Success State
- ✅ Green checkmark animation
- Google logo badge
- Shows connected email
- Auto-redirects in 2 seconds

### Error State
- ❌ Red X icon
- Clear error message
- "Try Again" button
- "Go to Dashboard" button

## 🚨 Common Issues

### Still getting redirect_uri_mismatch?

**Check these in order:**

1. **Google Cloud Console**
   - Go to Credentials → Your OAuth Client
   - Verify redirect URI is **exactly**: `http://localhost:3000/connect/google/callback`
   - No trailing slash!
   - Correct protocol (http vs https)

2. **Backend .env**
   - Must have `GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/connect/google/callback`
   - Must match Google Console exactly

3. **Restart Backend**
   - Changes to .env require restart
   - Kill the server (Ctrl+C)
   - Start again: `npm run dev`

4. **Clear Browser Cache**
   - OAuth can cache old redirect URIs
   - Try incognito/private mode

### Backend not reading .env?

```bash
# Check if .env exists
ls -la apps/backend/.env

# If not, create it from template
cd apps/backend
cp .env.example .env
# Then edit .env with your values
```

### Port conflicts?

Make sure:
- Backend runs on port **4000** ✅
- Frontend runs on port **3000** ✅

```bash
# Check what's running on ports
lsof -i :3000
lsof -i :4000
```

## ✅ Quick Verification

Test the callback page directly:

```bash
# Open in browser (should show error state)
http://localhost:3000/connect/google/callback
```

You should see:
- ❌ "Connection Failed"
- "Missing authorization code or state"

This means the page is working! It just needs the OAuth code from Google.

## 🎯 Final Checklist

- [ ] Google Console redirect URI: `http://localhost:3000/connect/google/callback`
- [ ] Backend .env has all 3 OAuth variables
- [ ] Backend .env redirect URI matches Google Console
- [ ] Backend restarted after .env changes
- [ ] Frontend running on port 3000
- [ ] Backend running on port 4000
- [ ] Can access: http://localhost:3000/connect/google/callback
- [ ] Blue "Connect" banner shows in Guests tab
- [ ] Click "Connect" redirects to Google
- [ ] After authorize, redirects to callback page
- [ ] Callback page shows success ✅
- [ ] Redirects back to Guests tab
- [ ] Green "Connected" banner shows!

## 📚 Related Files

- **Callback Page**: `apps/web/src/app/connect/google/callback/page.tsx`
- **Backend Config**: `apps/backend/src/config/environment.ts`
- **OAuth Service**: `apps/backend/src/modules/guests/google-oauth.service.ts`
- **Env Template**: `apps/backend/.env.example`

## 🆘 Still Not Working?

1. Check backend logs for errors
2. Check browser console (F12)
3. Verify all environment variables are set
4. Try creating a new OAuth client in Google Console
5. Make sure you're using the correct Google account

---

**Status**: ✅ Implementation complete with frontend callback page!

