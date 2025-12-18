# Google Sheets Integration - Frontend

This document describes the Google Sheets sync feature integrated into the Guests tab.

## Features

### 🔄 Sync Button
- Appears in the guests table toolbar when Google Sheets is enabled
- Only visible if backend Google Sheets integration is configured
- Shows loading state during sync

### 📊 Sync Dialog
Interactive dialog with two modes:

#### Mode 1: Auto-Create (Recommended)
- Automatically creates a new spreadsheet
- Names it after your event
- No manual configuration needed
- Perfect for first-time users

#### Mode 2: Use Existing Spreadsheet
- Sync to an existing Google Sheet
- Requires spreadsheet ID from URL
- Customize sheet name
- Great for updating existing sheets

## User Flow

### First Time Setup
1. Click "Sync to Sheets" button in toolbar
2. Check "Create new spreadsheet automatically"
3. Click "Sync X Guests"
4. Success! Link to spreadsheet appears
5. Click link to open and view your guests

### Subsequent Syncs
1. Click "Sync to Sheets" button
2. Paste spreadsheet ID (from previous sync)
3. Click "Sync X Guests"
4. Data updates in existing spreadsheet

## UI Components

### Sync Button
```tsx
<Button 
  variant="outline" 
  size="sm"
  onClick={() => setIsSyncDialogOpen(true)}
>
  <Sheet className="h-3.5 w-3.5 mr-1.5" />
  Sync to Sheets
</Button>
```

### Sync Dialog
- **Title**: "Sync Guests to Google Sheets"
- **Description**: Brief explanation of feature
- **Options**:
  - Auto-create checkbox
  - Spreadsheet ID input (conditional)
  - Sheet name input (conditional)
- **Info Box**: What gets synced
- **Tip Box**: Helpful guidance
- **Actions**: Cancel and Sync buttons

## API Integration

### Hooks Used

#### `useGoogleSheetsSyncConfig(eventId)`
Checks if Google Sheets is enabled for the event
```typescript
const { data: sheetsConfig } = useGoogleSheetsSyncConfig(eventId)
// sheetsConfig.enabled: boolean
```

#### `useSyncGuestsToSheets(eventId)`
Performs the sync operation
```typescript
const syncMutation = useSyncGuestsToSheets(eventId)

await syncMutation.mutateAsync({
  spreadsheetId: 'optional',
  sheetName: 'Guests',
  autoCreate: true
})
```

### Response Handling
```typescript
{
  synced: 42,                    // Number of guests synced
  spreadsheetId: '1ABC...XYZ',   // Spreadsheet ID
  spreadsheetUrl: 'https://...',  // Direct link
  sheetName: 'Guests'            // Sheet tab name
}
```

## State Management

### Component State
```typescript
const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)
const [spreadsheetId, setSpreadsheetId] = useState('')
const [sheetName, setSheetName] = useState('Guests')
const [autoCreate, setAutoCreate] = useState(false)
```

### Sync Handler
```typescript
const handleSyncToSheets = async () => {
  const result = await syncMutation.mutateAsync({
    spreadsheetId: spreadsheetId || undefined,
    sheetName: sheetName || 'Guests',
    autoCreate: autoCreate || !spreadsheetId,
  })
  
  // Show success with clickable link
  toast.success(
    <div>
      <p>Successfully synced {result.synced} guests!</p>
      <a href={result.spreadsheetUrl}>Open Spreadsheet →</a>
    </div>
  )
}
```

## User Experience

### Success Flow
1. User clicks "Sync to Sheets"
2. Dialog opens with options
3. User configures sync (or uses auto-create)
4. Clicks "Sync X Guests"
5. Loading indicator shows
6. Success toast appears with:
   - Number of guests synced
   - Clickable link to spreadsheet
7. Dialog closes automatically
8. User clicks link to view spreadsheet

### Error Handling
- Backend not configured: Button doesn't appear
- Invalid spreadsheet ID: Error toast
- Permission denied: Error toast with message
- Network error: Error toast

### Loading States
- Sync button shows "Syncing..." when in progress
- Dialog sync button disabled during operation
- Spinner animation in sync button

## Responsive Design

### Desktop (≥ 768px)
- Full button text: "Sync to Sheets"
- All dialog fields visible
- Comfortable spacing

### Mobile (< 768px)
- Shortened text: "Sync"
- Dialog adapts to screen size
- Touch-friendly buttons

## Accessibility

- ✅ Keyboard navigation
- ✅ Screen reader labels
- ✅ Focus management
- ✅ ARIA attributes
- ✅ Clear error messages

## Visual Design

### Colors
- Button: Outline variant (neutral)
- Icon: Sheet icon from lucide-react
- Info box: Blue background
- Tip box: Amber background
- Success toast: Green accent

### Typography
- Button: text-xs
- Dialog title: Default size
- Labels: text-sm
- Helper text: text-xs
- Toast: Default size

## Testing Checklist

- [ ] Button appears when sheets enabled
- [ ] Button hidden when sheets disabled
- [ ] Auto-create mode works
- [ ] Existing spreadsheet mode works
- [ ] Loading states display correctly
- [ ] Success toast shows with link
- [ ] Error toasts show on failure
- [ ] Dialog closes after success
- [ ] Spreadsheet link opens correctly
- [ ] Mobile layout works
- [ ] Keyboard navigation works

## Future Enhancements

Potential improvements:

1. **Auto-sync Toggle**
   - Sync automatically on guest changes
   - Enable/disable per event

2. **Sync History**
   - Show last sync time
   - View sync logs
   - Undo sync option

3. **Selective Sync**
   - Choose which guests to sync
   - Filter by tag or status
   - Exclude certain fields

4. **Templates**
   - Save sync configurations
   - Reuse for multiple events
   - Share with team

5. **Notifications**
   - Email when sync completes
   - Slack/Discord integration
   - Webhook support

## Files Modified

- `apps/web/src/components/events/tabs/Guests.tsx` - Main component
- `apps/web/src/hooks/api/useGuest.ts` - API hooks
- Added imports for Dialog, Input, Label, Sheet icon

## Dependencies

- `@tanstack/react-query` - Data fetching
- `lucide-react` - Icons
- `react-hot-toast` - Notifications
- UI components from `@/components/ui/*`

## Support

For issues:
1. Check backend Google Sheets configuration
2. Verify service account permissions
3. Check browser console for errors
4. Review network tab for API calls

