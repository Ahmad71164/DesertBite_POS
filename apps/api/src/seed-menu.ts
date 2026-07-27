import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { DESERT_BITE_MENU } from "../prisma/menu-data";

export async function seedMenu(prisma: PrismaClient) {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();

  for (const category of DESERT_BITE_MENU) {
    await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        items: {
          create: category.items.map((item) => ({
            name: item.name,
            sellingPrice: item.sellingPrice,
            costPrice: item.costPrice ?? Math.round(item.sellingPrice * 0.6),
            preparationTime: item.preparationTime ?? 12,
            description: item.description,
            availability: true,
          })),
        },
      },
    });
  }

  const itemCount = await prisma.menuItem.count();
  console.log(`Menu seeded: ${DESERT_BITE_MENU.length} categories, ${itemCount} items`);
  return itemCount;
}

export async function bootstrapDatabase(prisma: PrismaClient) {
  if (!DESERT_BITE_MENU?.length) {
    throw new Error("Menu data failed to load. Check prisma/menu-data.ts");
  }

  const passwordHash = await bcrypt.hash("DesertBite@786", 10);

  await prisma.user.upsert({
    where: { email: "Admin" },
    update: { passwordHash, active: true },
    create: {
      name: "Admin",
      email: "Admin",
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@restaurant.local" },
    update: { passwordHash, active: true },
    create: {
      name: "Super Admin",
      email: "admin@restaurant.local",
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@desertbite.local" },
    update: { passwordHash, active: true },
    create: {
      name: "Admin",
      email: "admin@desertbite.local",
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  const branch = await prisma.branch.upsert({
    where: { code: "MAIN" },
    update: {},
    create: {
      name: "Desert Bite Layyah (Main)",
      code: "MAIN",
      address: "Akbar Plaza, Layyah Road Chowk Azam, Layyah",
      phone: "+923026440357",
      city: "Layyah",
      isHeadOffice: true,
      isActive: true,
    },
  });

  await prisma.user.updateMany({
    where: { branchId: null },
    data: { branchId: branch.id },
  });

  if (!("restaurantSettings" in prisma)) {
    console.warn("Prisma client missing RestaurantSettings — run: npm run db:push");
    return;
  }
  await prisma.restaurantSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Desert Bite PIZZA KITCHEN",
      tagline: "Dine & Take Away",
      address: "Akbar Plaza, Layyah Road Chowk Azam, Layyah",
      phone: "+923026440357",
      whatsapp: "+923026440357",
      currency: "PKR",
      currencySymbol: "Rs.",
      taxRate: 0.05,
      serviceChargeRate: 0,
      parentBrand: "GHOSIA Juice",
    },
  });

  const categoryCount = await prisma.category.count();
  if (categoryCount === 0) {
    await seedMenu(prisma);
  }

  const tableCount = await prisma.diningTable.count();
  if (tableCount === 0) {
    for (let i = 1; i <= 12; i++) {
      await prisma.diningTable.create({
        data: { name: `Table ${i}`, capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6 },
      });
    }
  }

  const inventory = [
    { name: "Chicken Fillet", stockLevel: 100, unit: "pcs", lowStockLevel: 20 },
    { name: "Burger Buns", stockLevel: 200, unit: "pcs", lowStockLevel: 40 },
    { name: "Pizza Dough", stockLevel: 80, unit: "pcs", lowStockLevel: 15 },
    { name: "Cheese", stockLevel: 50, unit: "kg", lowStockLevel: 10 },
    { name: "Soft Drinks", stockLevel: 120, unit: "bottles", lowStockLevel: 25 },
  ];

  for (const item of inventory) {
    const existing = await prisma.inventoryItem.findFirst({ where: { name: item.name } });
    if (!existing) await prisma.inventoryItem.create({ data: item });
  }
}
