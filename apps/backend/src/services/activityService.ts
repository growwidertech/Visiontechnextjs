import { ActivityLog } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export async function logActivity(params: {
  req?: AuthenticatedRequest;
  userName?: string;
  userRole?: string;
  action: string;
  module: string;
  entityId?: string;
  entityTitle?: string;
  details?: string;
}): Promise<void> {
  try {
    await ActivityLog.create({
      userId: params.req?.user?.id,
      userName: params.req?.user?.name || params.userName || 'System',
      userRole: params.req?.user?.roleName || params.userRole || 'Administrator',
      action: params.action,
      module: params.module,
      entityId: params.entityId,
      entityTitle: params.entityTitle,
      details: params.details,
      ipAddress: params.req?.ip || '127.0.0.1',
    });
  } catch (err) {
    logger.warn({ err }, 'Failed to write activity log');
  }
}
