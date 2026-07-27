import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders } from "../lib/api";
function Icon({ d, size = 16 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: d }) }));
}
function ElapsedTimer({ since }) {
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
    return _jsx("div", { className: `kds-timer ${cls}`, children: label });
}
export function KitchenPage({ token }) {
    const qc = useQueryClient();
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["kds"],
        queryFn: async () => (await api.get("/kds", { headers: authHeaders(token) })).data,
        refetchInterval: 3000,
    });
    const setStatus = async (id, status) => {
        await api.patch(`/orders/${id}/status`, { status }, { headers: authHeaders(token) });
        qc.invalidateQueries({ queryKey: ["kds"] });
        qc.invalidateQueries({ queryKey: ["orders"] });
    };
    const counts = {
        new: orders.filter((o) => o.status === "NEW").length,
        preparing: orders.filter((o) => o.status === "PREPARING").length,
        ready: orders.filter((o) => o.status === "READY").length,
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { className: "page-header-left", children: [_jsx("div", { className: "page-icon", style: { background: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.30)", color: "#ef4444" }, children: _jsx(Icon, { d: "M12 2v3M17 4.5l-2.5 2M22 9.5h-3M17 14.5l-2.5-2M12 16v3M7 14.5l2.5-2M2 9.5h3M7 4.5l2.5 2M12 9a2.5 2.5 0 100 5 2.5 2.5 0 000-5z", size: 20 }) }), _jsxs("div", { children: [_jsx("div", { className: "page-title", children: "Kitchen Display System" }), _jsx("div", { className: "page-subtitle", children: "Real-time order tracking \u00B7 Refreshes every 3s" })] })] }), _jsx("div", { className: "page-actions", children: _jsxs("div", { style: { display: "flex", gap: 8 }, children: [_jsxs("span", { className: "badge badge-new", children: [_jsx("span", { className: "badge-dot" }), "NEW: ", counts.new] }), _jsxs("span", { className: "badge badge-preparing", children: [_jsx("span", { className: "badge-dot" }), "COOKING: ", counts.preparing] }), _jsxs("span", { className: "badge badge-ready", children: [_jsx("span", { className: "badge-dot" }), "READY: ", counts.ready] })] }) })] }), _jsxs("div", { className: "page-body", children: [isLoading && _jsxs("div", { className: "loading-state", children: [_jsx("div", { className: "spinner" }), "Loading kitchen orders\u2026"] }), !isLoading && orders.length === 0 && (_jsx("div", { className: "card", children: _jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-state-icon", children: "\uD83C\uDF73" }), _jsx("p", { children: "Kitchen is clear!" }), _jsx("small", { children: "No active orders in queue" })] }) })), _jsx("div", { className: "kds-grid", children: orders.map((o) => (_jsxs("div", { className: `kds-card status-${o.status.toLowerCase()}`, children: [_jsxs("div", { className: "kds-card-header", children: [_jsx("div", { className: "kds-invoice", children: o.invoiceNo }), _jsxs("span", { className: `badge badge-${o.status.toLowerCase()}`, children: [_jsx("span", { className: "badge-dot" }), o.status] })] }), _jsxs("div", { className: "kds-meta", children: [_jsx("span", { className: `badge badge-${o.orderType.toLowerCase().replace("_", "_")}`, children: o.orderType.replace("_", " ") }), o.table && (_jsxs("span", { className: "badge badge-gold", children: [_jsx(Icon, { d: "M4 7h16M4 12h16M9 17h6", size: 11 }), o.table.name] })), _jsx("span", { className: "text-muted", style: { fontSize: 11, marginLeft: "auto" }, children: new Date(o.createdAt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) })] }), _jsx("div", { className: "kds-items", children: o.items.map((i, idx) => (_jsxs("div", { className: "kds-item", children: [_jsx("div", { className: "kds-qty", children: i.quantity }), _jsxs("div", { children: [_jsx("div", { className: "kds-item-name", children: i.item.name }), i.note && _jsxs("div", { className: "kds-item-note", children: ["\uD83D\uDCDD ", i.note] }), i.item.preparationTime > 0 && (_jsxs("div", { className: "kds-item-note", children: ["\u23F1 ", i.item.preparationTime, "m prep"] }))] })] }, idx))) }), _jsx(ElapsedTimer, { since: o.createdAt }), _jsxs("div", { className: "kds-actions", children: [o.status === "NEW" && (_jsxs("button", { className: "btn btn-gold", style: { flex: 1, justifyContent: "center" }, onClick: () => setStatus(o.id, "PREPARING"), children: [_jsx(Icon, { d: "M5 3l14 9-14 9V3z", size: 14 }), "Start Cooking"] })), o.status === "PREPARING" && (_jsxs("button", { className: "btn btn-success", style: { flex: 1, justifyContent: "center" }, onClick: () => setStatus(o.id, "READY"), children: [_jsx(Icon, { d: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3", size: 14 }), "Mark Ready"] })), o.status === "READY" && (_jsxs("button", { className: "btn btn-ghost", style: { flex: 1, justifyContent: "center" }, onClick: () => setStatus(o.id, "SERVED"), children: [_jsx(Icon, { d: "M12 22l3.09-6.26L22 14.73l-5 4.87 1.18 6.88L12 22.77", size: 14 }), "Mark Served"] }))] })] }, o.id))) })] })] }));
}
