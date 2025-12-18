# Google OAuth Setup Guide

This guide explains how to set up Google OAuth for Google Sheets integration, allowing each user to connect their own Google account.

## ✅ Architecture

- **MongoDB** = Source of truth for all guest data
- **Google Sheets** = Read-only report/view for hosts  
- **OAuth Tokens** = Stored per user in MongoDB
- **User Control** = Each host owns their spreadsheets
- **Auto Refresh** = Tokens automatically refreshed when expired

## 🚀 Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it (e.g., "Event Management App")

### 2. Enable Required APIs

1. Navigate to **APIs & Services** → **Library**
2. Search and enable:
   - ✅ **Google Sheets API**
   - ✅ **Google Drive API** (for file creation)

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (for public apps) or **Internal** (for workspace)
3. Fill in required fields:
   - App name: "Your App Name"
   - User support email: your-email@domain.com
   - Developer contact: your-email@domain.com
4. Add scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.file`
5. Save and continue

### 4. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: "Web Client"
5. Authorized redirect URIs:
   ```
   Development:
   http://localhost:3000/connect/google/callback
   
   Production:
   https://yourdomain.com/connect/google/callback
   ```
   ⚠️ **IMPORTANT**: Use **frontend URL** (port 3000), not backend (port 4000)!
6. Click **Create**
7. Copy **Client ID** and **Client Secret**

### 5. Configure Environment Variables

Add to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_OAUTH_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-abc123xyz789
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/connect/google/callback

# MongoDB (required)
MONGODB_URI=mongodb://localhost:27017/your-database

# JWT & Session Secrets (required)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SESSION_SECRET=your-super-secret-session-key-change-in-production

# Port & Frontend
PORT=4000
FRONTEND_URL=http://localhost:3000

# Optional: Keep service account as fallback
GOOGLE_SHEETS_ENABLED=false
```

### 6. Restart Backend

```bash
cd apps/backend
npm run dev
# or
bun run dev
```

## 📱 User Flow

### First-Time Setup

1. User opens Guests tab
2. Sees "Connect Google Sheets" banner
3. Clicks "Connect Google Account"
4. Redirects to Google OAuth consent screen
5. User authorizes the app
6. Redirects back to app
7. Shows "Google Account Connected" with email
8. "Sync to Sheets" button now available

### Syncing Guests

1. User clicks "Sync to Sheets" button
2. Dialog opens with two options:
   - ✅ **Auto-create** new spreadsheet
   - **Use existing** spreadsheet ID
3. User selects option and clicks "Sync"
4. Spreadsheet created/updated in user's Google Drive
5. Success toast with link to spreadsheet
6. User clicks link to view guests in Google Sheets

### Disconnecting

1. User clicks "Disconnect" in banner
2. Confirms action
3. OAuth tokens removed from database
4. Tokens revoked in Google
5. Banner changes back to "Connect" state

## 🔐 Security Features

### Token Storage
- ✅ Access tokens stored encrypted in MongoDB
- ✅ Refresh tokens stored encrypted (select: false)
- ✅ Never exposed in API responses
- ✅ Auto-removed on disconnect

### Token Refresh
- ✅ Tokens automatically refreshed when expired
- ✅ 5-minute buffer before expiry
- ✅ Graceful error handling
- ✅ User prompted to reconnect if refresh fails

### Permissions
- ✅ Only requested scopes: spreadsheets + drive.file
- ✅ Limited to created files only (not all Drive)
- ✅ User can revoke access anytime
- ✅ Tokens revoked on disconnect

## 🌐 API Endpoints

### OAuth Flow

```http
GET /api/guests/google/auth-url
Authorization: Bearer <token>
```
Returns authorization URL to redirect user

```http
GET /api/guests/google/callback?code=xxx&state=userId
```
Handles OAuth callback and saves tokens

```http
GET /api/guests/google/status
Authorization: Bearer <token>
```
Returns connection status and Google account info

```http
POST /api/guests/google/disconnect
Authorization: Bearer <token>
```
Disconnects Google account and revokes tokens

### Sync Endpoints (Updated)

