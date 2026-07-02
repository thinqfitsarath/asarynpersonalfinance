import prisma from '@/lib/prisma';
import { getRequestMetadata } from './request';

/**
 * Creates an audit log entry
 */
export async function createAuditLog(
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: any,
  request?: Request,
  familyId?: string
) {
  const { ipAddress, userAgent } = request ? getRequestMetadata(request) : { ipAddress: null, userAgent: null };

  await prisma.auditLog.create({
    data: {
      userId,
      familyId: familyId || null,
      action,
      entityType: entityType || null,
      entityId: entityId || null,
      ipAddress,
      userAgent,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}
