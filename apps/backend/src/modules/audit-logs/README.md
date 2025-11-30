# Audit Logs Module

This module provides comprehensive audit logging functionality to track all system activities and user actions.

## Features

- Automatic logging of user actions
- Track actions by user, resource, action type, and status
- Filter and search audit logs
- View detailed audit log information including metadata
- IP address and user agent tracking

## Usage

### Automatic Logging with Middleware

Use the `auditLog` middleware to automatically log actions:

```typescript
import { auditLog } from '@/common/middlewares/audit-log.middleware';

// In your router
router.post(
  '/users',
  authenticate,
  authorize('admin'),
  auditLog({
    action: 'create',
    resource: 'user',
    description: 'User created',
  }),
  asyncHandler(createUserHandler),
);
```

### Manual Logging

Use the `createAuditLog` helper function for manual logging:

```typescript
import { createAuditLog } from '@/common/middlewares/audit-log.middleware';

// In your controller
await createAuditLog(req, {
  action: 'update',
  resource: 'user',
  resourceId: userId,
  description: 'User profile updated',
  status: 'success',
  metadata: {
    fieldsChanged: ['name', 'avatar'],
  },
});
```

## API Endpoints

All endpoints require authentication and admin role.

- `GET /api/v1/audit-logs` - List audit logs with filters
- `GET /api/v1/audit-logs/:id` - Get specific audit log
- `GET /api/v1/audit-logs/user/:userId` - Get audit logs for a user
- `GET /api/v1/audit-logs/resource/:resource/:resourceId` - Get audit logs for a resource

## Query Parameters

- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 20)
- `userId` - Filter by user ID
- `userEmail` - Filter by user email
- `action` - Filter by action type
- `resource` - Filter by resource type
- `resourceId` - Filter by resource ID
- `status` - Filter by status (success, failure, pending)
- `startDate` - Filter by start date (ISO string)
- `endDate` - Filter by end date (ISO string)
- `search` - Search in description, user email, user name, or resource

## Action Types

- `create` - Resource created
- `update` - Resource updated
- `delete` - Resource deleted
- `login` - User login
- `logout` - User logout
- `view` - Resource viewed
- `export` - Data exported
- `import` - Data imported
- `approve` - Action approved
- `reject` - Action rejected
- `publish` - Resource published
- `unpublish` - Resource unpublished
- `payment` - Payment processed
- `subscription` - Subscription action
- `other` - Other actions

## Status Types

- `success` - Action completed successfully
- `failure` - Action failed
- `pending` - Action is pending

