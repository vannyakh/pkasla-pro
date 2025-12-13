# Rate Limiting Implementation

This document explains the rate limiting implementation in the backend API.

## Overview

Rate limiting has been implemented to protect the API from abuse and ensure fair usage across all users. The implementation uses the `express-rate-limit` package with custom configurations for different types of endpoints.

## Rate Limiters

### 1. General Rate Limiter
Applied to all `/api/v1/*` routes by default.

**Default Configuration:**
- Window: 15 minutes
- Max Requests: 100 per window per IP/user
- Key: IP address (or user ID if authenticated)

**Applied to:** All API routes unless overridden by a more specific rate limiter

### 2. Authentication Rate Limiter
Applied to authentication-related endpoints (login, register, 2FA).

**Default Configuration:**
- Window: 15 minutes
- Max Requests: 5 per window per IP
- Key: IP address only (not user-based since users aren't authenticated yet)

**Applied to:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/login/oauth`
- `POST /api/v1/auth/login/verify-2fa`

### 3. Upload Rate Limiter
Applied to file upload endpoints.

**Default Configuration:**
- Window: 15 minutes
- Max Requests: 20 per window per IP/user
- Key: IP address (or user ID if authenticated)

**Applied to:**
- `POST /api/v1/upload/single`
- `POST /api/v1/upload/avatar`
- `POST /api/v1/upload/multiple`

### 4. Webhook Rate Limiter
Applied to payment webhook endpoints.

**Default Configuration:**
- Window: 1 minute
- Max Requests: 100 per window per IP
- Key: IP address

**Applied to:**
- `POST /api/v1/payments/webhook/stripe`
- `POST /api/v1/payments/webhook/bakong`

## Configuration

Rate limiting can be configured via environment variables. Add these to your `.env` file:

```bash
# General API rate limit
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes in milliseconds
RATE_LIMIT_MAX=100                    # Maximum requests per window

# Authentication rate limit
RATE_LIMIT_AUTH_WINDOW_MS=900000     # 15 minutes in milliseconds
RATE_LIMIT_AUTH_MAX=5                # Maximum auth attempts per window

# Upload rate limit
RATE_LIMIT_UPLOAD_WINDOW_MS=900000   # 15 minutes in milliseconds
RATE_LIMIT_UPLOAD_MAX=20             # Maximum uploads per window

# Webhook rate limit
RATE_LIMIT_WEBHOOK_WINDOW_MS=60000   # 1 minute in milliseconds
RATE_LIMIT_WEBHOOK_MAX=100           # Maximum webhook requests per window
```

## Response Headers

When a request is rate-limited, the following headers are included in the response:

- `RateLimit-Limit`: Maximum number of requests allowed in the window
- `RateLimit-Remaining`: Number of requests remaining in the current window
- `RateLimit-Reset`: Time when the rate limit window resets (Unix timestamp)

## Rate Limit Exceeded Response

When a rate limit is exceeded, the API responds with:

**Status Code:** `429 Too Many Requests`

**Response Body:**
```json
{
  "success": false,
  "message": "Too many requests, please try again later.",
  "retryAfter": "2024-12-13T10:30:00.000Z"
}
```

## Key Generation Strategy

The rate limiter uses intelligent key generation:

1. **Authenticated Requests:** Uses `user:{userId}` as the key
2. **Unauthenticated Requests:** Uses `ip:{ipAddress}` as the key
3. **Auth Routes:** Always uses IP address (since users aren't authenticated yet)
4. **Webhook Routes:** Always uses IP address

The IP address is extracted from:
- `req.ip` (Express default)
- `X-Forwarded-For` header (for proxied requests)
- `X-Real-IP` header
- `req.socket.remoteAddress` (fallback)

## Skipping Rate Limits

Rate limits are automatically skipped for:

1. **Test Environment:** All rate limits are disabled when `NODE_ENV=test`
2. **Health Check Endpoints:** `/health` and `/api/v1/health` are not rate-limited

### Optional: Skip for Admin Users

You can uncomment the following code in `rate-limit.ts` to skip rate limits for admin users:

```typescript
if (req.user?.role === 'admin') {
  return true;
}
```

## Custom Rate Limiters

You can create custom rate limiters using the `createRateLimiter` function:

```typescript
import { createRateLimiter } from '@/common/middlewares/rate-limit';

const customRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Custom rate limit message',
  skipAuthenticated: false, // Don't skip for authenticated users
});

// Apply to a route
router.post('/custom-endpoint', customRateLimiter, handler);
```

## Monitoring

Rate limit events are logged using the application logger:

```typescript
logger.warn({
  key: 'ip:192.168.1.1',
  path: '/api/v1/auth/login',
  method: 'POST',
}, 'Rate limit exceeded');
```

## Production Recommendations

For production environments:

1. **Use Redis Store:** Consider using `rate-limit-redis` for distributed rate limiting across multiple server instances:
   ```typescript
   import RedisStore from 'rate-limit-redis';
   import { createClient } from 'redis';

   const client = createClient({ url: env.redis.url });
   
   const store = new RedisStore({
     client,
     prefix: 'rate-limit:',
   });
   ```

2. **Adjust Limits:** Monitor your API usage and adjust rate limits accordingly:
   - Increase limits for trusted/premium users
   - Decrease limits during high-load periods
   - Use stricter limits for sensitive operations

3. **CDN/Proxy:** If using a CDN or reverse proxy (Cloudflare, nginx), ensure the `trust proxy` setting is correct in `app.ts`

4. **Monitoring:** Set up alerts for frequent rate limit violations to detect potential abuse or misconfigured clients

## Files Modified

- `src/common/middlewares/rate-limit.ts` - Main rate limiting middleware
- `src/config/environment.ts` - Environment configuration with rate limit options
- `src/app.ts` - Applied general rate limiter to all API routes
- `src/modules/auth/auth.router.ts` - Applied auth rate limiter to authentication routes
- `src/modules/upload/upload.router.ts` - Applied upload rate limiter to file upload routes
- `src/modules/payments/payment.router.ts` - Applied webhook rate limiter to webhook routes

## Testing

Rate limiting is automatically disabled in test environments (`NODE_ENV=test`), so your tests won't be affected.

To test rate limiting manually:

1. Set `NODE_ENV=development`
2. Make multiple requests to a rate-limited endpoint
3. Observe the `429` response after exceeding the limit
4. Wait for the window to reset and try again

Example using curl:
```bash
# Make 6 requests to login endpoint (limit is 5)
for i in {1..6}; do
  curl -X POST http://localhost:4000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password"}'
  echo "\n---"
done
```

The 6th request should return a `429` error.

