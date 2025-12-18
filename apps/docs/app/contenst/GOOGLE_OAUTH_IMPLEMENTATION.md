# Google OAuth Frontend Implementation

This document describes the frontend implementation for Google OAuth integration with Google Sheets.

## 📁 Files Modified/Created

### 1. Hooks: `src/hooks/api/useGuest.ts`

Added new hooks for Google OAuth:

#### `useGoogleConnectionStatus()`
Fetches the current Google connection status for the logged-in user.

```typescript
const { data: googleConnection } = useGoogleConnectionStatus();
// googleConnection: { connected: boolean, googleEmail?: string, googleName?: string }
```

#### `useGetGoogleAuthUrl()`
Generates OAuth URL and redirects user to Google consent screen.

```typescript
const connectGoogle = useGetGoogleAuthUrl();
connectGoogle.mutate(); // Redirects to Google
```

#### `useDisconnectGoogle()`
Disconnects user's Google account and revokes tokens.

```typescript
const disconnectGoogle = useDisconnectGoogle();
disconnectGoogle.mutate();
```

### 2. UI: `src/components/events/tabs/Guests.tsx`

Added two connection status banners:

#### Connection Banner (Not Connected)
Shows when user hasn't connected their Google account yet:
- Blue themed banner
- "Connect Google Account" button
- Explains that spreadsheets will be in user's Drive

```tsx
{sheetsConfig?.enabled && !googleConnection?.connected && (
  <Card className="border border-blue-200 bg-blue-50">
    <Button onClick={() => connectGoogleMutation.mutate()}>
      Connect Google Account
    </Button>
  </Card>
)}
```

#### Connected Status Banner
Shows when user has connected their Google account:
- Green themed banner
- Shows connected email
- "Disconnect" button
- Confirmation dialog before disconnect

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

#### Updated Sync Button
Only shows when user is connected:

```tsx
{sheetsConfig?.enabled && googleConnection?.connected && (
  <Button onClick={() => setIsSyncDialogOpen(true)}>
    Sync to Sheets
  </Button>
)}
```

## 🔄 User Flow

### Step 1: Initial State (Not Connected)
```
User visits Guests tab
  ↓
Blue banner appears: "Connect Google Sheets"
  ↓
User clicks "Connect Google Account"
```

### Step 2: OAuth Authorization
```
Redirects to Google OAuth consent screen
  ↓
User sees requested permissions:
  - View and manage spreadsheets
  - View and manage files created by this app
  ↓
User clicks "Allow"
```

### Step 3: Callback Handling
```
Google redirects to: /api/guests/google/callback?code=xxx&state=userId
  ↓
Backend exchanges code for tokens
  ↓
Tokens saved to user document in MongoDB
  ↓
Frontend queries connection status
  ↓
Green "Connected" banner appears
```

### Step 4: Syncing Guests
```
User clicks "Sync to Sheets" button
  ↓
Dialog opens with options:
  - Auto-create new spreadsheet
  - Use existing spreadsheet
  ↓
User selects and clicks "Sync"
  ↓
API request with user's OAuth tokens
  ↓
Spreadsheet created/updated in user's Drive
  ↓
Success toast with link to spreadsheet
```

### Step 5: Disconnecting (Optional)
```
User clicks "Disconnect"
  ↓
Confirmation dialog: "Are you sure?"
  ↓
User confirms
  ↓
Tokens removed from database
  ↓
Tokens revoked in Google
  ↓
Banner changes back to "Connect" state
```

## 🎨 UI Components

### Banner Styling

Both banners follow consistent design:
- Card with colored border
- Icon in colored circle
- Title + description
- Action button
- Responsive padding

**Not Connected Banner:**
```scss
border: blue-200
background: blue-50 / dark:blue-950
icon: Sheet in blue-600 circle
button: primary style
```

**Connected Banner:**
```scss
border: green-200
background: green-50 / dark:green-950
icon: CheckCircle2 in green-600 circle
button: outline with green accent
```

## 🔐 Security Considerations

