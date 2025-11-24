# Image Setup Guide for Login Page

## Current Setup
The login page currently uses a sample wedding image from **Unsplash** as a placeholder.

## Option 1: Use Your Own Image (Recommended)

### Steps:
1. **Find a wedding image** from these free sources:
   - **Unsplash**: https://unsplash.com/s/photos/wedding-invitation
   - **Pexels**: https://www.pexels.com/search/wedding/
   - **Pixabay**: https://pixabay.com/images/search/wedding/

2. **Download the image** (recommended size: 1920x1080 or larger)

3. **Add to your project**:
   ```bash
   # Place the image in the public folder
   public/login-bg.jpg
   ```

4. **Update the login page** (`src/app/(auth)/login/page.tsx`):
   ```tsx
   style={{
     backgroundImage: `url('/login-bg.jpg')`
   }}
   ```

## Option 2: Use Unsplash Directly (Current)

The current setup uses Unsplash's CDN. You can change the image by updating the URL:

```tsx
// Current image
backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop')`

// Find other wedding images on Unsplash and replace the photo ID
```

### Popular Wedding Image URLs from Unsplash:
- Elegant wedding: `https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop`
- Wedding rings: `https://images.unsplash.com/photo-1606800053560-5a1b5c8b0b5e?q=80&w=2000&auto=format&fit=crop`
- Wedding ceremony: `https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2000&auto=format&fit=crop`
- Wedding invitation: `https://images.unsplash.com/photo-1511988617509-a57c8a288659?q=80&w=2000&auto=format&fit=crop`

## Option 3: Use Local Image from Public Folder

1. **Add image to `/public/` folder**:
   ```
   public/
     └── login-background.jpg
   ```

2. **Update the code**:
   ```tsx
   <div 
     className="absolute inset-0 bg-cover bg-center bg-no-repeat"
     style={{
       backgroundImage: `url('/login-background.jpg')`
     }}
   >
   ```

## Image Recommendations

### Best Practices:
- **Aspect Ratio**: 16:9 or 3:2 (landscape)
- **Resolution**: At least 1920x1080px
- **File Size**: Under 500KB (optimize with tools like TinyPNG)
- **Content**: Wedding-related, elegant, not too busy
- **Colors**: Should complement your white/black/gray theme

### Free Image Sources:
1. **Unsplash** - https://unsplash.com (Free, high quality)
2. **Pexels** - https://www.pexels.com (Free, good selection)
3. **Pixabay** - https://pixabay.com (Free, large collection)
4. **Freepik** - https://www.freepik.com (Free with attribution)

## Current Implementation

The login page uses:
- **Image**: Unsplash wedding photo
- **Overlay**: Dark overlay (40% opacity) for text readability
- **Text**: White text with drop shadows for contrast

## Quick Change

To quickly change the image, edit line ~115 in `src/app/(auth)/login/page.tsx`:

```tsx
backgroundImage: `url('YOUR_IMAGE_URL_HERE')`
```

Replace with:
- Your local image: `url('/your-image.jpg')`
- Unsplash URL: `url('https://images.unsplash.com/photo-...')`
- Any other image URL

---

**Note**: All images from Unsplash, Pexels, and Pixabay are free to use for commercial projects.

