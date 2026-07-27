import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders } from "../lib/api";

type KdsOrder = {
  id: string;
  invoiceNo: string;
  status: string;
  orderType: string;
  createdAt: string;
  table?: { name: string } | null;
  items: { quantity: number; note: string | null; item: { name: string; preparationTime: number } }[];
};

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function ElapsedTimer({ since }: { since: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const calc = () => Math.floor((Date.now() - new Date(since).getTime()) / 1000);
    setElapsed(calc());
    const id = setInterval(() => setElapsed(calc()), 1000);
    return () => clearInterval(id);
  }, [since]);
  const m = Math.floor(elapsed / 60), s = elapsed % 60;
  const label = `${m}:${s.toString().padStart(2, "0")}`;
  const cls = elapsed > 900 ? "danger" : elapsed > 480 ? "warn" : "";
  return <div className={`kds-timer ${cls}`}>{label}</div>;
}

export function KitchenPage({ token }: { token: string }) {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["kds"],
    queryFn: async () => (await api.get<KdsOrder[]>("/kds", { headers: authHeaders(token) })).data,
    refetchInterval: 3000,
  });

  const setStatus = async (id: string, status: string) => {
    await api.patch(`/orders/${id}/status`, { status }, { headers: authHeaders(token) });
    qc.invalidateQueries({ queryKey: ["kds"] });
    qc.invalidateQueries({ queryKey: ["orders"] });
  };

  const counts = {
    new: orders.filter((o) => o.status === "NEW").length,
    preparing: orders.filter((o) => o.status === "PREPARING").length,
    ready: orders.filter((o) => o.status === "READY").length,
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon" style={{ background: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.30)", color: "#ef4444" }}>
            <Icon d="M12 2v3M17 4.5l-2.5 2M22 9.5h-3M17 14.5l-2.5-2M12 16v3M7 14.5l2.5-2M2 9.5h3M7 4.5l2.5 2M12 9a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" size={20} />
          </div>
          <div>
            <div className="page-title">Kitchen Display System</div>
            <div className="page-subtitle">Real-time order tracking · Refreshes every 3s</div>
          </div>
        </div>
        <div className="page-actions">
          <div style={{ display: "flex", gap: 8 }}>
            <span className="badge badge-new"><span className="badge-dot" />NEW: {counts.new}</span>
            <span className="badge badge-preparing"><span className="badge-dot" />COOKING: {counts.preparing}</span>
            <span className="badge badge-ready"><span className="badge-dot" />READY: {counts.ready}</span>
          </div>
        </div>
      </div>

      <div className="page-body">
        {isLoading && <div className="loading-state"><div className="spinner" />Loading kitchen orders…</div>}

        {!isLoading && orders.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">🍳</div>
              <p>Kitchen is clear!</p>
              <small>No active orders in queue</small>
            </div>
          </div>
        )}

        <div className="kds-grid">
          {orders.map((o) => (
            <div className={`kds-card status-${o.status.toLowerCase()}`} key={o.id}>
              <div className="kds-card-header">
                <div className="kds-invoice">{o.invoiceNo}</div>
                <span className={`badge badge-${o.status.toLowerCase()}`}>
                  <span className="badge-dot" />{o.status}
                </span>
              </div>

              <div className="kds-meta">
                <span className={`badge badge-${o.orderType.toLowerCase().replace("_", "_")}`}>
                  {o.orderType.replace("_", " ")}
                </span>
                {o.table && (
                  <span className="badge badge-gold">
                    <Icon d="M4 7h16M4 12h16M9 17h6" size={11} />
                    {o.table.name}
                  </span>
                )}
                <span className="text-muted" style={{ fontSize: 11, marginLeft: "auto" }}>
                  {new Date(o.createdAt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div className="kds-items">
                {o.items.map((i, idx) => (
                  <div className="kds-item" key={idx}>
                    <div className="kds-qty">{i.quantity}</div>
                    <div>
                      <div className="kds-item-name">{i.item.name}</div>
                      {i.note && <div className="kds-item-note">📝 {i.note}</div>}
                      {i.item.preparationTime > 0 && (
                        <div className="kds-item-note">⏱ {i.item.preparationTime}m prep</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <ElapsedTimer since={o.createdAt} />

              <div className="kds-actions">
                {o.status === "NEW" && (
                  <button className="btn btn-gold" style={{ flex: 1, justifyContent: "center" }} onClick={() => setStatus(o.id, "PREPARING")}>
                    <Icon d="M5 3l14 9-14 9V3z" size={14} />
                    Start Cooking
                  </button>
                )}
                {o.status === "PREPARING" && (
                  <button className="btn btn-success" style={{ flex: 1, justifyContent: "center" }} onClick={() => setStatus(o.id, "READY")}>
                    <Icon d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" size={14} />
                    Mark Ready
                  </button>
                )}
                {o.status === "READY" && (
                  <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setStatus(o.id, "SERVED")}>
                    <Icon d="M12 22l3.09-6.26L22 14.73l-5 4.87 1.18 6.88L12 22.77" size={14} />
                    Mark Served
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
