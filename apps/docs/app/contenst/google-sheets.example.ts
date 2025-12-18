/**
 * Example usage of Google Sheets integration
 * 
 * This file demonstrates how to use the Google Sheets service
 * for syncing event guests.
 */

import { googleSheetsService } from './google-sheets.service';
import { guestService } from './guest.service';

/**
 * Example 1: Initialize and sync all guests for an event
 */
export async function exampleFullSync(eventId: string) {
  // Initialize with credentials
  await googleSheetsService.initialize({
    spreadsheetId: '1ABC123...XYZ',
    sheetName: 'Guests',
    credentials: {
      clientEmail: 'your-service-account@project.iam.gserviceaccount.com',
      privateKey: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',
    },
  });

  // Get all guests for the event
  const guests = await guestService.findByEventId(eventId);

  // Sync to Google Sheets
  const result = await googleSheetsService.syncGuests(
    '1ABC123...XYZ',
    guests,
    'Guests'
  );

  console.log(`Synced ${result.synced} guests to Google Sheets`);
  console.log(`View at: ${googleSheetsService.getSpreadsheetUrl('1ABC123...XYZ')}`);
}

/**
 * Example 2: Create a new spreadsheet and sync
 */
export async function exampleCreateAndSync(eventId: string, eventTitle: string) {
  // Initialize service
  await googleSheetsService.initialize({
    spreadsheetId: '',
    credentials: {
      clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL!,
      privateKey: process.env.GOOGLE_SHEETS_PRIVATE_KEY!,
    },
  });

  // Create new spreadsheet
  const spreadsheetId = await googleSheetsService.createSpreadsheet(eventTitle);
  console.log(`Created spreadsheet: ${spreadsheetId}`);

  // Get guests and sync
  const guests = await guestService.findByEventId(eventId);
  await googleSheetsService.syncGuests(spreadsheetId, guests);

  console.log(`Spreadsheet URL: ${googleSheetsService.getSpreadsheetUrl(spreadsheetId)}`);
}

/**
 * Example 3: Append a single guest (after creating a new guest)
 */
export async function exampleAppendGuest(spreadsheetId: string, guestId: string) {
  // Initialize service
  await googleSheetsService.initialize({
    spreadsheetId,
    credentials: {
      clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL!,
      privateKey: process.env.GOOGLE_SHEETS_PRIVATE_KEY!,
    },
  });

  // Get the guest
  const guest = await guestService.findByIdOrFail(guestId);

  // Append to sheet
  await googleSheetsService.appendGuest(spreadsheetId, guest);
  console.log(`Appended guest ${guest.name} to spreadsheet`);
}

/**
 * Example 4: Update a guest in the sheet
 */
export async function exampleUpdateGuest(spreadsheetId: string, guestId: string) {
  // Initialize service
  await googleSheetsService.initialize({
    spreadsheetId,
    credentials: {
      clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL!,
      privateKey: process.env.GOOGLE_SHEETS_PRIVATE_KEY!,
    },
  });

  // Get updated guest
  const guest = await guestService.findByIdOrFail(guestId);

  // Update in sheet
  await googleSheetsService.updateGuest(spreadsheetId, guest);
  console.log(`Updated guest ${guest.name} in spreadsheet`);
}

/**
 * Example 5: Delete a guest from the sheet
 */
export async function exampleDeleteGuest(spreadsheetId: string, guestId: string) {
  // Initialize service
  await googleSheetsService.initialize({
    spreadsheetId,
    credentials: {
      clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL!,
      privateKey: process.env.GOOGLE_SHEETS_PRIVATE_KEY!,
    },
  });

  // Delete from sheet
  await googleSheetsService.deleteGuest(spreadsheetId, guestId);
  console.log(`Deleted guest ${guestId} from spreadsheet`);
}

/**
 * Example 6: Error handling
 */
export async function exampleWithErrorHandling(eventId: string) {
  try {
    await googleSheetsService.initialize({
      spreadsheetId: '1ABC123...XYZ',
      credentials: {
        clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL!,
        privateKey: process.env.GOOGLE_SHEETS_PRIVATE_KEY!,
      },
    });

    const guests = await guestService.findByEventId(eventId);
    const result = await googleSheetsService.syncGuests('1ABC123...XYZ', guests);

    console.log(`✅ Successfully synced ${result.synced} guests`);
  } catch (error: any) {
    if (error.code === 404) {
      console.error('❌ Spreadsheet not found. Make sure it\'s shared with the service account.');
    } else if (error.code === 403) {
      console.error('❌ Permission denied. Check service account has Editor access.');
    } else {
      console.error('❌ Sync failed:', error.message);
    }
  }
}

/**
 * Example 7: Batch operations (sync multiple events)
 */
export async function exampleBatchSync(eventIds: string[]) {
  // Initialize once
  await googleSheetsService.initialize({
    spreadsheetId: '',
    credentials: {
      clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL!,
      privateKey: process.env.GOOGLE_SHEETS_PRIVATE_KEY!,
    },
  });

  for (const eventId of eventIds) {
    try {
      const event = await import('@/modules/events/event.service').then(m => 
        m.eventService.findById(eventId)
      );
      
      if (!event) continue;

      // Create spreadsheet for each event
      const spreadsheetId = await googleSheetsService.createSpreadsheet(event.title);
      
      // Sync guests
      const guests = await guestService.findByEventId(eventId);
      await googleSheetsService.syncGuests(spreadsheetId, guests);

      console.log(`✅ Synced ${event.title}: ${guests.length} guests`);
      console.log(`   ${googleSheetsService.getSpreadsheetUrl(spreadsheetId)}`);
    } catch (error: any) {
      console.error(`❌ Failed to sync event ${eventId}:`, error.message);
    }
  }
}

// Note: These are example functions for demonstration purposes.
// In production, use the API endpoints provided in guest.controller.ts