### Token Storage
- Tokens never stored in localStorage/sessionStorage
- Tokens only in MongoDB on backend
- Frontend only knows connection status

### API Calls
- All requests authenticated with JWT
- OAuth tokens never exposed to frontend
- Backend handles token refresh automatically

### User Privacy
- Users can disconnect anytime
- Tokens revoked on disconnect
- Clear feedback on connection status

## 📱 Responsive Design

All components are mobile-friendly:
- Banners stack on small screens
- Buttons remain accessible
- Text readable at all sizes
- Icons properly sized

## ⚡ Performance

### Query Optimization
- Connection status cached for 1 minute
- Invalidated after connect/disconnect
- No unnecessary re-fetches

### Loading States
- Buttons show "Connecting..." state
- Mutations disabled during loading
- Smooth transitions

## 🧪 Testing Checklist

### Connection Flow
- [ ] Blue banner shows when not connected
- [ ] Click "Connect" redirects to Google
- [ ] Authorize in Google
- [ ] Redirect back to app
- [ ] Green banner shows with email
- [ ] "Sync to Sheets" button appears

### Disconnect Flow
- [ ] Click "Disconnect" shows confirmation
- [ ] Cancel keeps connection
- [ ] Confirm disconnects
- [ ] Banner changes to blue "Connect"
- [ ] "Sync" button disappears

### Error Handling
- [ ] OAuth error shows toast
- [ ] API error shows toast
- [ ] Network error shows toast
- [ ] Graceful fallback to service account

### Multi-Tab Sync
- [ ] Connect in Tab A
- [ ] Tab B updates automatically
- [ ] Disconnect in Tab A
- [ ] Tab B updates automatically

## 🎯 Future Enhancements

### Potential Additions
1. **Auto-sync toggle**: Automatically sync on guest changes
2. **Sync history**: Show last sync time and status
3. **Multiple spreadsheets**: Link event to multiple sheets
4. **Selective sync**: Choose which columns to sync
5. **Bi-directional sync**: Update guests from Sheets
6. **Conflict resolution**: Handle concurrent edits
7. **Sync scheduling**: Auto-sync on schedule

### UI Improvements
1. **Preview**: Show spreadsheet preview before sync
2. **Progress**: Real-time sync progress
3. **Notifications**: Email on sync completion
4. **Analytics**: Track sync usage
5. **Onboarding**: Step-by-step guide for first-time users

## 🐛 Common Issues

### Banner doesn't appear
**Check:**
- `sheetsConfig?.enabled` is true
- Backend OAuth configured
- No console errors

### "Connect" button doesn't work
**Check:**
- User is authenticated
- Network tab for API errors
- OAuth credentials in .env
- Redirect URI matches exactly

### Redirect fails
**Check:**
- Redirect URI in Google Console
- Callback endpoint exists
- Backend is running
- Ports match

### "Sync" button doesn't appear
**Check:**
- User is connected (green banner)
- `googleConnection?.connected` is true
- Query cache is fresh

## 📊 Analytics Events (Recommended)

Track these events for insights:

```typescript
// Connection events
analytics.track('Google Sheets Connect Started');
analytics.track('Google Sheets Connect Success');
analytics.track('Google Sheets Connect Failed', { error });
analytics.track('Google Sheets Disconnected');

// Sync events
analytics.track('Guests Sync Started', { method: 'oauth', guestCount });
analytics.track('Guests Sync Success', { method: 'oauth', duration });
analytics.track('Guests Sync Failed', { method: 'oauth', error });
```

## 🔗 Related Documentation

- Backend: `apps/backend/GOOGLE_OAUTH_SETUP.md`
- API: `apps/backend/src/modules/guests/google-oauth.service.ts`
- Hooks: `apps/web/src/hooks/api/useGuest.ts`
- UI: `apps/web/src/components/events/tabs/Guests.tsx`

## 🆘 Support

For issues or questions:
1. Check backend logs first
2. Verify OAuth configuration
3. Test with curl/Postman
4. Check Google Cloud Console
5. Review error messages in toast

