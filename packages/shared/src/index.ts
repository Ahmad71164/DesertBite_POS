export const USER_ROLES = [
  "SUPER_ADMIN",
  "OWNER",
  "MANAGER",
  "CASHIER",
  "WAITER",
  "KITCHEN",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type PaymentMethod = "CASH" | "CARD" | "JAZZCASH" | "EASYPAISA" | "BANK_TRANSFER";
export type OrderType = "DINE_IN" | "TAKE_AWAY" | "DELIVERY";
export type OrderStatus =
  | "NEW"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export interface DashboardSummary {
  todaySales: number;
  weeklySales: number;
  monthlySales: number;
  yearlySales: number;
  netProfit?: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  avgOrderValue: number;
  taxCollectedToday?: number;
  customerCount?: number;
  lowStockAlerts?: number;
  lowStockCount?: number;
  pendingPOsCount?: number;
  taxCollected?: number;
  recentTransactions?: any[];
  recentOrders?: any[];
  topSellingProducts?: any[];
  hourlyChart?: { hour: string; sales: number }[];
  categoryChart?: { name: string; value: number }[];
  branchChart?: { name: string; sales: number }[];
  staffChart?: { name: string; sales: number }[];
}

export interface RestaurantSettings {
  id: string;
  name: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  serviceChargeRate: number;
  parentBrand: string;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  total: number;
}

export function calculateOrderTotals(
  subtotal: number,
  discount: number,
  taxRate: number,
  serviceChargeRate: number
): OrderTotals {
  const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
  const taxable = subtotal - safeDiscount;
  const tax = Math.round(taxable * taxRate * 100) / 100;
  const serviceCharge = Math.round(subtotal * serviceChargeRate * 100) / 100;
  const total = Math.round((taxable + tax + serviceCharge) * 100) / 100;
  return { subtotal, discount: safeDiscount, tax, serviceCharge, total };
}
