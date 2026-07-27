import type { PrismaClient, MembershipTier } from "@prisma/client";

export type CustomerInput = {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  area?: string;
  notes?: string;
  marketingConsent?: boolean;
};

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "").replace(/^0/, "+92").replace(/^92/, "+92");
}

function tierForSpending(total: number): MembershipTier {
  if (total >= 100_000) return "PLATINUM";
  if (total >= 50_000) return "GOLD";
  if (total >= 20_000) return "SILVER";
  return "BRONZE";
}

export async function upsertCustomerFromOrder(prisma: PrismaClient, input: CustomerInput, orderTotal: number) {
  const rawPhone = input.phone || "0000000000";
  const phone = normalizePhone(rawPhone);
  const name = (input.name || `Customer ${rawPhone}`).trim() || "Customer";
  const existing = await prisma.customer.findFirst({
    where: {
      OR: [
        { phone },
        { phone: rawPhone },
        { phone: rawPhone.replace(/\s+/g, "") },
      ],
      deletedAt: null,
    },
  });

  const branch = await prisma.branch.findFirst({ where: { isHeadOffice: true } });

  if (existing) {
    const totalSpending = (existing.totalSpending || 0) + orderTotal;
    const loyaltyPoints = (existing.loyaltyPoints || 0) + Math.floor(orderTotal / 100);
    return prisma.customer.update({
      where: { id: existing.id },
      data: {
        name: name !== "Customer" ? name : existing.name,
        email: input.email?.trim() || existing.email,
        address: input.address?.trim() || existing.address,
        city: input.city?.trim() || existing.city,
        area: input.area?.trim() || existing.area,
        notes: input.notes?.trim() || existing.notes,
        marketingConsent: input.marketingConsent ?? existing.marketingConsent,
        totalSpending,
        loyaltyPoints,
        visitCount: (existing.visitCount || 0) + 1,
        lastVisitAt: new Date(),
        membershipTier: tierForSpending(totalSpending),
        branchId: existing.branchId ?? branch?.id,
      },
    });
  }

  return prisma.customer.create({
    data: {
      name,
      phone,
      email: input.email?.trim() || null,
      address: input.address?.trim() || null,
      city: input.city?.trim() || null,
      area: input.area?.trim() || null,
      notes: input.notes?.trim() || null,
      marketingConsent: input.marketingConsent ?? false,
      totalSpending: orderTotal,
      loyaltyPoints: Math.floor(orderTotal / 100),
      visitCount: 1,
      lastVisitAt: new Date(),
      membershipTier: tierForSpending(orderTotal),
      branchId: branch?.id,
    },
  });
}

export async function searchCustomers(prisma: PrismaClient, query: string, limit = 20) {
  const q = query.trim();
  if (!q) {
    return prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { lastVisitAt: "desc" },
      take: limit,
    });
  }
  return prisma.customer.findMany({
    where: {
      deletedAt: null,
      OR: [
        { phone: { contains: q } },
        { name: { contains: q } },
        { email: { contains: q } },
      ],
    },
    orderBy: { lastVisitAt: "desc" },
    take: limit,
  });
}
