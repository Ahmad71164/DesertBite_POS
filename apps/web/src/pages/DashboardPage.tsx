import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";
import { api, authHeaders, formatRs } from "../lib/api";

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const CHART_COLORS = ["#f59e0b", "#dc2626", "#10b981", "#3b82f6", "#8b5cf6", "#06b6d4", "#ec4899", "#f97316"];

const KPI_DEFS = [
  { key: "todaySales",      label: "Today's Sales",  isMoney: true,  icon: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6", color: "#f59e0b" },
  { key: "weeklySales",     label: "This Week",      isMoney: true,  icon: "M18 20V10M12 20V4M6 20v-6", color: "#dc2626" },
  { key: "monthlySales",    label: "This Month",     isMoney: true,  icon: "M3 3h18v18H3zM3 9h18M9 21V9", color: "#8b5cf6" },
  { key: "netProfit",       label: "Net Profit",     isMoney: true,  icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", color: "#10b981" },
  { key: "totalOrders",     label: "Total Orders",   isMoney: false, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2", color: "#3b82f6" },
  { key: "pendingOrders",   label: "Active Orders",  isMoney: false, icon: "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6", color: "#f97316" },
  { key: "completedOrders", label: "Completed",      isMoney: false, icon: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3", color: "#10b981" },
  { key: "customersCount",  label: "Customers",      isMoney: false, icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8z", color: "#06b6d4" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border-gold)", borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", color: "var(--fg)" }}>
      <p style={{ color: "var(--fg-3)", marginBottom: 4, fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 700 }}>
          {p.name}: {typeof p.value === "number" && p.value > 1000 ? formatRs(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export function DashboardPage({ token, onThemeToggle, theme }: { token: string; onThemeToggle: () => void; theme: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => (await api.get("/dashboard/summary", { headers: authHeaders(token) })).data,
    refetchInterval: 15000,
  });

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" size={20} />
          </div>
          <div>
            <div className="page-title">Executive Dashboard</div>
            <div className="page-subtitle">
              {new Date().toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={onThemeToggle}>
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <Link to="/reports" className="btn btn-gold btn-sm">
            <Icon d="M18 20V10M12 20V4M6 20v-6" size={14} />
            Full Report
          </Link>
        </div>
      </div>

      <div className="page-body">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner" />
            Loading analytics…
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="kpi-grid">
              {KPI_DEFS.map((kpi) => {
                const raw = data?.[kpi.key] ?? 0;
                const value = kpi.isMoney ? formatRs(Number(raw)) : Number(raw).toLocaleString();
                return (
                  <div className="kpi-card" key={kpi.key} style={{ "--kpi-color": kpi.color } as React.CSSProperties}>
                    <div className="kpi-icon-wrap">
                      <Icon d={kpi.icon} size={16} />
                    </div>
                    <div className="kpi-label">{kpi.label}</div>
                    <div className="kpi-value">{value}</div>
                  </div>
                );
              })}
            </div>

            {/* Charts Row 1 */}
            <div className="chart-grid">
              <div className="card">
                <div className="card-header">
                  <span className="card-title">
                    <Icon d="M22 12h-4l-3 9L9 3l-3 9H2" size={15} />
                    24-Hour Sales Trend
                  </span>
                  <span className="badge badge-gold">LIVE</span>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data?.hourlyChart || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tick={{ fill: "var(--fg-3)", fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                      <YAxis tick={{ fill: "var(--fg-3)", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => v === 0 ? "" : `${v / 1000}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="sales" name="Sales" stroke="#f59e0b" strokeWidth={2.5} fill="url(#goldGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title">
                    <Icon d="M21.21 15.89A10 10 0 118 2.83" size={15} />
                    Category Mix
                  </span>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={data?.categoryChart || []} cx="45%" cy="50%" innerRadius={52} outerRadius={85} paddingAngle={3} dataKey="value">
                        {(data?.categoryChart || []).map((_: any, i: number) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => [formatRs(val), "Sales"]}
                        contentStyle={{ background: "var(--card)", border: "1px solid var(--border-gold)", borderRadius: 10, fontSize: "0.8rem", color: "var(--fg)" }} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" iconSize={8} iconType="circle"
                        formatter={(v) => <span style={{ fontSize: "0.7rem", color: "var(--fg-2)" }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="chart-grid">
              <div className="card">
                <div className="card-header">
                  <span className="card-title">
                    <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10" size={15} />
                    Branch Performance
                  </span>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data?.branchChart || []} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fill: "var(--fg-3)", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: "var(--fg-3)", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="sales" name="Revenue" fill="#dc2626" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title">
                    <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8z" size={15} />
                    Staff Leaderboard
                  </span>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={(data?.staffChart || []).slice(0, 6)} layout="vertical" margin={{ top: 0, right: 20, left: 64, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fill: "var(--fg-3)", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                      <YAxis type="category" dataKey="name" tick={{ fill: "var(--fg-2)", fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="sales" name="Sales" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">
                  <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" size={15} />
                  Recent Orders
                </span>
                <Link to="/orders" className="btn btn-ghost btn-sm">View All →</Link>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.recentOrders || []).map((o: any) => (
                      <tr key={o.id}>
                        <td className="mono">{o.invoiceNo}</td>
                        <td>{o.customer?.name || <span className="text-muted">Walk-in</span>}</td>
                        <td><span className={`badge badge-${(o.orderType || "").toLowerCase().replace("_", "_")}`}>{o.orderType?.replace("_", " ")}</span></td>
                        <td>
                          <span className={`badge badge-${(o.status || "").toLowerCase()}`}>
                            <span className="badge-dot" />
                            {o.status}
                          </span>
                        </td>
                        <td className="font-bold">{formatRs(o.total)}</td>
                        <td className="text-muted" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                          {new Date(o.createdAt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!data?.recentOrders?.length) && (
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <p>No orders yet today</p>
                    <small>Create an order from the POS terminal</small>
                  </div>
                )}
              </div>
            </div>

            {/* Alert Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {(data?.lowStockCount ?? 0) > 0 && (
                <Link to="/inventory" style={{ textDecoration: "none" }}>
                  <div className="card card-p alert-danger" style={{ cursor: "pointer" }}>
                    <div style={{ fontWeight: 800, marginBottom: 4 }}>⚠ Low Stock Alert</div>
                    <div style={{ fontSize: 13 }}>{data.lowStockCount} items below threshold — Click to view</div>
                  </div>
                </Link>
              )}
              <div className="card card-p alert-success">
                <div style={{ fontWeight: 800, marginBottom: 4 }}>💰 Tax Collected</div>
                <div style={{ fontSize: 13 }}>{formatRs(data?.taxCollected ?? 0)} today</div>
              </div>
              <div className="card card-p alert-info">
                <div style={{ fontWeight: 800, marginBottom: 4 }}>📊 Avg Order Value</div>
                <div style={{ fontSize: 13 }}>{formatRs(data?.avgOrderValue ?? 0)} per order</div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
