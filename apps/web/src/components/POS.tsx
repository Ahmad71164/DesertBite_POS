import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { calculateOrderTotals, type OrderType, type PaymentMethod, type RestaurantSettings } from "@restaurant-pro/shared";
import { api, authHeaders, checkApiHealth, formatRs, repairDatabase as repairDbApi } from "../lib/api";
import { ReceiptModal } from "./ReceiptModal";

type CartLine = { id: string; name: string; price: number; qty: number; note?: string };
type MenuCategory = {
  id: string;
  name: string;
  items: { id: string; name: string; sellingPrice: number; preparationTime?: number; availability: boolean }[];
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  membershipTier?: string;
  loyaltyPoints?: number;
  totalSpending?: number;
  createdAt?: string;
};

type CustomerHistory = Customer & {
  orders?: {
    id: string;
    invoiceNo: string;
    total: number;
    createdAt: string;
    orderType: string;
    paymentMethod: string | null;
    status: string;
    items: { quantity: number; unitPrice: number; item: { name: string } }[];
  }[];
};

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const CATEGORY_ICONS: Record<string, string> = {
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

function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return emoji;
  }
  return "🍽️";
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: "CASH", label: "Cash", icon: "💵" },
  { value: "CARD", label: "Card", icon: "💳" },
  { value: "JAZZCASH", label: "JazzCash", icon: "📱" },
  { value: "EASYPAISA", label: "Easypaisa", icon: "📱" },
  { value: "BANK_TRANSFER", label: "Bank", icon: "🏦" },
];

const ORDER_TYPES: { value: OrderType; label: string; icon: string }[] = [
  { value: "DINE_IN", label: "Dine In", icon: "🍽️" },
  { value: "TAKE_AWAY", label: "Take Away", icon: "🛍️" },
  { value: "DELIVERY", label: "Delivery", icon: "🚚" },
];

