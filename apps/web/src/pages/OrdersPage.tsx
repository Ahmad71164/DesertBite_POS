import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders, formatRs } from "../lib/api";
import { fetchAndPrintReceipt } from "../components/ReceiptModal";

type Order = {
  id: string;
  invoiceNo: string;
  status: string;
  orderType: string;
  total: number;
  paymentMethod: string | null;
  createdAt: string;
  items: { quantity: number; item: { name: string } }[];
};

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const STATUSES = ["NEW", "PREPARING", "READY", "SERVED", "DELIVERED", "COMPLETED", "CANCELLED"];
const STATUS_COLORS: Record<string, string> = {
  NEW: "#8b5cf6", PREPARING: "#f59e0b", READY: "#10b981",
  SERVED: "#3b82f6", DELIVERED: "#06b6d4", COMPLETED: "#10b981", CANCELLED: "#ef4444",
};

export function OrdersPage({ token }: { token: string }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get<Order[]>("/orders", { headers: authHeaders(token) })).data,
    refetchInterval: 5000,
  });

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/orders/${id}/status`, { status }, { headers: authHeaders(token) });
    qc.invalidateQueries({ queryKey: ["orders"] });
    qc.invalidateQueries({ queryKey: ["summary"] });
  };

  const printReceipt = async (id: string) => {
    try { await fetchAndPrintReceipt(id, token); }
    catch { alert("Could not print receipt. Is API running?"); }
  };

  const filtered = orders.filter((o) => {
    const matchSearch = search === "" || o.invoiceNo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const countByStatus = (s: string) => orders.filter((o) => o.status === s).length;

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" size={20} />
          </div>
          <div>
            <div className="page-title">Order Management</div>
            <div className="page-subtitle">{orders.length} total orders · Auto-refreshing every 5s</div>
          </div>
        </div>
        <div className="page-actions">
          <input
            style={{ width: 200 }}
            placeholder="Search invoice…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="page-body">
        {/* Status Filter Tabs */}
        <div className="pill-tabs" style={{ marginBottom: 16 }}>
          <button className={`pill-tab ${filterStatus === "ALL" ? "active" : ""}`} onClick={() => setFilterStatus("ALL")}>
            All <span className="badge badge-gold" style={{ marginLeft: 4 }}>{orders.length}</span>
          </button>
          {STATUSES.map((s) => (
            <button key={s} className={`pill-tab ${filterStatus === s ? "active" : ""}`} onClick={() => setFilterStatus(s)}>
              {s}
              {countByStatus(s) > 0 && <span style={{ marginLeft: 5, background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "0 5px", fontSize: 10, fontWeight: 700 }}>{countByStatus(s)}</span>}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="card">
          {isLoading && (
            <div className="loading-state"><div className="spinner" />Loading orders…</div>
          )}
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Items</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div className="mono">{o.invoiceNo}</div>
                      <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>
                        {new Date(o.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>
                        {o.items.map((i) => `${i.item.name} ×${i.quantity}`).join(", ")}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${o.orderType.toLowerCase()}`}>
                        {o.orderType.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--fg-2)" }}>{o.paymentMethod || "—"}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "var(--gold)" }}>
                      {formatRs(o.total)}
                    </td>
                    <td>
                      <span className={`badge badge-${o.status.toLowerCase()}`} style={{ "--badge-bg": STATUS_COLORS[o.status] } as React.CSSProperties}>
                        <span className="badge-dot" />
                        {o.status}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)" }}>
                      {new Date(o.createdAt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          style={{ fontSize: 12, padding: "5px 8px", width: 120 }}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button className="btn btn-ghost btn-sm" onClick={() => printReceipt(o.id)} title="Print Receipt">
                          <Icon d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && !isLoading && (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p>{filterStatus === "ALL" ? "No orders yet" : `No ${filterStatus} orders`}</p>
                <small>Create orders from the POS terminal</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