```http
POST /api/guests/event/:eventId/sync-to-sheets
Authorization: Bearer <token>

{
  "autoCreate": true,
  "sheetName": "Guests"
}
```
Syncs using user's OAuth tokens (or fallback to service account)

Response includes `method: "oauth"` or `method: "service_account"`

## 🔄 Fallback Strategy

The system supports both OAuth and Service Account:

1. **Primary**: OAuth (user's own account)
   - Spreadsheets in user's Drive
   - Better privacy and control
   - Recommended for production

2. **Fallback**: Service Account (if configured)
   - Used if user hasn't connected OAuth
   - Spreadsheets in service account Drive
   - Good for testing/development

## 🎨 Frontend Components

### Connection Banner
```tsx
{!googleConnection?.connected && (
  <Card className="border border-blue-200 bg-blue-50">
    <Button onClick={() => connectGoogleMutation.mutate()}>
      Connect Google Account
    </Button>
  </Card>
)}
```

### Connected Status
```tsx
{googleConnection?.connected && (
  <Card className="border border-green-200 bg-green-50">
    <p>Connected as {googleConnection.googleEmail}</p>
    <Button onClick={() => disconnectGoogleMutation.mutate()}>
      Disconnect
    </Button>
  </Card>
)}
```

### Sync Button
Only visible when connected:
```tsx
{sheetsConfig?.enabled && googleConnection?.connected && (
  <Button onClick={() => setIsSyncDialogOpen(true)}>
    Sync to Sheets
  </Button>
)}
```

## 🧪 Testing

### Test OAuth Flow

1. Start backend: `npm run dev`
2. Start frontend: `cd apps/web && npm run dev`
3. Login to your app
4. Go to Guests tab
5. Click "Connect Google Account"
6. Authorize with Google
7. Verify "Connected" banner appears
8. Click "Sync to Sheets"
9. Check Google Drive for new spreadsheet

### Test Token Refresh

1. Wait for token to expire (1 hour default)
2. Try syncing again
3. Token should auto-refresh
4. Sync should succeed

### Test Disconnect

1. Click "Disconnect"
2. Verify banner changes to "Connect"
3. Check Google account permissions
4. Token should be revoked

## ⚠️ Troubleshooting

### "Redirect URI mismatch"
**Solution**: Ensure redirect URI in Google Console matches exactly:
```
http://localhost:3000/connect/google/callback
```
⚠️ Common mistake: Using port 4000 (backend) instead of 3000 (frontend)

### "Access blocked: This app's request is invalid"
**Solution**: OAuth consent screen not configured. Go back and complete all required fields.

### "No refresh token received"
**Solution**: Add `prompt: 'consent'` in OAuth URL generation (already included)

### "Token expired" after disconnect
**Solution**: Normal behavior. User needs to reconnect.

## 📊 Database Schema

User model includes:

```typescript
{
  googleSheetsAccessToken?: string;     // Encrypted
  googleSheetsRefreshToken?: string;    // Encrypted
  googleSheetsTokenExpiry?: Date;       // Expiry timestamp
}
```

## 🚀 Production Checklist

- [ ] OAuth consent screen published
- [ ] Production redirect URI added
- [ ] Environment variables set
- [ ] SSL/HTTPS enabled
- [ ] Error logging configured
- [ ] User privacy policy updated
- [ ] Google API quota checked
- [ ] Rate limiting configured

## 🎯 Benefits vs Service Account

| Feature | OAuth (✅) | Service Account |
|---------|------------|-----------------|
| User owns data | ✅ Yes | ❌ No |
| In user's Drive | ✅ Yes | ❌ No |
| Multi-tenant | ✅ Perfect | ⚠️ Shared |
| Privacy | ✅ Excellent | ⚠️ Centralized |
| Setup complexity | ⚠️ Medium | ✅ Simple |
| User experience | ✅ Transparent | ⚠️ Hidden |
| Scalability | ✅ Excellent | ⚠️ Limited |

## 📚 Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Google Drive API](https://developers.google.com/drive/api)
- [OAuth 2.0 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)

## 🆘 Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs
3. Verify environment variables
4. Test with Postman/curl
5. Check Google Cloud Console quotas

