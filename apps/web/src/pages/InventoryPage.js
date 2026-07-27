import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders } from "../lib/api";
function Icon({ d, size = 16 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: d }) }));
}
export function InventoryPage({ token }) {
    const qc = useQueryClient();
    const [name, setName] = useState("");
    const [stock, setStock] = useState(10);
    const [unit, setUnit] = useState("kg");
    const [lowAlert, setLowAlert] = useState(5);
    const { data: items = [], isLoading } = useQuery({
        queryKey: ["inventory"],
        queryFn: async () => (await api.get("/inventory", { headers: authHeaders(token) })).data,
    });
    const lowStockItems = items.filter((i) => i.stockLevel <= i.lowStockLevel);
    const addItem = async () => {
        if (!name)
            return;
        await api.post("/inventory", { name, stockLevel: stock, unit, lowStockLevel: lowAlert }, { headers: authHeaders(token) });
        setName("");
        setStock(10);
        qc.invalidateQueries({ queryKey: ["inventory"] });
    };
    const adjustStock = async (id, current, delta) => {
        await api.patch(`/inventory/${id}`, { stockLevel: Math.max(0, current + delta) }, { headers: authHeaders(token) });
        qc.invalidateQueries({ queryKey: ["inventory"] });
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { className: "page-header-left", children: [_jsx("div", { className: "page-icon", style: { background: "rgba(245,158,11,0.15)", borderColor: "var(--border-gold)", color: "var(--gold)" }, children: _jsx(Icon, { d: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", size: 20 }) }), _jsxs("div", { children: [_jsx("div", { className: "page-title", children: "Inventory & Ingredients" }), _jsxs("div", { className: "page-subtitle", children: [items.length, " ingredients tracked \u00B7 Real-time alerts"] })] })] }), _jsx("div", { className: "page-actions", children: lowStockItems.length > 0 ? (_jsxs("span", { className: "badge badge-danger", children: [_jsx("span", { className: "badge-dot" }), " ", lowStockItems.length, " Low Stock Alert(s)"] })) : (_jsxs("span", { className: "badge badge-success", children: [_jsx("span", { className: "badge-dot" }), " All Stock Levels Healthy"] })) })] }), _jsxs("div", { className: "page-body", children: [lowStockItems.length > 0 && (_jsxs("div", { className: "alert-banner alert-danger", children: [_jsx(Icon, { d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", size: 18 }), _jsxs("div", { children: [_jsx("strong", { children: "Low Stock Items Requiring Restock:" }), " ", lowStockItems.map((i) => `${i.name} (${i.stockLevel} ${i.unit})`).join(" · ")] })] })), _jsxs("div", { className: "card card-p", children: [_jsxs("div", { className: "card-title", style: { marginBottom: 14 }, children: [_jsx(Icon, { d: "M12 4v16m8-8H4", size: 16 }), "Add New Ingredient / Inventory Item"] }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Item / Ingredient Name" }), _jsx("input", { placeholder: "e.g., Mozzarella Cheese", value: name, onChange: (e) => setName(e.target.value) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Initial Stock" }), _jsx("input", { type: "number", min: 0, value: stock, onChange: (e) => setStock(Number(e.target.value)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Unit" }), _jsx("input", { placeholder: "kg, liters, pcs...", value: unit, onChange: (e) => setUnit(e.target.value) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Low Alert Threshold" }), _jsx("input", { type: "number", min: 0, value: lowAlert, onChange: (e) => setLowAlert(Number(e.target.value)) })] })] }), _jsx("div", { style: { marginTop: 14, display: "flex", justifyContent: "flex-end" }, children: _jsxs("button", { className: "btn btn-gold", onClick: addItem, children: [_jsx(Icon, { d: "M12 4v16m8-8H4", size: 14 }), "Add Stock Entry"] }) })] }), _jsxs("div", { className: "card", children: [isLoading && _jsxs("div", { className: "loading-state", children: [_jsx("div", { className: "spinner" }), "Loading inventory database..."] }), _jsxs("div", { className: "table-wrap", children: [_jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Ingredient" }), _jsx("th", { children: "Current Level" }), _jsx("th", { children: "Low Threshold" }), _jsx("th", { children: "Visual Status" }), _jsx("th", { children: "Restock Actions" })] }) }), _jsx("tbody", { children: items.map((i) => {
                                                    const isCritical = i.stockLevel <= 0;
                                                    const isLow = i.stockLevel <= i.lowStockLevel;
                                                    const percent = Math.min(100, Math.round((i.stockLevel / Math.max(i.lowStockLevel * 3, 1)) * 100));
                                                    return (_jsxs("tr", { className: isLow ? "row-alert" : "", children: [_jsx("td", { className: "font-bold", children: i.name }), _jsx("td", { children: _jsxs("span", { className: "mono font-bold", style: { color: isLow ? "var(--danger)" : "var(--gold)" }, children: [i.stockLevel, " ", i.unit] }) }), _jsxs("td", { className: "text-muted", children: [i.lowStockLevel, " ", i.unit] }), _jsx("td", { style: { minWidth: 160 }, children: _jsxs("div", { className: "stock-bar-wrap", children: [_jsx("div", { className: "stock-bar-bg", children: _jsx("div", { className: `stock-bar-fill ${isCritical ? "stock-critical" : isLow ? "stock-low" : "stock-ok"}`, style: { width: `${percent}%` } }) }), _jsxs("span", { className: "stock-value", children: [percent, "%"] })] }) }), _jsx("td", { children: _jsxs("div", { style: { display: "flex", gap: 6 }, children: [_jsxs("button", { className: "btn btn-ghost btn-sm", onClick: () => adjustStock(i.id, i.stockLevel, 10), children: ["+10 ", i.unit] }), _jsxs("button", { className: "btn btn-ghost btn-sm", onClick: () => adjustStock(i.id, i.stockLevel, 50), children: ["+50 ", i.unit] }), _jsx("button", { className: "btn btn-danger btn-sm", onClick: () => adjustStock(i.id, i.stockLevel, -5), children: "-5" })] }) })] }, i.id));
                                                }) })] }), items.length === 0 && !isLoading && (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-state-icon", children: "\uD83D\uDCE6" }), _jsx("p", { children: "No inventory items registered" }), _jsx("small", { children: "Use the form above to add your first ingredient" })] }))] })] })] })] }));
}
