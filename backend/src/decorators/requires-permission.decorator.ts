import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require specific permissions for an endpoint.
 * Usage: @RequiresPermission('finance:view') or @RequiresPermission('finance:view', 'finance:manage')
 */
export const RequiresPermission = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
