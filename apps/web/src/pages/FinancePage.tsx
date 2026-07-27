import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { api, authHeaders, formatRs } from "../lib/api";
import { PageHeader } from "../App";

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function FinancePage({ token }: { token: string }) {
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["finance"],
    queryFn: async () => (await api.get("/finance", { headers: authHeaders(token) })).data,
  });

  const income = records.filter((r: any) => r.type === "INCOME").reduce((s: number, r: any) => s + r.amount, 0);
  const expense = records.filter((r: any) => r.type === "EXPENSE").reduce((s: number, r: any) => s + r.amount, 0);
  const profit = income - expense;

  // Group by category for chart
  const catMap: Record<string, { income: number; expense: number }> = {};
  records.forEach((r: any) => {
    if (!catMap[r.category]) catMap[r.category] = { income: 0, expense: 0 };
    if (r.type === "INCOME") catMap[r.category].income += r.amount;
    else catMap[r.category].expense += r.amount;
  });
  const chartData = Object.keys(catMap).map((cat) => ({
    category: cat,
    income: Math.round(catMap[cat].income),
    expense: Math.round(catMap[cat].expense),
  }));

  return (
    <>
      <PageHeader title="Finance & P&L" icon="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6">
      </PageHeader>

      <div className="page-body">
        <div className="kpi-grid" style={{ marginBottom: 16 }}>
          <div className="kpi-card" style={{ "--kpi-color": "#10b981" } as React.CSSProperties}>
            <div className="kpi-icon"><Icon d="M22 12h-4l-3 9L9 3l-3 9H2" size={16} /></div>
            <div className="kpi-label">Total Revenue</div>
            <div className="kpi-value">{formatRs(income)}</div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "#ef4444" } as React.CSSProperties}>
            <div className="kpi-icon"><Icon d="M22 12h-4l-3 9L9 3l-3 9H2" size={16} /></div>
            <div className="kpi-label">Total Expenses</div>
            <div className="kpi-value">{formatRs(expense)}</div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": profit >= 0 ? "#10b981" : "#ef4444" } as React.CSSProperties}>
            <div className="kpi-icon"><Icon d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" size={16} /></div>
            <div className="kpi-label">Net Profit</div>
            <div className="kpi-value" style={{ color: profit >= 0 ? "var(--success)" : "var(--danger)" }}>
              {formatRs(profit)}
            </div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "#3b82f6" } as React.CSSProperties}>
            <div className="kpi-icon"><Icon d="M9 14l6-6M9 8h.01M15 14h.01" size={16} /></div>
            <div className="kpi-label">Profit Margin</div>
            <div className="kpi-value">
              {income > 0 ? `${Math.round((profit / income) * 100)}%` : "—"}
            </div>
          </div>
        </div>

        {/* P&L Bar Chart */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <span className="card-title">
              <Icon d="M18 20V10M12 20V4M6 20v-6" size={14} />
              Revenue vs Expenses by Category
            </span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fill: "#6b6b85", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#6b6b85", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  formatter={(v: number) => formatRs(v)}
                  contentStyle={{ background: "rgba(16,16,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }}
                  labelStyle={{ color: "#a8a8c0" }}
                  itemStyle={{ color: "#f1f1f5" }}
                />
                <Bar dataKey="income" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Records table */}
        {isLoading ? (
          <div className="loading-state"><div className="spinner" /> Loading financial records…</div>
        ) : (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Financial Ledger</span>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{records.length} records</span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Payment</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 100).map((r: any) => (
                    <tr key={r.id}>
                      <td style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        {new Date(r.date).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td>
                        <span className={`badge ${r.type === "INCOME" ? "badge-success" : "badge-danger"}`}>
                          {r.type}
                        </span>
                      </td>
                      <td style={{ color: "var(--fg-2)", fontSize: "0.82rem" }}>{r.category}</td>
                      <td style={{ color: "var(--fg-2)", fontSize: "0.82rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.description || "—"}
                      </td>
                      <td>
                        {r.paymentMethod ? (
                          <span className="badge badge-info">{r.paymentMethod}</span>
                        ) : <span style={{ color: "var(--muted)" }}>—</span>}
                      </td>
                      <td style={{ fontWeight: 700, color: r.type === "INCOME" ? "var(--success)" : "var(--danger)" }}>
                        {r.type === "INCOME" ? "+" : "−"}{formatRs(r.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
