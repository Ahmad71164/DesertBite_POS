import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders, formatRs } from "../lib/api";
import { fetchAndPrintReceipt } from "../components/ReceiptModal";
function Icon({ d, size = 16 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: d }) }));
}
const STATUSES = ["NEW", "PREPARING", "READY", "SERVED", "DELIVERED", "COMPLETED", "CANCELLED"];
const STATUS_COLORS = {
    NEW: "#8b5cf6", PREPARING: "#f59e0b", READY: "#10b981",
    SERVED: "#3b82f6", DELIVERED: "#06b6d4", COMPLETED: "#10b981", CANCELLED: "#ef4444",
};
export function OrdersPage({ token }) {
    const qc = useQueryClient();
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => (await api.get("/orders", { headers: authHeaders(token) })).data,
        refetchInterval: 5000,
    });
    const updateStatus = async (id, status) => {
        await api.patch(`/orders/${id}/status`, { status }, { headers: authHeaders(token) });
        qc.invalidateQueries({ queryKey: ["orders"] });
        qc.invalidateQueries({ queryKey: ["summary"] });
    };
    const printReceipt = async (id) => {
        try {
            await fetchAndPrintReceipt(id, token);
        }
        catch {
            alert("Could not print receipt. Is API running?");
        }
    };
    const filtered = orders.filter((o) => {
        const matchSearch = search === "" || o.invoiceNo.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "ALL" || o.status === filterStatus;
        return matchSearch && matchStatus;
    });
    const countByStatus = (s) => orders.filter((o) => o.status === s).length;
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { className: "page-header-left", children: [_jsx("div", { className: "page-icon", children: _jsx(Icon, { d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2", size: 20 }) }), _jsxs("div", { children: [_jsx("div", { className: "page-title", children: "Order Management" }), _jsxs("div", { className: "page-subtitle", children: [orders.length, " total orders \u00B7 Auto-refreshing every 5s"] })] })] }), _jsx("div", { className: "page-actions", children: _jsx("input", { style: { width: 200 }, placeholder: "Search invoice\u2026", value: search, onChange: (e) => setSearch(e.target.value) }) })] }), _jsxs("div", { className: "page-body", children: [_jsxs("div", { className: "pill-tabs", style: { marginBottom: 16 }, children: [_jsxs("button", { className: `pill-tab ${filterStatus === "ALL" ? "active" : ""}`, onClick: () => setFilterStatus("ALL"), children: ["All ", _jsx("span", { className: "badge badge-gold", style: { marginLeft: 4 }, children: orders.length })] }), STATUSES.map((s) => (_jsxs("button", { className: `pill-tab ${filterStatus === s ? "active" : ""}`, onClick: () => setFilterStatus(s), children: [s, countByStatus(s) > 0 && _jsx("span", { style: { marginLeft: 5, background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "0 5px", fontSize: 10, fontWeight: 700 }, children: countByStatus(s) })] }, s)))] }), _jsxs("div", { className: "card", children: [isLoading && (_jsxs("div", { className: "loading-state", children: [_jsx("div", { className: "spinner" }), "Loading orders\u2026"] })), _jsxs("div", { className: "table-wrap", children: [_jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Invoice" }), _jsx("th", { children: "Items" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Payment" }), _jsx("th", { children: "Total" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Time" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: filtered.map((o) => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("div", { className: "mono", children: o.invoiceNo }), _jsx("div", { className: "text-muted", style: { fontSize: 11, marginTop: 2 }, children: new Date(o.createdAt).toLocaleDateString() })] }), _jsx("td", { style: { maxWidth: 200 }, children: _jsx("div", { style: { fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }, children: o.items.map((i) => `${i.item.name} ×${i.quantity}`).join(", ") }) }), _jsx("td", { children: _jsx("span", { className: `badge badge-${o.orderType.toLowerCase()}`, children: o.orderType.replace("_", " ") }) }), _jsx("td", { style: { fontSize: 12, color: "var(--fg-2)" }, children: o.paymentMethod || "—" }), _jsx("td", { style: { fontFamily: "var(--font-mono)", fontWeight: 800, color: "var(--gold)" }, children: formatRs(o.total) }), _jsx("td", { children: _jsxs("span", { className: `badge badge-${o.status.toLowerCase()}`, style: { "--badge-bg": STATUS_COLORS[o.status] }, children: [_jsx("span", { className: "badge-dot" }), o.status] }) }), _jsx("td", { style: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)" }, children: new Date(o.createdAt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) }), _jsx("td", { children: _jsxs("div", { style: { display: "flex", gap: 6 }, children: [_jsx("select", { value: o.status, onChange: (e) => updateStatus(o.id, e.target.value), style: { fontSize: 12, padding: "5px 8px", width: 120 }, children: STATUSES.map((s) => _jsx("option", { value: s, children: s }, s)) }), _jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => printReceipt(o.id), title: "Print Receipt", children: _jsx(Icon, { d: "M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z", size: 13 }) })] }) })] }, o.id))) })] }), filtered.length === 0 && !isLoading && (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-state-icon", children: "\uD83D\uDCCB" }), _jsx("p", { children: filterStatus === "ALL" ? "No orders yet" : `No ${filterStatus} orders` }), _jsx("small", { children: "Create orders from the POS terminal" })] }))] })] })] })] }));
}
