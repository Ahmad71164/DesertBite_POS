import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import { api, authHeaders, formatRs } from "../lib/api";

type SaleRow = { createdAt: string; total: number; invoiceNo: string };

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function ReportsPage({ token }: { token: string }) {
  const [period, setPeriod] = useState("daily");

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["sales", period],
    queryFn: async () =>
      (await api.get<SaleRow[]>(`/reports/sales?period=${period}`, { headers: authHeaders(token) })).data,
  });

  const totalRevenue = sales.reduce((s, r) => s + r.total, 0);
  const avgOrder = sales.length ? totalRevenue / sales.length : 0;
  const chartData = sales.map((s, i) => ({
    name: s.invoiceNo.slice(-6) || `#${i + 1}`,
    total: s.total,
  }));

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon" style={{ background: "rgba(139,92,246,0.15)", borderColor: "rgba(139,92,246,0.3)", color: "#8b5cf6" }}>
            <Icon d="M18 20V10M12 20V4M6 20v-6" size={20} />
          </div>
          <div>
            <div className="page-title">Reports & Analytics</div>
            <div className="page-subtitle">Revenue reporting, sales breakdowns & trends</div>
          </div>
        </div>
        <div className="page-actions">
          <div className="pill-tabs">
            {["daily", "weekly", "monthly", "yearly"].map((p) => (
              <button key={p} className={period === p ? "pill-tab active" : "pill-tab"} onClick={() => setPeriod(p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="kpi-grid">
          <div className="kpi-card glow-gold" style={{ "--kpi-color": "var(--gold)" } as React.CSSProperties}>
            <div className="kpi-icon-wrap">
              <Icon d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" size={18} />
            </div>
            <div className="kpi-label">Total Revenue ({period})</div>
            <div className="kpi-value">{formatRs(totalRevenue)}</div>
          </div>

          <div className="kpi-card" style={{ "--kpi-color": "#3b82f6" } as React.CSSProperties}>
            <div className="kpi-icon-wrap">
              <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" size={18} />
            </div>
            <div className="kpi-label">Total Orders</div>
            <div className="kpi-value">{sales.length}</div>
          </div>

          <div className="kpi-card" style={{ "--kpi-color": "#10b981" } as React.CSSProperties}>
            <div className="kpi-icon-wrap">
              <Icon d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={18} />
            </div>
            <div className="kpi-label">Average Order Ticket</div>
            <div className="kpi-value">{formatRs(avgOrder)}</div>
          </div>
        </div>

        {/* Visual Chart */}
        <div className="card card-p">
          <div className="card-title" style={{ marginBottom: 16 }}>
            <Icon d="M22 12h-4l-3 9L9 3l-3 9H2" size={16} />
            Sales Trend Analysis ({period.toUpperCase()})
          </div>

          {isLoading ? (
            <div className="loading-state"><div className="spinner" />Generating graph data...</div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "var(--fg-3)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--fg-3)", fontSize: 11 }} tickFormatter={(v) => `${v}`} />
                <Tooltip
                  formatter={(v: number) => [formatRs(v), "Revenue"]}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border-gold)", borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="total" stroke="var(--gold)" strokeWidth={3} fill="url(#reportGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📈</div>
              <p>No sales records found for this period</p>
              <small>Process orders in the POS to populate report charts</small>
            </div>
          )}
        </div>

        {/* Detailed Transactions List */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" size={16} />
              Sales Transaction Log
            </span>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Date & Time</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.invoiceNo}>
                    <td className="mono">{s.invoiceNo}</td>
                    <td className="text-muted">{new Date(s.createdAt).toLocaleString()}</td>
                    <td className="font-mono font-bold text-gold">{formatRs(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
