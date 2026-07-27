import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders } from "../lib/api";
function Icon({ d, size = 16 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: d }) }));
}
export function TablesPage({ token }) {
    const qc = useQueryClient();
    const { data: tables = [], isLoading } = useQuery({
        queryKey: ["tables"],
        queryFn: async () => (await api.get("/tables", { headers: authHeaders(token) })).data,
        refetchInterval: 5000,
    });
    const updateTable = async (id, data) => {
        await api.patch(`/tables/${id}`, data, { headers: authHeaders(token) });
        qc.invalidateQueries({ queryKey: ["tables"] });
    };
    const statusClass = (t) => {
        if (t.isOccupied)
            return "table-occupied";
        if (t.isReserved)
            return "table-reserved";
        return "table-available";
    };
    const statusLabel = (t) => {
        if (t.isOccupied)
            return "Occupied";
        if (t.isReserved)
            return "Reserved";
        return "Available";
    };
    const counts = {
        available: tables.filter((t) => !t.isOccupied && !t.isReserved).length,
        occupied: tables.filter((t) => t.isOccupied).length,
        reserved: tables.filter((t) => t.isReserved && !t.isOccupied).length,
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { className: "page-header-left", children: [_jsx("div", { className: "page-icon", style: { background: "rgba(59,130,246,0.12)", borderColor: "rgba(59,130,246,0.30)", color: "#3b82f6" }, children: _jsx(Icon, { d: "M4 7h16M4 12h16M9 17h6M3 4h18v2H3zM3 18h18v2H3z", size: 20 }) }), _jsxs("div", { children: [_jsx("div", { className: "page-title", children: "Dining Tables" }), _jsx("div", { className: "page-subtitle", children: "Visual floor layout \u00B7 Live status" })] })] }), _jsxs("div", { className: "page-actions", children: [_jsxs("span", { className: "badge badge-success", children: [_jsx("span", { className: "badge-dot" }), "Available: ", counts.available] }), _jsxs("span", { className: "badge badge-danger", children: [_jsx("span", { className: "badge-dot" }), "Occupied: ", counts.occupied] }), _jsxs("span", { className: "badge badge-gold", children: [_jsx("span", { className: "badge-dot" }), "Reserved: ", counts.reserved] })] })] }), _jsxs("div", { className: "page-body", children: [isLoading && _jsxs("div", { className: "loading-state", children: [_jsx("div", { className: "spinner" }), "Loading floor plan\u2026"] }), _jsx("div", { className: "table-floor-grid", children: tables.map((t) => (_jsxs("div", { className: `table-card ${statusClass(t)}`, children: [_jsx("div", { className: "table-icon", children: t.isOccupied ? "🍽️" : t.isReserved ? "📋" : "🪑" }), _jsx("div", { className: "table-name", children: t.name }), _jsxs("div", { className: "table-capacity", children: [_jsx(Icon, { d: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8z", size: 11 }), " ", t.capacity, " seats"] }), _jsx("div", { className: "table-status-label", children: statusLabel(t) }), _jsxs("div", { className: "table-card-actions", children: [!t.isOccupied && !t.isReserved && (_jsx("button", { className: "btn btn-crimson btn-sm", onClick: () => updateTable(t.id, { isOccupied: true }), children: "Occupy" })), t.isOccupied && (_jsx("button", { className: "btn btn-success btn-sm", onClick: () => updateTable(t.id, { isOccupied: false }), children: "Free Up" })), !t.isReserved && !t.isOccupied && (_jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => updateTable(t.id, { isReserved: true }), children: "Reserve" })), t.isReserved && !t.isOccupied && (_jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => updateTable(t.id, { isReserved: false }), children: "Unreserve" }))] })] }, t.id))) }), tables.length === 0 && !isLoading && (_jsx("div", { className: "card", children: _jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-state-icon", children: "\uD83E\uDE91" }), _jsx("p", { children: "No tables configured" }), _jsx("small", { children: "Add tables from the Settings page" })] }) }))] })] }));
}
