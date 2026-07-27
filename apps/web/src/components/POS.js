import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { calculateOrderTotals } from "@restaurant-pro/shared";
import { api, authHeaders, checkApiHealth, formatRs, repairDatabase as repairDbApi } from "../lib/api";
import { ReceiptModal } from "./ReceiptModal";
function Icon({ d, size = 16 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: d }) }));
}
const CATEGORY_ICONS = {
    all: "🌟",
    pizzas: "🍕",
    pizza: "🍕",
    burgers: "🍔",
    burger: "🍔",
    beverages: "🥤",
    drinks: "🥤",
    desserts: "🍨",
    sides: "🍟",
    starters: "🥗",
    deals: "📦",
    combos: "🎁",
};
function getCategoryEmoji(name) {
    const lower = name.toLowerCase();
    for (const [key, emoji] of Object.entries(CATEGORY_ICONS)) {
        if (lower.includes(key))
            return emoji;
    }
    return "🍽️";
}
const PAYMENT_METHODS = [
    { value: "CASH", label: "Cash", icon: "💵" },
    { value: "CARD", label: "Card", icon: "💳" },
    { value: "JAZZCASH", label: "JazzCash", icon: "📱" },
    { value: "EASYPAISA", label: "Easypaisa", icon: "📱" },
    { value: "BANK_TRANSFER", label: "Bank", icon: "🏦" },
];
const ORDER_TYPES = [
    { value: "DINE_IN", label: "Dine In", icon: "🍽️" },
    { value: "TAKE_AWAY", label: "Take Away", icon: "🛍️" },
    { value: "DELIVERY", label: "Delivery", icon: "🚚" },
];
export function POS({ token }) {
    const queryClient = useQueryClient();
    const [cart, setCart] = useState([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [search, setSearch] = useState("");
    const [orderType, setOrderType] = useState("DINE_IN");
    const [discountPercent, setDiscountPercent] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [usePercentDiscount, setUsePercentDiscount] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [orderNotes, setOrderNotes] = useState("");
    const [checkoutMsg, setCheckoutMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [lastOrderId, setLastOrderId] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [activeNoteItemId, setActiveNoteItemId] = useState(null);
    // Customer Phone Lookup State
    const [custInput, setCustInput] = useState("");
    const [selectedCust, setSelectedCust] = useState(null);
    const [showCustDropdown, setShowCustDropdown] = useState(false);
    const [viewHistoryCustId, setViewHistoryCustId] = useState(null);
    const headers = authHeaders(token);
    const { data: health } = useQuery({
        queryKey: ["api-health"],
        queryFn: checkApiHealth,
        refetchInterval: 5000,
    });
    const { data: menu = [], isLoading: menuLoading, isError: menuError, refetch: refetchMenu, } = useQuery({
        queryKey: ["menu"],
        queryFn: async () => {
            await checkApiHealth();
            return (await api.get("/menu", { headers })).data;
        },
        retry: 2,
        staleTime: 60_000,
        enabled: !!health?.ok,
    });
    const { data: settings } = useQuery({
        queryKey: ["settings"],
        queryFn: async () => (await api.get("/settings", { headers })).data,
    });
    // Query customers for phone lookup
    const { data: matchedCustomers = [] } = useQuery({
        queryKey: ["customer-search", custInput],
        queryFn: async () => {
            if (!custInput || custInput.length < 2)
                return [];
            return (await api.get(`/customers?search=${encodeURIComponent(custInput)}`, { headers })).data;
        },
        enabled: custInput.length >= 2 && !selectedCust,
    });
    // Query single customer full history
    const { data: custHistory } = useQuery({
        queryKey: ["customer-history", viewHistoryCustId],
        queryFn: async () => {
            if (!viewHistoryCustId)
                return null;
            return (await api.get(`/customers/${viewHistoryCustId}`, { headers })).data;
        },
        enabled: !!viewHistoryCustId,
    });
    const symbol = settings?.currencySymbol ?? "Rs.";
    const taxRate = settings?.taxRate ?? 0.05;
    const serviceRate = settings?.serviceChargeRate ?? 0;
    const subtotal = cart.reduce((sum, x) => sum + x.price * x.qty, 0);
    const discount = usePercentDiscount
        ? Math.round(subtotal * (discountPercent / 100) * 100) / 100
        : Math.min(discountAmount, subtotal);
    const totals = calculateOrderTotals(subtotal, discount, taxRate, serviceRate);
    const totalItems = menu.reduce((s, c) => s + c.items.length, 0);
    const cartItemCount = cart.reduce((s, x) => s + x.qty, 0);
    const filteredItems = useMemo(() => {
        const all = menu.flatMap((c) => c.items.filter((i) => i.availability).map((i) => ({ ...i, categoryId: c.id, categoryName: c.name })));
        return all.filter((item) => {
            const matchCategory = activeCategory === "all" || item.categoryId === activeCategory;
            const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
            return matchCategory && matchSearch;
        });
    }, [menu, activeCategory, search]);
    const addToCart = (item) => {
        setCart((prev) => {
            const found = prev.find((x) => x.id === item.id);
            if (found)
                return prev.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x));
            return [...prev, { id: item.id, name: item.name, price: item.sellingPrice, qty: 1 }];
        });
    };
    const updateItemNote = (id, note) => {
        setCart((prev) => prev.map((x) => (x.id === id ? { ...x, note } : x)));
    };
    const clearCart = () => {
        setCart([]);
        setDiscountAmount(0);
        setDiscountPercent(0);
        setOrderNotes("");
        setCheckoutMsg("");
        setLastOrderId(null);
        setSelectedCust(null);
        setCustInput("");
    };
    const selectCustomer = (c) => {
        setSelectedCust(c);
        setCustInput(`${c.name} (${c.phone})`);
        setShowCustDropdown(false);
    };
    const repairDatabase = async () => {
        setCheckoutMsg("Repairing database...");
        try {
            const data = await repairDbApi();
            await refetchMenu();
            setCheckoutMsg(`Database ready: ${data.items} menu items`);
        }
        catch (e) {
            setCheckoutMsg(String(e.message ?? "Repair failed. Run: npm run dev:api"));
        }
    };
    const apiOffline = !health?.ok;
    const checkout = async () => {
        if (cart.length === 0)
            return;
        setLoading(true);
        setCheckoutMsg("");
        try {
            const trimmedInput = custInput.trim();
            const hasDigits = /\d{4,}/.test(trimmedInput);
            const custPhoneToSend = selectedCust ? selectedCust.phone : (hasDigits ? trimmedInput : undefined);
            const custNameToSend = selectedCust ? selectedCust.name : (trimmedInput || undefined);
            const { data } = await api.post("/orders", {
                orderType,
                paymentMethod,
                customerId: selectedCust?.id,
                customerPhone: custPhoneToSend,
                customerName: custNameToSend,
                notes: orderNotes || undefined,
                discountPercent: usePercentDiscount ? discountPercent : undefined,
                discount: usePercentDiscount ? 0 : discountAmount,
                items: cart.map((line) => ({
                    itemId: line.id,
                    quantity: line.qty,
                    note: line.note,
                })),
            }, { headers });
            setLastOrderId(data.id);
            setShowReceipt(true);
            setCheckoutMsg(`Order ${data.invoiceNo} placed — Total ${formatRs(data.total, symbol)}`);
            setCart([]);
            setOrderNotes("");
            setDiscountAmount(0);
            setDiscountPercent(0);
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["kds"] });
            queryClient.invalidateQueries({ queryKey: ["customers"] });
        }
        catch (err) {
            const msg = err?.response?.data?.message;
            setCheckoutMsg(msg ?? "Checkout failed. Ensure API server is running.");
        }
        finally {
            setLoading(false);
        }
    };
    const printReceipt = () => {
        if (lastOrderId)
            setShowReceipt(true);
    };
    return (_jsxs(_Fragment, { children: [_jsxs("section", { className: "pos-layout", children: [_jsxs("aside", { className: "pos-left", children: [_jsx("div", { className: "pos-left-title", children: _jsxs("span", { children: ["Categories (", menu.length, ")"] }) }), _jsx("div", { className: "pos-search", children: _jsx("input", { placeholder: "Search category or item...", value: search, onChange: (e) => setSearch(e.target.value) }) }), _jsxs("div", { className: "pos-cat-list", children: [_jsxs("button", { className: `pos-cat-btn ${activeCategory === "all" ? "active" : ""}`, onClick: () => setActiveCategory("all"), children: [_jsx("span", { children: "\uD83C\uDF1F All Items" }), _jsx("span", { className: "pos-cat-count", children: totalItems })] }), menu.map((cat) => (_jsxs("button", { className: `pos-cat-btn ${activeCategory === cat.id ? "active" : ""}`, onClick: () => setActiveCategory(cat.id), children: [_jsxs("span", { children: [getCategoryEmoji(cat.name), " ", cat.name] }), _jsx("span", { className: "pos-cat-count", children: cat.items.length })] }, cat.id)))] })] }), _jsxs("div", { className: "pos-middle", children: [_jsxs("div", { className: "pos-top-bar", children: [_jsxs("div", { children: [_jsxs("h2", { children: [settings?.name ?? "Desert Bite POS", " Terminal"] }), _jsxs("p", { children: [settings?.tagline ?? "PIZZA KITCHEN & ERP", " \u00B7 ", filteredItems.length, " items showing"] })] }), _jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [search && (_jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setSearch(""), children: "Clear search" })), _jsxs("span", { className: "badge badge-gold", children: [filteredItems.length, " Shown"] })] })] }), menuLoading && _jsxs("div", { className: "loading-state", children: [_jsx("div", { className: "spinner" }), " Loading menu from database..."] }), apiOffline && (_jsxs("div", { className: "alert-banner alert-danger", style: { margin: 16 }, children: [_jsx(Icon, { d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", size: 18 }), _jsxs("div", { children: [_jsx("strong", { children: "API Server Offline:" }), " Run ", _jsx("code", { children: "npm run dev:api" }), " in a new terminal."] })] })), !apiOffline && menuError && (_jsxs("div", { className: "alert-banner alert-warning", style: { margin: 16 }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Menu Load Error:" }), " Unable to connect to database."] }), _jsx("button", { className: "btn btn-gold btn-sm", onClick: repairDatabase, children: "Repair Database" })] })), !apiOffline && !menuLoading && !menuError && filteredItems.length === 0 && (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-state-icon", children: "\uD83D\uDD0D" }), _jsx("p", { children: "No items found" }), _jsx("small", { children: "Try clearing your search query or selecting another category" })] })), _jsx("div", { className: "product-grid", children: filteredItems.map((item) => {
                                    const inCart = cart.find((x) => x.id === item.id);
                                    return (_jsxs("button", { className: "product-card", onClick: () => addToCart(item), children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" }, children: [_jsx("span", { className: "product-cat", children: item.categoryName }), inCart && (_jsxs("span", { className: "badge badge-gold", style: { fontSize: 10, padding: "1px 6px" }, children: ["x", inCart.qty] }))] }), _jsx("span", { className: "product-name", children: item.name }), item.preparationTime && (_jsxs("span", { style: { fontSize: 10, color: "var(--fg-3)" }, children: ["\u23F1 ", item.preparationTime, "m prep"] })), _jsx("span", { className: "product-price", children: formatRs(item.sellingPrice, symbol) })] }, item.id));
                                }) })] }), _jsxs("aside", { className: "pos-right", children: [_jsxs("div", { className: "pos-cart-header", children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx(Icon, { d: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z", size: 16 }), _jsx("h3", { children: "Current Bill" }), cartItemCount > 0 && _jsxs("span", { className: "badge badge-gold", children: [cartItemCount, " items"] })] }), _jsx("button", { className: "btn btn-ghost btn-sm", onClick: clearCart, disabled: cart.length === 0 && !selectedCust, style: { fontSize: 11, padding: "4px 8px" }, children: "Clear" })] }), _jsx("div", { className: "order-type-pills", children: ORDER_TYPES.map((t) => (_jsxs("button", { className: `ot-pill ${orderType === t.value ? "active" : ""}`, onClick: () => setOrderType(t.value), children: [t.icon, " ", t.label] }, t.value))) }), _jsxs("div", { style: { marginTop: 10, position: "relative" }, children: [_jsx("div", { style: { fontSize: 10, fontWeight: 700, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 4 }, children: "Customer Phone / History" }), selectedCust ? (
                                            /* Selected Customer Card */
                                            _jsxs("div", { style: {
                                                    background: "rgba(245,158,11,0.12)", border: "1px solid var(--border-gold)", borderRadius: 8, padding: "8px 10px"
                                                }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsxs("div", { style: { fontWeight: 800, fontSize: 13, color: "var(--fg)" }, children: ["\uD83D\uDC64 ", selectedCust.name] }), _jsx("button", { type: "button", style: { background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 12, fontWeight: 700 }, onClick: () => { setSelectedCust(null); setCustInput(""); }, title: "Detach customer", children: "\u2715 Detach" })] }), _jsxs("div", { style: { display: "flex", gap: 10, fontSize: 11, color: "var(--fg-2)", marginTop: 4, flexWrap: "wrap" }, children: [_jsxs("span", { children: ["\uD83D\uDCDE ", selectedCust.phone] }), _jsxs("span", { children: ["\uD83D\uDCB0 Spend: ", _jsx("strong", { children: formatRs(selectedCust.totalSpending || 0) })] }), _jsxs("span", { children: ["\u2B50 ", selectedCust.loyaltyPoints || 0, " pts"] })] }), _jsx("div", { style: { marginTop: 6, display: "flex", justifyContent: "flex-end" }, children: _jsx("button", { type: "button", className: "btn btn-ghost btn-sm", style: { fontSize: 10, padding: "2px 8px", color: "var(--gold)" }, onClick: () => setViewHistoryCustId(selectedCust.id), children: "\uD83D\uDCDC Check Past History & Spendings \u2192" }) })] })) : (
                                            /* Customer Phone Input with Auto-complete Dropdown */
                                            _jsxs("div", { children: [_jsx("input", { placeholder: "Enter Customer Phone or Name (03xx-xxxxxxx)\u2026", value: custInput, onChange: (e) => { setCustInput(e.target.value); setShowCustDropdown(true); }, onFocus: () => setShowCustDropdown(true), style: { fontSize: 12, padding: "7px 10px" } }), showCustDropdown && custInput.length >= 2 && (_jsxs("div", { style: {
                                                            position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
                                                            background: "var(--card-2)", border: "1px solid var(--border-gold)", borderRadius: 8,
                                                            maxHeight: 180, overflowY: "auto", boxShadow: "var(--shadow-lg)", marginTop: 4
                                                        }, children: [matchedCustomers.map((c) => (_jsxs("div", { style: {
                                                                    padding: "8px 10px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                                                                    fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center"
                                                                }, onClick: () => selectCustomer(c), children: [_jsxs("div", { children: [_jsx("strong", { style: { color: "var(--fg)" }, children: c.name }), _jsx("div", { className: "mono", style: { fontSize: 10, color: "var(--fg-3)" }, children: c.phone })] }), _jsxs("div", { style: { textTransform: "right", fontSize: 11 }, children: [_jsx("div", { style: { color: "var(--gold)", fontWeight: 700 }, children: formatRs(c.totalSpending || 0) }), _jsxs("small", { className: "text-muted", children: [c.loyaltyPoints || 0, " pts"] })] })] }, c.id))), matchedCustomers.length === 0 && (_jsxs("div", { style: { padding: 10, fontSize: 11, color: "var(--fg-3)", textAlign: "center" }, children: ["\u2795 Phone \"", custInput, "\" not registered. Will auto-create customer upon checkout."] }))] }))] }))] })] }), _jsx("div", { className: "cart-lines", children: cart.length === 0 ? (_jsxs("div", { className: "cart-empty", children: [_jsx("div", { className: "cart-empty-icon", children: "\uD83D\uDED2" }), _jsx("p", { children: "Order Cart Empty" }), _jsx("small", { style: { textAlign: "center" }, children: "Tap menu items on the left to add them to this bill" })] })) : (cart.map((line) => (_jsxs("div", { className: "cart-line-box", children: [_jsxs("div", { className: "cart-line", children: [_jsxs("div", { className: "cart-line-name", children: [_jsx("div", { children: line.name }), _jsx("div", { className: "cart-line-price", children: formatRs(line.price * line.qty, symbol) })] }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [_jsx("button", { className: "cart-qty-btn", onClick: () => setCart((p) => p.map((x) => (x.id === line.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))), children: "-" }), _jsx("span", { className: "cart-qty", children: line.qty }), _jsx("button", { className: "cart-qty-btn", onClick: () => setCart((p) => p.map((x) => (x.id === line.id ? { ...x, qty: x.qty + 1 } : x))), children: "+" }), _jsx("button", { className: "cart-del", title: "Remove item", onClick: () => setCart((p) => p.filter((x) => x.id !== line.id)), children: "\u2715" })] })] }), _jsx("div", { style: { padding: "0 8px 6px" }, children: activeNoteItemId === line.id ? (_jsx("input", { placeholder: "Special instruction (e.g. Extra cheese)...", value: line.note || "", onChange: (e) => updateItemNote(line.id, e.target.value), onBlur: () => setActiveNoteItemId(null), autoFocus: true, style: { fontSize: 11, padding: "4px 8px" } })) : (_jsx("button", { type: "button", onClick: () => setActiveNoteItemId(line.id), style: { background: "none", border: "none", color: line.note ? "var(--gold)" : "var(--fg-3)", fontSize: 10, cursor: "pointer", padding: 0 }, children: line.note ? `📝 "${line.note}"` : "+ Add Note" })) })] }, line.id)))) }), _jsxs("div", { className: "cart-footer", children: [_jsxs("div", { className: "cart-discount-row", children: [_jsx("button", { className: `discount-toggle ${!usePercentDiscount ? "active" : ""}`, onClick: () => setUsePercentDiscount(false), children: "Rs" }), _jsx("button", { className: `discount-toggle ${usePercentDiscount ? "active" : ""}`, onClick: () => setUsePercentDiscount(true), children: "%" }), usePercentDiscount ? (_jsx("input", { type: "number", min: 0, max: 100, placeholder: "Discount %", value: discountPercent || "", onChange: (e) => setDiscountPercent(Number(e.target.value)) })) : (_jsx("input", { type: "number", min: 0, placeholder: "Discount amount", value: discountAmount || "", onChange: (e) => setDiscountAmount(Number(e.target.value)) }))] }), _jsxs("div", { className: "cart-totals", children: [_jsxs("div", { className: "cart-total-row", children: [_jsx("span", { children: "Subtotal" }), _jsx("span", { children: formatRs(totals.subtotal, symbol) })] }), totals.discount > 0 && (_jsxs("div", { className: "cart-total-row", style: { color: "var(--success)" }, children: [_jsx("span", { children: "Discount" }), _jsxs("span", { children: ["-", formatRs(totals.discount, symbol)] })] })), totals.tax > 0 && (_jsxs("div", { className: "cart-total-row", children: [_jsxs("span", { children: ["Sales Tax (", (taxRate * 100).toFixed(0), "%)"] }), _jsx("span", { children: formatRs(totals.tax, symbol) })] })), totals.serviceCharge > 0 && (_jsxs("div", { className: "cart-total-row", children: [_jsx("span", { children: "Service Charge" }), _jsx("span", { children: formatRs(totals.serviceCharge, symbol) })] })), _jsxs("div", { className: "cart-total-row grand", children: [_jsx("span", { children: "Grand Total" }), _jsx("span", { children: formatRs(totals.total, symbol) })] })] }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("div", { style: { fontSize: 10, fontWeight: 700, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 4 }, children: "Payment Method" }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }, children: PAYMENT_METHODS.map((p) => (_jsxs("button", { className: `ot-pill ${paymentMethod === p.value ? "active" : ""}`, onClick: () => setPaymentMethod(p.value), style: { fontSize: 11, padding: "6px 4px" }, title: p.label, children: [_jsx("div", { style: { fontSize: 16, lineHeight: 1.2 }, children: p.icon }), _jsx("div", { style: { fontSize: 9, marginTop: 2 }, children: p.label })] }, p.value))) })] }), _jsx("input", { placeholder: "Order Notes / Kitchen Instructions...", value: orderNotes, onChange: (e) => setOrderNotes(e.target.value), style: { fontSize: 11, padding: "6px 8px", marginBottom: 8 } }), checkoutMsg && (_jsx("div", { className: `checkout-msg ${checkoutMsg.includes("failed") || checkoutMsg.includes("Cannot") ? "error" : ""}`, children: checkoutMsg })), _jsx("button", { className: "checkout-btn", onClick: checkout, disabled: cart.length === 0 || loading, children: loading ? "Processing Order..." : `PAY ${formatRs(totals.total, symbol)}` }), lastOrderId && (_jsx("button", { className: "btn btn-ghost full", onClick: printReceipt, style: { width: "100%", justifyContent: "center" }, children: "\uD83D\uDDA8\uFE0F Print Last Receipt" }))] })] })] }), showReceipt && lastOrderId && (_jsx(ReceiptModal, { orderId: lastOrderId, token: token, autoPrint: false, onClose: () => setShowReceipt(false) })), viewHistoryCustId && custHistory && (_jsx("div", { className: "modal-overlay", onClick: () => setViewHistoryCustId(null), children: _jsxs("div", { className: "modal-card", style: { maxWidth: 640 }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { className: "modal-title", children: ["\uD83D\uDCDC Customer History \u2014 ", custHistory.name] }), _jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setViewHistoryCustId(null), children: "\u2715" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "kpi-grid", style: { marginBottom: 16 }, children: [_jsxs("div", { className: "kpi-card", style: { "--kpi-color": "var(--gold)" }, children: [_jsx("div", { className: "kpi-label", children: "Lifetime Spendings" }), _jsx("div", { className: "kpi-value", children: formatRs(custHistory.totalSpending || 0) })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#3b82f6" }, children: [_jsx("div", { className: "kpi-label", children: "Total Orders" }), _jsx("div", { className: "kpi-value", children: custHistory.orders?.length || 0 })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#fbbf24" }, children: [_jsx("div", { className: "kpi-label", children: "Loyalty Points" }), _jsxs("div", { className: "kpi-value", children: [custHistory.loyaltyPoints || 0, " pts"] })] })] }), _jsxs("div", { style: { marginBottom: 12, fontSize: 13, color: "var(--fg-2)" }, children: [_jsxs("div", { children: ["\uD83D\uDCDE Phone: ", _jsx("span", { className: "mono", children: custHistory.phone })] }), custHistory.email && _jsxs("div", { children: ["\u2709 Email: ", custHistory.email] }), custHistory.address && _jsxs("div", { children: ["\uD83D\uDCCD Address: ", custHistory.address] })] }), _jsx("div", { style: { fontWeight: 800, fontSize: 14, marginBottom: 10 }, children: "Order History & Past Purchased Items:" }), _jsxs("div", { className: "table-wrap", children: [_jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Invoice No" }), _jsx("th", { children: "Date" }), _jsx("th", { children: "Items Purchased" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Total" })] }) }), _jsx("tbody", { children: custHistory.orders?.map((o) => (_jsxs("tr", { children: [_jsx("td", { className: "mono", children: o.invoiceNo }), _jsx("td", { className: "text-muted", style: { fontSize: 11 }, children: new Date(o.createdAt).toLocaleDateString() }), _jsx("td", { style: { fontSize: 12 }, children: o.items?.map((i) => `${i.item.name} x${i.quantity}`).join(", ") }), _jsx("td", { children: _jsx("span", { className: `badge badge-${o.status.toLowerCase()}`, children: o.status }) }), _jsx("td", { className: "font-mono font-bold text-gold", children: formatRs(o.total) })] }, o.id))) })] }), (!custHistory.orders || custHistory.orders.length === 0) && (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "No past orders recorded for this customer" }) }))] })] }), _jsx("div", { className: "modal-footer", children: _jsx("button", { className: "btn btn-gold", onClick: () => setViewHistoryCustId(null), children: "Close History" }) })] }) }))] }));
}
