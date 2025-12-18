# 🚀 Google OAuth Quick Start Guide

Get Google Sheets OAuth integration running in **5 minutes**!

## 📋 Prerequisites

- Google account
- Backend running on port 4000
- Frontend running on port 3000

## ⚡ Quick Setup (5 Steps)

### Step 1: Google Cloud Console (2 min)

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create new project: "Event Manager"
3. Enable APIs:
   - Google Sheets API ✅
   - Google Drive API ✅

### Step 2: OAuth Consent Screen (1 min)

1. **APIs & Services** → **OAuth consent screen**
2. Select **External**
3. Fill in:
   - App name: "Event Manager"
   - User support email: your@email.com
   - Developer email: your@email.com
4. Click **Save and Continue**
5. Add scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.file`
6. Click **Save and Continue**
7. Add test users (your email)
8. Click **Save and Continue**

### Step 3: Create OAuth Credentials (1 min)

1. **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: "Web Client"
5. Authorized redirect URIs:
   ```
   http://localhost:3000/connect/google/callback
   ```
   ⚠️ **IMPORTANT**: Must be port **3000** (frontend), not 4000!
6. Click **Create**
7. Copy **Client ID** and **Client Secret**

### Step 4: Configure Environment (30 sec)

Create `apps/backend/.env` file:

```env
# Google OAuth (REQUIRED)
GOOGLE_OAUTH_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-abc123xyz789
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/connect/google/callback

# MongoDB (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/your-database

# JWT & Session (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-super-secret-session-key

# Port
PORT=4000

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

💡 **Tip**: Copy from `apps/backend/.env.example` and fill in your values

### Step 5: Restart Backend (30 sec)

```bash
cd apps/backend
npm run dev
# or
bun run dev
```

## ✅ Test It!

1. **Open app** → Go to any event
2. **Click Guests tab** → See blue "Connect Google Sheets" banner
3. **Click "Connect Google Account"** → Redirects to Google
4. **Authorize** → Click "Allow"
5. **See green banner** → Shows your email
6. **Click "Sync to Sheets"** → Creates spreadsheet
7. **Done!** 🎉

## 🎯 Expected Results

### Before Connection
```
[Blue Banner]
🔷 Connect Google Sheets
   Connect your Google account to sync guests to Google Sheets.
   [Connect Google Account] button
```

### After Connection
```
[Green Banner]
✅ Google Account Connected
   Connected as your-email@gmail.com
   [Disconnect] button

[Sync Button Enabled]
📊 Sync to Sheets
```

### After First Sync
```
✅ Toast: "Successfully synced 10 guests to Google Sheets!"
🔗 Link to your spreadsheet in Google Drive
```

## 🐛 Troubleshooting

### "Redirect URI mismatch"
**Fix**: Ensure exact match in Google Console:
```
http://localhost:3000/connect/google/callback
```
⚠️ Must be **port 3000** (frontend), not 4000!

### "Access blocked"
**Fix**: Add your email as test user in OAuth consent screen

### No blue banner appears
**Fix**: Check backend logs, verify .env variables

### "Failed to get authorization URL"
**Fix**: Check all 3 env variables are set

## 📊 Verify Installation

Check these endpoints:

```bash
# 1. Get auth URL (requires JWT token)
curl http://localhost:4000/api/guests/google/auth-url \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: { "success": true, "data": { "authUrl": "https://accounts.google.com/..." } }

# 2. Check status (requires JWT token)
curl http://localhost:4000/api/guests/google/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: { "success": true, "data": { "connected": false } }
```

## 🎓 Next Steps

1. **Read full documentation**:
   - `GOOGLE_OAUTH_COMPLETE_SUMMARY.md` - Complete overview
   - `apps/backend/GOOGLE_OAUTH_SETUP.md` - Detailed backend guide
   - `apps/web/GOOGLE_OAUTH_IMPLEMENTATION.md` - Frontend guide

2. **Test all features**:
   - Connect account ✅
   - Sync guests ✅
   - Auto-create spreadsheet ✅
   - Use existing spreadsheet ✅
   - Disconnect account ✅

3. **Prepare for production**:
   - Publish OAuth consent screen
   - Add production redirect URI
   - Update environment variables
   - Test with real users

## 📞 Need Help?

1. Check `GOOGLE_OAUTH_COMPLETE_SUMMARY.md` for troubleshooting
2. Review backend logs: `apps/backend/logs/`
3. Check browser console for errors
4. Verify all environment variables

## 🎉 Success Checklist

- [ ] Google Cloud project created
- [ ] APIs enabled (Sheets + Drive)
- [ ] OAuth consent screen configured
- [ ] OAuth credentials created
- [ ] Environment variables set
- [ ] Backend restarted
- [ ] Blue banner appears
- [ ] "Connect" redirects to Google
- [ ] Authorization works
- [ ] Green banner shows email
- [ ] "Sync" button enabled
- [ ] Spreadsheet created in Drive
- [ ] Can disconnect account

**All checked?** 🎊 You're ready to go!

---

**Total Setup Time:** ~5 minutes  
**Difficulty:** Easy  
**Status:** Production Ready ✅

