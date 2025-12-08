# Enhanced Invitation Card Feature

## Overview

The invitation card feature allows event hosts to create beautiful, customizable invitation cards for their guests with QR codes for easy RSVP access. The feature includes luxury templates, image uploads, and personalized messaging.

## Features

### 1. **Luxury Card Templates**

Five professional templates to choose from:
- **Elegant Gold**: Classic design with gold accents on a light background
- **Modern Minimal**: Contemporary gradient design (purple/violet)
- **Romantic Rose**: Soft pink theme perfect for weddings
- **Luxury Black**: Sophisticated dark theme with gold accents
- **Botanical Green**: Fresh, natural green gradient

### 2. **Image Uploads**

Three types of images can be uploaded:
- **Background Image**: Custom background for the entire card
- **Profile/Couple Photo**: Circular photo displayed prominently on the card
- **Logo/Monogram**: Small logo or monogram at the top of the card

All images are converted to base64 and embedded directly in the card for offline compatibility.

### 3. **Customizable Text**

Three customizable text fields:
- **Greeting Text**: Main invitation greeting (e.g., "You Are Cordially Invited")
- **Message**: Personal message to guests (e.g., "Join us for a celebration")
- **Footer Text**: Closing message (e.g., "We look forward to your presence")

### 4. **Advanced Customization**

- **Custom Background Color**: Override template colors with your own
- **Font Families**: Each template has its own font style (serif, sans-serif, cursive)

### 5. **Download & Share**

- **Individual Downloads**: Download cards one by one
- **Bulk Downloads**: Select multiple guests and download all their cards at once
- **Copy Invite Link**: Quick copy of the invite URL to clipboard
- **Email Sharing**: Direct email integration for sending invites

## How to Use

### Step 1: Access the Feature

1. Go to your event dashboard
2. Navigate to the **"Guests"** tab
3. Click the **"ធៀបអញ្ជើញ"** (Invitation Cards) button in the toolbar

### Step 2: Design Your Card

1. **Choose a Template**:
   - Click on one of the five template options
   - Preview updates in real-time

2. **Upload Images** (Optional):
   - Click the upload button for Background, Profile, or Logo
   - Select an image from your device
   - Remove images by clicking the X button

3. **Customize Text**:
   - Edit the greeting, message, and footer text
   - Text updates appear immediately in the preview

4. **Advanced Settings** (Optional):
   - Choose a custom background color
   - Color picker provides full RGB control

### Step 3: Select Guests

1. Switch to the **"Select Guests"** tab
2. Use checkboxes to select guests for card generation
3. Quick actions:
   - "Select All" - selects all guests with invite tokens
   - "Deselect All" - clears selection

### Step 4: Download or Share

**For Individual Cards**:
- Click "Download" button under each card preview
- Card is saved as PNG image with the guest's name

**For Bulk Download**:
- Select multiple guests
- Click "Download All Selected" at the top
- Cards are downloaded one by one with a small delay

**Other Actions**:
- Copy invite link for manual sharing
- Email directly to guest (if email is available)

## Technical Implementation

### Components

**InviteCardDialog.tsx**
- Main dialog component with tabs for design and guest selection
- Uses html2canvas for high-quality card rendering
- Handles image uploads via FileReader API
- Manages card customization state

**Integration in Guests.tsx**
- Button added to guest list toolbar
- Fetches event data for card generation
- Converts display guests to raw guest format

### Technologies Used

- **html2canvas**: Converts DOM elements to downloadable images
- **qrcode.react**: Generates QR codes for invite links
- **React Hooks**: State management and memoization
- **TypeScript**: Type-safe props and state

### Data Flow

1. Event data fetched via `useEvent` hook
2. Guest list passed from parent component
3. Customization stored in local component state
4. Cards rendered using DOM with inline styles
5. html2canvas captures rendered cards
6. Converted to PNG blobs for download

## Card Structure

Each invitation card contains:

```
┌─────────────────────────┐
│  Logo (optional)        │
│                         │
│  Greeting Text          │
│  Event Title            │
│  Profile Image (opt.)   │
│  "Dear [Guest Name]"    │
│                         │
│  Message Text           │
│  Event Date             │
│  Event Venue            │
│                         │
│  QR Code                │
│  "Scan QR code to RSVP" │
│                         │
│  Footer Text            │
└─────────────────────────┘
```

## Requirements

### For Invitation Cards to Work:

1. **Event must exist** with basic details (title, date, venue)
2. **Guests must have invite tokens** generated
3. **Browser must support**:
   - FileReader API (for image uploads)
   - Canvas API (for rendering)
   - Blob URLs (for downloads)

### Invite Token Generation:

Guests need invite tokens before they can receive invitation cards. Tokens are generated when:
- Creating a new guest
- Using the "Share" action in the guest list
- Regenerating tokens via guest management

## Best Practices

### Image Recommendations:

- **Background**: 600x800px or larger, landscape or portrait
- **Profile**: Square images (1:1 ratio), at least 300x300px
- **Logo**: Transparent PNG recommended, max height 100px

### Text Guidelines:

- Keep greeting text concise (under 40 characters)
- Message text: 2-3 lines maximum
- Footer text: Single line recommendation

### Performance Tips:

- For bulk downloads, limit to 20-30 guests at a time
- Use compressed images when possible
- Test card design with one guest before bulk download

## Future Enhancements

Potential improvements for future versions:

1. **More Templates**: Additional design themes
2. **Font Selection**: Custom font picker
3. **Animation Effects**: Subtle animations in preview
4. **Template Gallery**: Community-shared templates
5. **Print Layout**: Optimized print-ready versions
6. **Multi-language Support**: Template text in multiple languages
7. **Event Branding**: Save/load custom brand presets
8. **Social Sharing**: Direct share to social media platforms

## Troubleshooting

**Cards not downloading?**
- Check browser permissions for downloads
- Ensure pop-up blocker is disabled
- Try downloading one card first

**Images not appearing?**
- Verify image format (JPEG, PNG, GIF, WebP supported)
- Check image file size (< 5MB recommended)
- Ensure stable internet connection

**QR codes not working?**
- Verify guest has valid invite token
- Check event has published status
- Test QR code with mobile device

**Preview not updating?**
- Refresh the page
- Close and reopen the dialog
- Check browser console for errors

## Support

For issues or questions about the invitation card feature:
1. Check this documentation first
2. Review browser console for error messages
3. Contact development team with:
   - Browser version
   - Screenshot of issue
   - Steps to reproduce

---

**Version**: 1.0.0  
**Last Updated**: December 8, 2025  
**Author**: Development Team

