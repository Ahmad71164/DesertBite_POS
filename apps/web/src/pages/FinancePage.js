import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { api, authHeaders, formatRs } from "../lib/api";
import { PageHeader } from "../App";
function Icon({ d, size = 18 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: d }) }));
}
export function FinancePage({ token }) {
    const { data: records = [], isLoading } = useQuery({
        queryKey: ["finance"],
        queryFn: async () => (await api.get("/finance", { headers: authHeaders(token) })).data,
    });
    const income = records.filter((r) => r.type === "INCOME").reduce((s, r) => s + r.amount, 0);
    const expense = records.filter((r) => r.type === "EXPENSE").reduce((s, r) => s + r.amount, 0);
    const profit = income - expense;
    // Group by category for chart
    const catMap = {};
    records.forEach((r) => {
        if (!catMap[r.category])
            catMap[r.category] = { income: 0, expense: 0 };
        if (r.type === "INCOME")
            catMap[r.category].income += r.amount;
        else
            catMap[r.category].expense += r.amount;
    });
    const chartData = Object.keys(catMap).map((cat) => ({
        category: cat,
        income: Math.round(catMap[cat].income),
        expense: Math.round(catMap[cat].expense),
    }));
    return (_jsxs(_Fragment, { children: [_jsx(PageHeader, { title: "Finance & P&L", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" }), _jsxs("div", { className: "page-body", children: [_jsxs("div", { className: "kpi-grid", style: { marginBottom: 16 }, children: [_jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#10b981" }, children: [_jsx("div", { className: "kpi-icon", children: _jsx(Icon, { d: "M22 12h-4l-3 9L9 3l-3 9H2", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Total Revenue" }), _jsx("div", { className: "kpi-value", children: formatRs(income) })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#ef4444" }, children: [_jsx("div", { className: "kpi-icon", children: _jsx(Icon, { d: "M22 12h-4l-3 9L9 3l-3 9H2", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Total Expenses" }), _jsx("div", { className: "kpi-value", children: formatRs(expense) })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": profit >= 0 ? "#10b981" : "#ef4444" }, children: [_jsx("div", { className: "kpi-icon", children: _jsx(Icon, { d: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Net Profit" }), _jsx("div", { className: "kpi-value", style: { color: profit >= 0 ? "var(--success)" : "var(--danger)" }, children: formatRs(profit) })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#3b82f6" }, children: [_jsx("div", { className: "kpi-icon", children: _jsx(Icon, { d: "M9 14l6-6M9 8h.01M15 14h.01", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Profit Margin" }), _jsx("div", { className: "kpi-value", children: income > 0 ? `${Math.round((profit / income) * 100)}%` : "—" })] })] }), _jsxs("div", { className: "card", style: { marginBottom: 16 }, children: [_jsx("div", { className: "card-header", children: _jsxs("span", { className: "card-title", children: [_jsx(Icon, { d: "M18 20V10M12 20V4M6 20v-6", size: 14 }), "Revenue vs Expenses by Category"] }) }), _jsx("div", { className: "card-body", children: _jsx(ResponsiveContainer, { width: "100%", height: 240, children: _jsxs(BarChart, { data: chartData, margin: { top: 5, right: 20, left: 0, bottom: 0 }, children: [_jsx(CartesianGrid, { stroke: "rgba(255,255,255,0.05)", strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "category", tick: { fill: "#6b6b85", fontSize: 11 }, tickLine: false, axisLine: false }), _jsx(YAxis, { tick: { fill: "#6b6b85", fontSize: 10 }, tickLine: false, axisLine: false, tickFormatter: (v) => `${v / 1000}k` }), _jsx(Tooltip, { formatter: (v) => formatRs(v), contentStyle: { background: "rgba(16,16,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }, labelStyle: { color: "#a8a8c0" }, itemStyle: { color: "#f1f1f5" } }), _jsx(Bar, { dataKey: "income", name: "Revenue", fill: "#10b981", radius: [4, 4, 0, 0] }), _jsx(Bar, { dataKey: "expense", name: "Expense", fill: "#ef4444", radius: [4, 4, 0, 0] })] }) }) })] }), isLoading ? (_jsxs("div", { className: "loading-state", children: [_jsx("div", { className: "spinner" }), " Loading financial records\u2026"] })) : (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "card-header", children: [_jsx("span", { className: "card-title", children: "Financial Ledger" }), _jsxs("span", { style: { fontSize: "0.78rem", color: "var(--muted)" }, children: [records.length, " records"] })] }), _jsx("div", { className: "table-container", children: _jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Date" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Category" }), _jsx("th", { children: "Description" }), _jsx("th", { children: "Payment" }), _jsx("th", { children: "Amount" })] }) }), _jsx("tbody", { children: records.slice(0, 100).map((r) => (_jsxs("tr", { children: [_jsx("td", { style: { fontSize: "0.78rem", color: "var(--muted)" }, children: new Date(r.date).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" }) }), _jsx("td", { children: _jsx("span", { className: `badge ${r.type === "INCOME" ? "badge-success" : "badge-danger"}`, children: r.type }) }), _jsx("td", { style: { color: "var(--fg-2)", fontSize: "0.82rem" }, children: r.category }), _jsx("td", { style: { color: "var(--fg-2)", fontSize: "0.82rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: r.description || "—" }), _jsx("td", { children: r.paymentMethod ? (_jsx("span", { className: "badge badge-info", children: r.paymentMethod })) : _jsx("span", { style: { color: "var(--muted)" }, children: "\u2014" }) }), _jsxs("td", { style: { fontWeight: 700, color: r.type === "INCOME" ? "var(--success)" : "var(--danger)" }, children: [r.type === "INCOME" ? "+" : "−", formatRs(r.amount)] })] }, r.id))) })] }) })] }))] })] }));
}
