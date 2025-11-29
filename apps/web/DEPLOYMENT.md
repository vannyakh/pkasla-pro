# Next.js Production Deployment Guide

This guide covers deploying the Next.js application to a production server.

## Prerequisites

- Node.js 18+ installed on the server
- Environment variables configured
- Backend API running and accessible

## Build Configuration

The application is configured with `output: "standalone"` which creates a minimal server bundle that includes only the necessary files.

## Deployment Steps

### 1. Environment Variables

Create a `.env.production` file (or set environment variables on your server) with the following:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=https://your-domain.com

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

### 2. Build the Application

From the project root or web directory:

```bash
# Install dependencies (if not already done)
pnpm install

# Build the application
pnpm --filter @repo/web build
```

Or from the web directory:

```bash
cd apps/web
pnpm install
pnpm build
```

### 3. Deploy Options

#### Option A: Using Standalone Output (Recommended for Server Deployment)

The standalone output creates a minimal server that can run independently:

```bash
# After build, the standalone server is in .next/standalone/
# Copy the necessary files to your server
cp -r .next/standalone ./deploy
cp -r .next/static ./deploy/.next/static
cp -r public ./deploy/public

# On your server, run:
cd deploy
NODE_ENV=production node server.js
```

#### Option B: Using Next.js Start Command

```bash
# On your server
cd apps/web
NODE_ENV=production pnpm start
```

This will start the server on port 3000 by default. You can change the port:

```bash
PORT=3000 NODE_ENV=production pnpm start
```

### 4. Process Management

For production, use a process manager like PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start .next/standalone/server.js --name "nextjs-app" --env production

# Or with Next.js start
pm2 start npm --name "nextjs-app" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### 5. Reverse Proxy (Nginx Example)

Configure Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. SSL/HTTPS Setup

Use Let's Encrypt with Certbot:

```bash
sudo certbot --nginx -d your-domain.com
```

## Server Requirements

- **Node.js**: 18.x or higher
- **Memory**: Minimum 512MB, recommended 1GB+
- **Disk Space**: At least 500MB for the application and dependencies

## Troubleshooting

### Build Errors

- Ensure all environment variables are set
- Check that TypeScript errors are resolved (or `ignoreBuildErrors` is enabled)
- Verify all dependencies are installed

### Runtime Errors

- Check environment variables are loaded correctly
- Verify the backend API is accessible from the server
- Check server logs for detailed error messages

### Performance

- Enable compression (already configured in `next.config.ts`)
- Use a CDN for static assets
- Configure caching headers appropriately
- Monitor server resources

## Environment-Specific Notes

### Development
- Uses `http://localhost:4000/api/v1` for API
- Runs on `http://localhost:3000`
- Hot reload enabled

### Production
- Uses production API URL
- Runs on configured domain
- Optimized builds with compression
- Image optimization enabled

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Standalone Output](https://nextjs.org/docs/pages/api-reference/next-config-js/output#standalone)
- [Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

