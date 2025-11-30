import type { Request, Response, NextFunction } from 'express';
import { auditLogService } from '@/modules/audit-logs';
import { userService } from '@/modules/users/user.service';
import type { AuditLogAction, AuditLogStatus } from '@/modules/audit-logs/audit-log.model';

export interface AuditLogOptions {
  action: AuditLogAction;
  resource: string;
  resourceId?: string;
  description: string;
  skipSuccess?: boolean; // Skip logging if status is success
  skipFailure?: boolean; // Skip logging if status is failure
  getMetadata?: (req: Request, res: Response) => Record<string, any>;
}

/**
 * Middleware to automatically log actions to audit log
 * Usage: auditLog({ action: 'create', resource: 'user', description: 'User created' })
 */
export const auditLog = (options: AuditLogOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override res.json to capture response
    res.json = function (body: any) {
      // Determine status based on response
      const status: AuditLogStatus = res.statusCode >= 200 && res.statusCode < 300
        ? 'success'
        : res.statusCode >= 400
        ? 'failure'
        : 'pending';

      // Skip logging based on options
      if (status === 'success' && options.skipSuccess) {
        return originalJson(body);
      }
      if (status === 'failure' && options.skipFailure) {
        return originalJson(body);
      }

      // Get user info from request
      const userId = req.user?.id;
      const userEmail = req.user?.email;

      // Get resource ID from params, body, or options
      let resourceId = options.resourceId;
      if (!resourceId) {
        resourceId = req.params.id || req.params.resourceId || req.body?.id;
      }

      // Get IP address
      const ipAddress = 
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        (req.headers['x-real-ip'] as string) ||
        req.socket.remoteAddress ||
        'unknown';

      // Get user agent
      const userAgent = req.headers['user-agent'] || 'unknown';

      // Get metadata
      const metadata = options.getMetadata
        ? options.getMetadata(req, res)
        : {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            ...(req.body && Object.keys(req.body).length > 0 ? { requestBody: req.body } : {}),
          };

      // Log asynchronously (don't wait for it)
      // Fetch user name asynchronously if needed
      (async () => {
        let userName: string | undefined;
        if (userId) {
          try {
            const user = await userService.findById(userId);
            userName = user?.name;
          } catch {
            // Silently fail - userName will remain undefined
          }
        }

        auditLogService
          .create({
            userId,
            userEmail,
            userName,
            action: options.action,
            resource: options.resource,
            resourceId,
            description: options.description,
            ipAddress,
            userAgent,
            status,
            metadata,
          })
          .catch((error) => {
            // Log error but don't fail the request
            console.error('Failed to create audit log:', error);
          });
      })();

      return originalJson(body);
    };

    next();
  };
};

/**
 * Helper function to manually create audit logs
 */
export const createAuditLog = async (
  req: Request,
  options: {
    action: AuditLogAction;
    resource: string;
    resourceId?: string;
    description: string;
    status?: AuditLogStatus;
    metadata?: Record<string, any>;
  },
) => {
  const userId = req.user?.id;
  const userEmail = req.user?.email;
  // Fetch user name if userId is available
  let userName: string | undefined;
  if (userId) {
    try {
      const user = await userService.findById(userId);
      userName = user?.name;
    } catch {
      // Silently fail - userName will remain undefined
    }
  }

  const ipAddress =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown';

  const userAgent = req.headers['user-agent'] || 'unknown';

  return auditLogService.create({
    userId,
    userEmail,
    userName,
    action: options.action,
    resource: options.resource,
    resourceId: options.resourceId,
    description: options.description,
    ipAddress,
    userAgent,
    status: options.status || 'success',
    metadata: options.metadata,
  });
};