export function POS({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("DINE_IN");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [usePercentDiscount, setUsePercentDiscount] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [orderNotes, setOrderNotes] = useState("");
  const [checkoutMsg, setCheckoutMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [activeNoteItemId, setActiveNoteItemId] = useState<string | null>(null);

  // Customer Phone Lookup State
  const [custInput, setCustInput] = useState("");
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [showCustDropdown, setShowCustDropdown] = useState(false);
  const [viewHistoryCustId, setViewHistoryCustId] = useState<string | null>(null);

  const headers = authHeaders(token);

  const { data: health } = useQuery({
    queryKey: ["api-health"],
    queryFn: checkApiHealth,
    refetchInterval: 5000,
  });

  const {
    data: menu = [],
    isLoading: menuLoading,
    isError: menuError,
    refetch: refetchMenu,
  } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      await checkApiHealth();
      return (await api.get<MenuCategory[]>("/menu", { headers })).data;
    },
    retry: 2,
    staleTime: 60_000,
    enabled: !!health?.ok,
  });

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await api.get<RestaurantSettings>("/settings", { headers })).data,
  });

  // Query customers for phone lookup
  const { data: matchedCustomers = [] } = useQuery({
    queryKey: ["customer-search", custInput],
    queryFn: async () => {
      if (!custInput || custInput.length < 2) return [];
      return (await api.get<Customer[]>(`/customers?search=${encodeURIComponent(custInput)}`, { headers })).data;
    },
    enabled: custInput.length >= 2 && !selectedCust,
  });

  // Query single customer full history
  const { data: custHistory } = useQuery({
    queryKey: ["customer-history", viewHistoryCustId],
    queryFn: async () => {
      if (!viewHistoryCustId) return null;
      return (await api.get<CustomerHistory>(`/customers/${viewHistoryCustId}`, { headers })).data;
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
    const all = menu.flatMap((c) =>
      c.items.filter((i) => i.availability).map((i) => ({ ...i, categoryId: c.id, categoryName: c.name }))
    );
    return all.filter((item) => {
      const matchCategory = activeCategory === "all" || item.categoryId === activeCategory;
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [menu, activeCategory, search]);

  const addToCart = (item: { id: string; name: string; sellingPrice: number }) => {
    setCart((prev) => {
      const found = prev.find((x) => x.id === item.id);
      if (found) return prev.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x));
      return [...prev, { id: item.id, name: item.name, price: item.sellingPrice, qty: 1 }];
    });
  };

  const updateItemNote = (id: string, note: string) => {
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

  const selectCustomer = (c: Customer) => {
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
    } catch (e) {
      setCheckoutMsg(String((e as Error).message ?? "Repair failed. Run: npm run dev:api"));
    }
  };

  const apiOffline = !health?.ok;

  const checkout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setCheckoutMsg("");
    try {
      const trimmedInput = custInput.trim();
      const hasDigits = /\d{4,}/.test(trimmedInput);
      const custPhoneToSend = selectedCust ? selectedCust.phone : (hasDigits ? trimmedInput : undefined);
      const custNameToSend = selectedCust ? selectedCust.name : (trimmedInput || undefined);

      const { data } = await api.post(
        "/orders",
        {
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
        },
        { headers }
      );
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
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCheckoutMsg(msg ?? "Checkout failed. Ensure API server is running.");
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    if (lastOrderId) setShowReceipt(true);
  };

  return (
    <>
      <section className="pos-layout">
        {/* Left Column: Categories */}
        <aside className="pos-left">
          <div className="pos-left-title">
            <span>Categories ({menu.length})</span>
          </div>
          <div className="pos-search">
            <input
              placeholder="Search category or item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="pos-cat-list">
            <button
              className={`pos-cat-btn ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              <span>🌟 All Items</span>
              <span className="pos-cat-count">{totalItems}</span>
            </button>
            {menu.map((cat) => (
              <button
                key={cat.id}
                className={`pos-cat-btn ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{getCategoryEmoji(cat.name)} {cat.name}</span>
                <span className="pos-cat-count">{cat.items.length}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Middle Column: Products Grid */}
        <div className="pos-middle">
          <div className="pos-top-bar">
            <div>
              <h2>{settings?.name ?? "Desert Bite POS"} Terminal</h2>
              <p>{settings?.tagline ?? "PIZZA KITCHEN & ERP"} · {filteredItems.length} items showing</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {search && (
                <button className="btn btn-ghost btn-sm" onClick={() => setSearch("")}>
                  Clear search
                </button>
              )}
              <span className="badge badge-gold">{filteredItems.length} Shown</span>
            </div>
          </div>

          {menuLoading && <div className="loading-state"><div className="spinner" /> Loading menu from database...</div>}

          {apiOffline && (
            <div className="alert-banner alert-danger" style={{ margin: 16 }}>
              <Icon d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" size={18} />
              <div>
                <strong>API Server Offline:</strong> Run <code>npm run dev:api</code> in a new terminal.
              </div>
            </div>
          )}

          {!apiOffline && menuError && (
            <div className="alert-banner alert-warning" style={{ margin: 16 }}>
              <div>
                <strong>Menu Load Error:</strong> Unable to connect to database.
              </div>
              <button className="btn btn-gold btn-sm" onClick={repairDatabase}>Repair Database</button>
            </div>
          )}

          {!apiOffline && !menuLoading && !menuError && filteredItems.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p>No items found</p>
              <small>Try clearing your search query or selecting another category</small>
            </div>
          )}

          <div className="product-grid">
            {filteredItems.map((item) => {
              const inCart = cart.find((x) => x.id === item.id);
              return (
                <button key={item.id} className="product-card" onClick={() => addToCart(item)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span className="product-cat">{item.categoryName}</span>
                    {inCart && (
                      <span className="badge badge-gold" style={{ fontSize: 10, padding: "1px 6px" }}>
                        x{inCart.qty}
                      </span>
                    )}
                  </div>
                  <span className="product-name">{item.name}</span>
                  {item.preparationTime && (
                    <span style={{ fontSize: 10, color: "var(--fg-3)" }}>⏱ {item.preparationTime}m prep</span>
                  )}
                  <span className="product-price">{formatRs(item.sellingPrice, symbol)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Current Order & Bill */}
        <aside className="pos-right">
          <div className="pos-cart-header">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" size={16} />
                <h3>Current Bill</h3>
                {cartItemCount > 0 && <span className="badge badge-gold">{cartItemCount} items</span>}
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={clearCart}
                disabled={cart.length === 0 && !selectedCust}
                style={{ fontSize: 11, padding: "4px 8px" }}
              >
                Clear
              </button>
            </div>

            {/* Order Type Pills */}
            <div className="order-type-pills">
              {ORDER_TYPES.map((t) => (
                <button
                  key={t.value}
                  className={`ot-pill ${orderType === t.value ? "active" : ""}`}
                  onClick={() => setOrderType(t.value)}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* CUSTOMER PHONE / AUTO-LINK SEARCH */}
            <div style={{ marginTop: 10, position: "relative" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 4 }}>
                Customer Phone / History
              </div>

              {selectedCust ? (
                /* Selected Customer Card */
                <div style={{
                  background: "rgba(245,158,11,0.12)", border: "1px solid var(--border-gold)", borderRadius: 8, padding: "8px 10px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "var(--fg)" }}>
                      👤 {selectedCust.name}
                    </div>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                      onClick={() => { setSelectedCust(null); setCustInput(""); }}
                      title="Detach customer"
                    >
                      ✕ Detach
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--fg-2)", marginTop: 4, flexWrap: "wrap" }}>
                    <span>📞 {selectedCust.phone}</span>
                    <span>💰 Spend: <strong>{formatRs(selectedCust.totalSpending || 0)}</strong></span>
                    <span>⭐ {selectedCust.loyaltyPoints || 0} pts</span>
                  </div>
                  <div style={{ marginTop: 6, display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 10, padding: "2px 8px", color: "var(--gold)" }}
                      onClick={() => setViewHistoryCustId(selectedCust.id)}
                    >
                      📜 Check Past History & Spendings →
                    </button>
                  </div>
                </div>
              ) : (
                /* Customer Phone Input with Auto-complete Dropdown */
                <div>
                  <input
                    placeholder="Enter Customer Phone or Name (03xx-xxxxxxx)…"
                    value={custInput}
                    onChange={(e) => { setCustInput(e.target.value); setShowCustDropdown(true); }}
                    onFocus={() => setShowCustDropdown(true)}
                    style={{ fontSize: 12, padding: "7px 10px" }}
                  />
                  {showCustDropdown && custInput.length >= 2 && (
                    <div style={{
                      position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
                      background: "var(--card-2)", border: "1px solid var(--border-gold)", borderRadius: 8,
                      maxHeight: 180, overflowY: "auto", boxShadow: "var(--shadow-lg)", marginTop: 4
                    }}>
                      {matchedCustomers.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            padding: "8px 10px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                            fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center"
                          }}
                          onClick={() => selectCustomer(c)}
                        >
                          <div>
                            <strong style={{ color: "var(--fg)" }}>{c.name}</strong>
                            <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>{c.phone}</div>
                          </div>
                          <div style={{ textTransform: "right", fontSize: 11 }}>
                            <div style={{ color: "var(--gold)", fontWeight: 700 }}>{formatRs(c.totalSpending || 0)}</div>
                            <small className="text-muted">{c.loyaltyPoints || 0} pts</small>
                          </div>
                        </div>
                      ))}
                      {matchedCustomers.length === 0 && (
                        <div style={{ padding: 10, fontSize: 11, color: "var(--fg-3)", textAlign: "center" }}>
                          ➕ Phone "{custInput}" not registered. Will auto-create customer upon checkout.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Lines */}
          <div className="cart-lines">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">🛒</div>
                <p>Order Cart Empty</p>
                <small style={{ textAlign: "center" }}>Tap menu items on the left to add them to this bill</small>
              </div>
            ) : (
              cart.map((line) => (
                <div className="cart-line-box" key={line.id}>
                  <div className="cart-line">
                    <div className="cart-line-name">
                      <div>{line.name}</div>
                      <div className="cart-line-price">{formatRs(line.price * line.qty, symbol)}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button
                        className="cart-qty-btn"
                        onClick={() => setCart((p) => p.map((x) => (x.id === line.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))}
                      >
                        -
                      </button>
                      <span className="cart-qty">{line.qty}</span>
                      <button
                        className="cart-qty-btn"
                        onClick={() => setCart((p) => p.map((x) => (x.id === line.id ? { ...x, qty: x.qty + 1 } : x)))}
                      >
                        +
                      </button>
                      <button
                        className="cart-del"
                        title="Remove item"
                        onClick={() => setCart((p) => p.filter((x) => x.id !== line.id))}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Inline Note Toggle */}
                  <div style={{ padding: "0 8px 6px" }}>
                    {activeNoteItemId === line.id ? (
                      <input
                        placeholder="Special instruction (e.g. Extra cheese)..."
                        value={line.note || ""}
                        onChange={(e) => updateItemNote(line.id, e.target.value)}
                        onBlur={() => setActiveNoteItemId(null)}
                        autoFocus
                        style={{ fontSize: 11, padding: "4px 8px" }}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveNoteItemId(line.id)}
                        style={{ background: "none", border: "none", color: line.note ? "var(--gold)" : "var(--fg-3)", fontSize: 10, cursor: "pointer", padding: 0 }}
                      >
                        {line.note ? `📝 "${line.note}"` : "+ Add Note"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer Calculation & Pay */}
          <div className="cart-footer">
            <div className="cart-discount-row">
              <button
                className={`discount-toggle ${!usePercentDiscount ? "active" : ""}`}
                onClick={() => setUsePercentDiscount(false)}
              >
                Rs
              </button>
              <button
                className={`discount-toggle ${usePercentDiscount ? "active" : ""}`}
                onClick={() => setUsePercentDiscount(true)}
              >
                %
              </button>
              {usePercentDiscount ? (
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Discount %"
                  value={discountPercent || ""}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                />
              ) : (
                <input
                  type="number"
                  min={0}
                  placeholder="Discount amount"
                  value={discountAmount || ""}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                />
              )}
            </div>

            <div className="cart-totals">
              <div className="cart-total-row">
                <span>Subtotal</span>
                <span>{formatRs(totals.subtotal, symbol)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="cart-total-row" style={{ color: "var(--success)" }}>
                  <span>Discount</span>
                  <span>-{formatRs(totals.discount, symbol)}</span>
                </div>
              )}
              {totals.tax > 0 && (
                <div className="cart-total-row">
                  <span>Sales Tax ({(taxRate * 100).toFixed(0)}%)</span>
                  <span>{formatRs(totals.tax, symbol)}</span>
                </div>
              )}
              {totals.serviceCharge > 0 && (
                <div className="cart-total-row">
                  <span>Service Charge</span>
                  <span>{formatRs(totals.serviceCharge, symbol)}</span>
                </div>
              )}
              <div className="cart-total-row grand">
                <span>Grand Total</span>
                <span>{formatRs(totals.total, symbol)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 4 }}>
                Payment Method
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
                {PAYMENT_METHODS.map((p) => (
                  <button
                    key={p.value}
                    className={`ot-pill ${paymentMethod === p.value ? "active" : ""}`}
                    onClick={() => setPaymentMethod(p.value)}
                    style={{ fontSize: 11, padding: "6px 4px" }}
                    title={p.label}
                  >
                    <div style={{ fontSize: 16, lineHeight: 1.2 }}>{p.icon}</div>
                    <div style={{ fontSize: 9, marginTop: 2 }}>{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Input */}
            <input
              placeholder="Order Notes / Kitchen Instructions..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              style={{ fontSize: 11, padding: "6px 8px", marginBottom: 8 }}
            />

            {checkoutMsg && (
              <div className={`checkout-msg ${checkoutMsg.includes("failed") || checkoutMsg.includes("Cannot") ? "error" : ""}`}>
                {checkoutMsg}
              </div>
            )}

            {/* Pay Button */}
            <button
              className="checkout-btn"
              onClick={checkout}
              disabled={cart.length === 0 || loading}
            >
              {loading ? "Processing Order..." : `PAY ${formatRs(totals.total, symbol)}`}
            </button>

            {lastOrderId && (
              <button
                className="btn btn-ghost full"
                onClick={printReceipt}
                style={{ width: "100%", justifyContent: "center" }}
              >
                🖨️ Print Last Receipt
              </button>
            )}
          </div>
        </aside>
      </section>

      {/* Modal: Receipt */}
      {showReceipt && lastOrderId && (
        <ReceiptModal
          orderId={lastOrderId}
          token={token}
          autoPrint={false}
          onClose={() => setShowReceipt(false)}
        />
      )}

      {/* Modal: Customer Past History & Spendings */}
      {viewHistoryCustId && custHistory && (
        <div className="modal-overlay" onClick={() => setViewHistoryCustId(null)}>
          <div className="modal-card" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                📜 Customer History — {custHistory.name}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setViewHistoryCustId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="kpi-grid" style={{ marginBottom: 16 }}>
                <div className="kpi-card" style={{ "--kpi-color": "var(--gold)" } as React.CSSProperties}>
                  <div className="kpi-label">Lifetime Spendings</div>
                  <div className="kpi-value">{formatRs(custHistory.totalSpending || 0)}</div>
                </div>
                <div className="kpi-card" style={{ "--kpi-color": "#3b82f6" } as React.CSSProperties}>
                  <div className="kpi-label">Total Orders</div>
                  <div className="kpi-value">{custHistory.orders?.length || 0}</div>
                </div>
                <div className="kpi-card" style={{ "--kpi-color": "#fbbf24" } as React.CSSProperties}>
                  <div className="kpi-label">Loyalty Points</div>
                  <div className="kpi-value">{custHistory.loyaltyPoints || 0} pts</div>
                </div>
              </div>

              <div style={{ marginBottom: 12, fontSize: 13, color: "var(--fg-2)" }}>
                <div>📞 Phone: <span className="mono">{custHistory.phone}</span></div>
                {custHistory.email && <div>✉ Email: {custHistory.email}</div>}
                {custHistory.address && <div>📍 Address: {custHistory.address}</div>}
              </div>

              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>
                Order History & Past Purchased Items:
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Date</th>
                      <th>Items Purchased</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {custHistory.orders?.map((o) => (
                      <tr key={o.id}>
                        <td className="mono">{o.invoiceNo}</td>
                        <td className="text-muted" style={{ fontSize: 11 }}>
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ fontSize: 12 }}>
                          {o.items?.map((i) => `${i.item.name} x${i.quantity}`).join(", ")}
                        </td>
                        <td>
                          <span className={`badge badge-${o.status.toLowerCase()}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="font-mono font-bold text-gold">{formatRs(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!custHistory.orders || custHistory.orders.length === 0) && (
                  <div className="empty-state">
                    <p>No past orders recorded for this customer</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-gold" onClick={() => setViewHistoryCustId(null)}>Close History</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
