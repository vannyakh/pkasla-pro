import { google } from 'googleapis';
import { env } from '@/config/environment';
import { logger } from '@/utils/logger';
import type { GuestResponse } from './guest.service';

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheetName?: string;
  credentials: {
    clientEmail: string;
    privateKey: string;
  };
}

class GoogleSheetsService {
  private sheets: any;
  private auth: any;

  /**
   * Initialize Google Sheets API with service account credentials
   */
  async initialize(config: GoogleSheetsConfig) {
    try {
      // Create JWT auth client
      this.auth = new google.auth.JWT({
        email: config.credentials.clientEmail,
        key: config.credentials.privateKey.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      // Initialize sheets API
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      logger.info('Google Sheets API initialized successfully');
      return true;
    } catch (error) {
      logger.error({ error }, 'Failed to initialize Google Sheets API');
      throw error;
    }
  }

  /**
   * Get or create spreadsheet and setup headers
   */
  async ensureSpreadsheetExists(spreadsheetId: string, sheetName: string = 'Guests'): Promise<void> {
    try {
      // Check if spreadsheet exists
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });

      // Check if sheet with the given name exists
      const sheet = response.data.sheets?.find(
        (s: any) => s.properties.title === sheetName
      );

      if (!sheet) {
        // Create new sheet
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: sheetName,
                  },
                },
              },
            ],
          },
        });
        logger.info({ sheetName }, 'Created new sheet');
      }

      // Setup headers if the sheet is empty
      const headerRow = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z1`,
      });

      if (!headerRow.data.values || headerRow.data.values.length === 0) {
        await this.setupHeaders(spreadsheetId, sheetName);
      }
    } catch (error: any) {
      if (error.code === 404) {
        throw new Error('Spreadsheet not found. Please create it first or check the spreadsheet ID.');
      }
      logger.error({ error }, 'Failed to ensure spreadsheet exists');
      throw error;
    }
  }

  /**
   * Setup headers in the spreadsheet
   */
  private async setupHeaders(spreadsheetId: string, sheetName: string): Promise<void> {
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Status',
      'Occupation',
      'Address',
      'Province',
      'Tag',
      'Has Given Gift',
      'Notes',
      'Created At',
      'Updated At',
    ];

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:M1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    });

    // Format header row (bold, background color)
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.9,
                    green: 0.9,
                    blue: 0.9,
                  },
                  textFormat: {
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      },
    });

    logger.info({ sheetName }, 'Setup headers in spreadsheet');
  }

  /**
   * Convert guest to row data
   */
  private guestToRow(guest: GuestResponse): any[] {
    return [
      guest.id,
      guest.name,
      guest.email || '',
      guest.phone || '',
      guest.status,
      guest.occupation || '',
      guest.address || '',
      guest.province || '',
      guest.tag || '',
      guest.hasGivenGift ? 'Yes' : 'No',
      guest.notes || '',
      guest.createdAt ? new Date(guest.createdAt).toLocaleString() : '',
      guest.updatedAt ? new Date(guest.updatedAt).toLocaleString() : '',
    ];
  }

  /**
   * Sync guests to Google Sheets (full sync - replaces all data)
   */
  async syncGuests(
    spreadsheetId: string,
    guests: GuestResponse[],
    sheetName: string = 'Guests'
  ): Promise<{ synced: number }> {
    try {
      // Ensure spreadsheet and headers exist
      await this.ensureSpreadsheetExists(spreadsheetId, sheetName);

      // Convert guests to rows
      const rows = guests.map((guest) => this.guestToRow(guest));

      // Clear existing data (except header)
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${sheetName}!A2:Z`,
      });

      // Insert new data
      if (rows.length > 0) {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A2`,
          valueInputOption: 'RAW',
          requestBody: {
            values: rows,
          },
        });
      }

      logger.info({ count: guests.length, sheetName }, 'Synced guests to Google Sheets');
      return { synced: guests.length };
    } catch (error) {
      logger.error({ error }, 'Failed to sync guests to Google Sheets');
      throw error;
    }
  }

  /**
   * Append a single guest to Google Sheets
   */
  async appendGuest(
    spreadsheetId: string,
    guest: GuestResponse,
    sheetName: string = 'Guests'
  ): Promise<void> {
    try {
      await this.ensureSpreadsheetExists(spreadsheetId, sheetName);

      const row = this.guestToRow(guest);

      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:M`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [row],
        },
      });

      logger.info({ guestId: guest.id, sheetName }, 'Appended guest to Google Sheets');
    } catch (error) {
      logger.error({ error, guestId: guest.id }, 'Failed to append guest to Google Sheets');
      throw error;
    }
  }

  /**
   * Update a guest in Google Sheets
   */
  async updateGuest(
    spreadsheetId: string,
    guest: GuestResponse,
    sheetName: string = 'Guests'
  ): Promise<void> {
    try {
      // Find the row with this guest ID
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:A`,
      });

      const ids = response.data.values || [];
      const rowIndex = ids.findIndex((row: any[]) => row[0] === guest.id);

      if (rowIndex === -1) {
        // Guest not found, append instead
        await this.appendGuest(spreadsheetId, guest, sheetName);
        return;
      }

      // Update the row (rowIndex + 1 because sheets are 1-indexed)
      const row = this.guestToRow(guest);
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex + 1}:M${rowIndex + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [row],
        },
      });

      logger.info({ guestId: guest.id, rowIndex, sheetName }, 'Updated guest in Google Sheets');
    } catch (error) {
      logger.error({ error, guestId: guest.id }, 'Failed to update guest in Google Sheets');
      throw error;
    }
  }

  /**
   * Delete a guest from Google Sheets
   */
  async deleteGuest(
    spreadsheetId: string,
    guestId: string,
    sheetName: string = 'Guests'
  ): Promise<void> {
    try {
      // Find the row with this guest ID
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:A`,
      });

      const ids = response.data.values || [];
      const rowIndex = ids.findIndex((row: any[]) => row[0] === guestId);

      if (rowIndex === -1) {
        logger.warn({ guestId, sheetName }, 'Guest not found in Google Sheets');
        return;
      }

      // Get sheet ID
      const spreadsheet = await this.sheets.spreadsheets.get({ spreadsheetId });
      const sheet = spreadsheet.data.sheets?.find(
        (s: any) => s.properties.title === sheetName
      );
      
      if (!sheet) {
        throw new Error(`Sheet ${sheetName} not found`);
      }

      // Delete the row
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheet.properties.sheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            },
          ],
        },
      });

      logger.info({ guestId, rowIndex, sheetName }, 'Deleted guest from Google Sheets');
    } catch (error) {
      logger.error({ error, guestId }, 'Failed to delete guest from Google Sheets');
      throw error;
    }
  }

  /**
   * Create a new spreadsheet for an event
   */
  async createSpreadsheet(eventTitle: string): Promise<string> {
    try {
      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `${eventTitle} - Guests`,
          },
          sheets: [
            {
              properties: {
                title: 'Guests',
              },
            },
          ],
        },
      });

      const spreadsheetId = response.data.spreadsheetId;
      logger.info({ spreadsheetId, eventTitle }, 'Created new spreadsheet');

      // Setup headers
      if (spreadsheetId) {
        await this.setupHeaders(spreadsheetId, 'Guests');
      }

      return spreadsheetId || '';
    } catch (error) {
      logger.error({ error, eventTitle }, 'Failed to create spreadsheet');
      throw error;
    }
  }

  /**
   * Get spreadsheet URL
   */
  getSpreadsheetUrl(spreadsheetId: string): string {
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  }
}

export const googleSheetsService = new GoogleSheetsService();

