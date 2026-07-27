import type { PrismaClient } from "@prisma/client";

export async function logAudit(
  prisma: PrismaClient,
  params: {
    userId?: string;
    userEmail?: string;
    action: string;
    module?: string;
    entity: string;
    entityId?: string;
    details?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userEmail: params.userEmail,
        action: params.action,
        module: params.module ?? "SYSTEM",
        entity: params.entity,
        entityId: params.entityId,
        details: params.details,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ipAddress: params.ipAddress,
      },
    });
  } catch {
    /* non-blocking */
  }
}
