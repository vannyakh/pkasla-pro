# Quick Setup Guide: Google Sheets Integration

## Step-by-Step Setup (5 minutes)

### 1. Create Google Service Account

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Go to **APIs & Services** → **Library**
4. Search "Google Sheets API" and click **Enable**
5. Go to **APIs & Services** → **Credentials**
6. Click **Create Credentials** → **Service Account**
7. Name it (e.g., "Event Guest Sync") and click **Create**
8. Skip role assignment, click **Done**

### 2. Generate Credentials

1. Click on your new service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON** format
5. Click **Create** (downloads a JSON file)

### 3. Configure Environment

Open the downloaded JSON file and copy values to your `.env`:

```env
GOOGLE_SHEETS_ENABLED=true
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

**Important:** Replace actual newlines in the private key with `\n`

### 4. Restart Server

```bash
cd apps/backend
npm run dev
# or
bun run dev
```

### 5. Test the Integration

```bash
# Check if enabled
curl -X GET \
  http://localhost:4000/api/guests/event/YOUR_EVENT_ID/sheets-config \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Usage Options

### Option A: Auto-Create New Spreadsheet

```bash
curl -X POST \
  http://localhost:4000/api/guests/event/YOUR_EVENT_ID/sync-to-sheets \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"autoCreate": true}'
```

Response includes the new spreadsheet URL!

### Option B: Use Existing Spreadsheet

1. Create a Google Sheet manually
2. Share it with your service account email (Editor permission)
3. Copy the spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```
4. Sync:

```bash
curl -X POST \
  http://localhost:4000/api/guests/event/YOUR_EVENT_ID/sync-to-sheets \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "spreadsheetId": "YOUR_SPREADSHEET_ID"
  }'
```

## Common Issues

### ❌ "Spreadsheet not found"
**Solution:** Share the spreadsheet with your service account email

### ❌ "Authentication failed"
**Solution:** Check that your private key includes the full key with headers:
```
-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
```

### ❌ "Integration not enabled"
**Solution:** 
1. Set `GOOGLE_SHEETS_ENABLED=true`
2. Restart server
3. Verify environment variables are loaded

## What Gets Synced?

All guest information:
- ✅ Name, Email, Phone
- ✅ Status (pending/confirmed/declined)
- ✅ Occupation, Address, Province
- ✅ Tags (bride/groom/etc)
- ✅ Gift status
- ✅ Notes
- ✅ Timestamps

## Security Notes

- ✅ Service account only accesses shared spreadsheets
- ✅ Only event hosts can sync their guests
- ✅ Credentials stored in environment variables
- ❌ Never commit service account JSON to git
- ❌ Never share private keys publicly

## Next Steps

After setup:
1. Create an event
2. Add some guests
3. Sync to Google Sheets
4. View your guests in the spreadsheet!

The spreadsheet updates every time you sync, keeping data fresh in both places.

