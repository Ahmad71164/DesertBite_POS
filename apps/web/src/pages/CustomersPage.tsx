import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders, formatRs } from "../lib/api";
import { PageHeader } from "../App";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  membershipTier?: string;
  loyaltyPoints?: number;
  totalSpending?: number;
  createdAt: string;
  orders?: any[];
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

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const TIER_COLORS: Record<string, string> = {
  SILVER: "var(--fg-3)",
  GOLD: "var(--gold)",
  PLATINUM: "#a78bfa",
};

export function CustomersPage({ token }: { token: string }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [viewHistoryCustId, setViewHistoryCustId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });

  const headers = authHeaders(token);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => (await api.get<Customer[]>("/customers", { headers })).data,
  });

  const { data: custHistory } = useQuery({
    queryKey: ["customer-history", viewHistoryCustId],
    queryFn: async () => {
      if (!viewHistoryCustId) return null;
      return (await api.get<CustomerHistory>(`/customers/${viewHistoryCustId}`, { headers })).data;
    },
    enabled: !!viewHistoryCustId,
  });

  const createCustomer = async () => {
    if (!form.name || !form.phone) return;
    try {
      await api.post("/customers", form, { headers });
      setShowAdd(false);
      setForm({ name: "", phone: "", email: "", address: "" });
      qc.invalidateQueries({ queryKey: ["customers"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create customer");
    }
  };

  const updateCustomer = async () => {
    if (!editCustomer) return;
    try {
      await api.patch(
        `/customers/${editCustomer.id}`,
        {
          name: editCustomer.name,
          phone: editCustomer.phone,
          email: editCustomer.email,
          address: editCustomer.address,
        },
        { headers }
      );
      setEditCustomer(null);
      qc.invalidateQueries({ queryKey: ["customers"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update customer");
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer record?")) return;
    try {
      await api.delete(`/customers/${id}`, { headers });
      qc.invalidateQueries({ queryKey: ["customers"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete customer");
    }
  };

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpending = customers.reduce((sum, c) => sum + (c.totalSpending || 0), 0);
  const totalPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
  const tiers = { SILVER: 0, GOLD: 0, PLATINUM: 0 };
  customers.forEach((c) => {
    if (c.membershipTier && c.membershipTier in tiers) {
      tiers[c.membershipTier as keyof typeof tiers]++;
    }
  });

  return (
    <>
      <PageHeader title="CRM — Customers" icon="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 00-8zM23 21v-2a4 4 0 00-3-3.87">
        <button className="btn btn-gold btn-sm" onClick={() => { setForm({ name: "", phone: "", email: "", address: "" }); setShowAdd(true); }}>
          <Icon d="M12 5v14M5 12h14" size={14} />
          New Customer
        </button>
      </PageHeader>

      <div className="page-body">
        {/* KPI Grid */}
        <div className="kpi-grid">
          <div className="kpi-card" style={{ "--kpi-color": "#06b6d4" } as React.CSSProperties}>
            <div className="kpi-icon-wrap"><Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 00-8z" size={16} /></div>
            <div className="kpi-label">Total Customers</div>
            <div className="kpi-value">{customers.length}</div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "var(--gold)" } as React.CSSProperties}>
            <div className="kpi-icon-wrap"><Icon d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" size={16} /></div>
            <div className="kpi-label">Total Customer Spending</div>
            <div className="kpi-value">{formatRs(totalSpending)}</div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "#fbbf24" } as React.CSSProperties}>
            <div className="kpi-icon-wrap"><Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" size={16} /></div>
            <div className="kpi-label">Loyalty Points Issued</div>
            <div className="kpi-value">{totalPoints.toLocaleString()}</div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "#a78bfa" } as React.CSSProperties}>
            <div className="kpi-icon-wrap"><Icon d="M5 3l14 9-14 9V3z" size={16} /></div>
            <div className="kpi-label">Platinum VIP Members</div>
            <div className="kpi-value">{tiers.PLATINUM}</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ maxWidth: 360 }}>
          <input
            placeholder="Search by name, phone or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Customers Table */}
        <div className="card">
          {isLoading && <div className="loading-state"><div className="spinner" /> Loading customer directory…</div>}
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Phone Number</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Tier</th>
                  <th>Loyalty Points</th>
                  <th>Total Spent</th>
                  <th>Orders</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: "linear-gradient(135deg, var(--gold), #d97706)",
                          display: "grid", placeItems: "center",
                          fontSize: 13, fontWeight: 900, color: "#000", flexShrink: 0
                        }}>
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold">{c.name}</span>
                      </div>
                    </td>
                    <td className="mono">{c.phone}</td>
                    <td className="text-muted" style={{ fontSize: 12 }}>{c.email || "—"}</td>
                    <td className="text-muted" style={{ fontSize: 12, maxWidth: 160 }}>{c.address || "—"}</td>
                    <td>
                      {c.membershipTier ? (
                        <span className="badge" style={{ background: "transparent", border: `1px solid ${TIER_COLORS[c.membershipTier] || "var(--border)"}`, color: TIER_COLORS[c.membershipTier] || "var(--fg)" }}>
                          {c.membershipTier}
                        </span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: 11 }}>STANDARD</span>
                      )}
                    </td>
                    <td className="font-bold text-gold">{(c.loyaltyPoints || 0).toLocaleString()} pts</td>
                    <td className="font-mono font-bold">{formatRs(c.totalSpending || 0)}</td>
                    <td className="mono">{c.orders?.length ?? 0} orders</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          className="btn btn-gold btn-sm"
                          onClick={() => setViewHistoryCustId(c.id)}
                        >
                          History
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditCustomer(c)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteCustomer(c.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && !isLoading && (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <p>No customers found</p>
                <small>Click "New Customer" to register a customer</small>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Create Customer */}
        {showAdd && (
          <div className="modal-overlay" onClick={() => setShowAdd(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Register New Customer</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input placeholder="e.g. Ali Ahmed" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input placeholder="0300-1234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" placeholder="customer@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Address</label>
                  <input placeholder="Street address, city" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-gold" onClick={createCustomer}>Save Customer</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Customer */}
        {editCustomer && (
          <div className="modal-overlay" onClick={() => setEditCustomer(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Edit Customer Record</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditCustomer(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    value={editCustomer.name}
                    onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    value={editCustomer.phone}
                    onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={editCustomer.email || ""}
                    onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Address</label>
                  <input
                    value={editCustomer.address || ""}
                    onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setEditCustomer(null)}>Cancel</button>
                <button className="btn btn-gold" onClick={updateCustomer}>Update Customer</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Customer Past History & Spendings */}
        {viewHistoryCustId && custHistory && (
          <div className="modal-overlay" onClick={() => setViewHistoryCustId(null)}>
            <div className="modal-card" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">
                  📜 Customer History & Spendings — {custHistory.name}
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
                            {o.items?.map((i: any) => `${i.item.name} x${i.quantity}`).join(", ")}
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
      </div>
    </>
  );
}
