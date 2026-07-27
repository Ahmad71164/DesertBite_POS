export const USER_ROLES = [
    "SUPER_ADMIN",
    "OWNER",
    "MANAGER",
    "CASHIER",
    "WAITER",
    "KITCHEN",
];
export function calculateOrderTotals(subtotal, discount, taxRate, serviceChargeRate) {
    const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
    const taxable = subtotal - safeDiscount;
    const tax = Math.round(taxable * taxRate * 100) / 100;
    const serviceCharge = Math.round(subtotal * serviceChargeRate * 100) / 100;
    const total = Math.round((taxable + tax + serviceCharge) * 100) / 100;
    return { subtotal, discount: safeDiscount, tax, serviceCharge, total };
}
