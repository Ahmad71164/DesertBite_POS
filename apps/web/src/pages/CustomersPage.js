import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders, formatRs } from "../lib/api";
import { PageHeader } from "../App";
function Icon({ d, size = 18 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: d }) }));
}
const TIER_COLORS = {
    SILVER: "var(--fg-3)",
    GOLD: "var(--gold)",
    PLATINUM: "#a78bfa",
};
export function CustomersPage({ token }) {
    const qc = useQueryClient();
    const [search, setSearch] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [editCustomer, setEditCustomer] = useState(null);
    const [viewHistoryCustId, setViewHistoryCustId] = useState(null);
    const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
    const headers = authHeaders(token);
    const { data: customers = [], isLoading } = useQuery({
        queryKey: ["customers"],
        queryFn: async () => (await api.get("/customers", { headers })).data,
    });
    const { data: custHistory } = useQuery({
        queryKey: ["customer-history", viewHistoryCustId],
        queryFn: async () => {
            if (!viewHistoryCustId)
                return null;
            return (await api.get(`/customers/${viewHistoryCustId}`, { headers })).data;
        },
        enabled: !!viewHistoryCustId,
    });
    const createCustomer = async () => {
        if (!form.name || !form.phone)
            return;
        try {
            await api.post("/customers", form, { headers });
            setShowAdd(false);
            setForm({ name: "", phone: "", email: "", address: "" });
            qc.invalidateQueries({ queryKey: ["customers"] });
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to create customer");
        }
    };
    const updateCustomer = async () => {
        if (!editCustomer)
            return;
        try {
            await api.patch(`/customers/${editCustomer.id}`, {
                name: editCustomer.name,
                phone: editCustomer.phone,
                email: editCustomer.email,
                address: editCustomer.address,
            }, { headers });
            setEditCustomer(null);
            qc.invalidateQueries({ queryKey: ["customers"] });
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to update customer");
        }
    };
    const deleteCustomer = async (id) => {
        if (!confirm("Are you sure you want to delete this customer record?"))
            return;
        try {
            await api.delete(`/customers/${id}`, { headers });
            qc.invalidateQueries({ queryKey: ["customers"] });
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to delete customer");
        }
    };
    const filtered = customers.filter((c) => !search ||
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search) ||
        c.email?.toLowerCase().includes(search.toLowerCase()));
    const totalSpending = customers.reduce((sum, c) => sum + (c.totalSpending || 0), 0);
    const totalPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
    const tiers = { SILVER: 0, GOLD: 0, PLATINUM: 0 };
    customers.forEach((c) => {
        if (c.membershipTier && c.membershipTier in tiers) {
            tiers[c.membershipTier]++;
        }
    });
    return (_jsxs(_Fragment, { children: [_jsx(PageHeader, { title: "CRM \u2014 Customers", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 00-8zM23 21v-2a4 4 0 00-3-3.87", children: _jsxs("button", { className: "btn btn-gold btn-sm", onClick: () => { setForm({ name: "", phone: "", email: "", address: "" }); setShowAdd(true); }, children: [_jsx(Icon, { d: "M12 5v14M5 12h14", size: 14 }), "New Customer"] }) }), _jsxs("div", { className: "page-body", children: [_jsxs("div", { className: "kpi-grid", children: [_jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#06b6d4" }, children: [_jsx("div", { className: "kpi-icon-wrap", children: _jsx(Icon, { d: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 00-8z", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Total Customers" }), _jsx("div", { className: "kpi-value", children: customers.length })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": "var(--gold)" }, children: [_jsx("div", { className: "kpi-icon-wrap", children: _jsx(Icon, { d: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Total Customer Spending" }), _jsx("div", { className: "kpi-value", children: formatRs(totalSpending) })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#fbbf24" }, children: [_jsx("div", { className: "kpi-icon-wrap", children: _jsx(Icon, { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Loyalty Points Issued" }), _jsx("div", { className: "kpi-value", children: totalPoints.toLocaleString() })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#a78bfa" }, children: [_jsx("div", { className: "kpi-icon-wrap", children: _jsx(Icon, { d: "M5 3l14 9-14 9V3z", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Platinum VIP Members" }), _jsx("div", { className: "kpi-value", children: tiers.PLATINUM })] })] }), _jsx("div", { style: { maxWidth: 360 }, children: _jsx("input", { placeholder: "Search by name, phone or email\u2026", value: search, onChange: (e) => setSearch(e.target.value) }) }), _jsxs("div", { className: "card", children: [isLoading && _jsxs("div", { className: "loading-state", children: [_jsx("div", { className: "spinner" }), " Loading customer directory\u2026"] }), _jsxs("div", { className: "table-wrap", children: [_jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Customer Name" }), _jsx("th", { children: "Phone Number" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Address" }), _jsx("th", { children: "Tier" }), _jsx("th", { children: "Loyalty Points" }), _jsx("th", { children: "Total Spent" }), _jsx("th", { children: "Orders" }), _jsx("th", { style: { textAlign: "right" }, children: "Actions" })] }) }), _jsx("tbody", { children: filtered.map((c) => (_jsxs("tr", { children: [_jsx("td", { children: _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [_jsx("div", { style: {
                                                                            width: 32, height: 32, borderRadius: "50%",
                                                                            background: "linear-gradient(135deg, var(--gold), #d97706)",
                                                                            display: "grid", placeItems: "center",
                                                                            fontSize: 13, fontWeight: 900, color: "#000", flexShrink: 0
                                                                        }, children: c.name?.charAt(0).toUpperCase() }), _jsx("span", { className: "font-bold", children: c.name })] }) }), _jsx("td", { className: "mono", children: c.phone }), _jsx("td", { className: "text-muted", style: { fontSize: 12 }, children: c.email || "—" }), _jsx("td", { className: "text-muted", style: { fontSize: 12, maxWidth: 160 }, children: c.address || "—" }), _jsx("td", { children: c.membershipTier ? (_jsx("span", { className: "badge", style: { background: "transparent", border: `1px solid ${TIER_COLORS[c.membershipTier] || "var(--border)"}`, color: TIER_COLORS[c.membershipTier] || "var(--fg)" }, children: c.membershipTier })) : (_jsx("span", { className: "text-muted", style: { fontSize: 11 }, children: "STANDARD" })) }), _jsxs("td", { className: "font-bold text-gold", children: [(c.loyaltyPoints || 0).toLocaleString(), " pts"] }), _jsx("td", { className: "font-mono font-bold", children: formatRs(c.totalSpending || 0) }), _jsxs("td", { className: "mono", children: [c.orders?.length ?? 0, " orders"] }), _jsx("td", { children: _jsxs("div", { style: { display: "flex", gap: 6, justifyContent: "flex-end" }, children: [_jsx("button", { className: "btn btn-gold btn-sm", onClick: () => setViewHistoryCustId(c.id), children: "History" }), _jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setEditCustomer(c), children: "Edit" }), _jsx("button", { className: "btn btn-danger btn-sm", onClick: () => deleteCustomer(c.id), children: "Delete" })] }) })] }, c.id))) })] }), filtered.length === 0 && !isLoading && (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-state-icon", children: "\uD83D\uDC65" }), _jsx("p", { children: "No customers found" }), _jsx("small", { children: "Click \"New Customer\" to register a customer" })] }))] })] }), showAdd && (_jsx("div", { className: "modal-overlay", onClick: () => setShowAdd(false), children: _jsxs("div", { className: "modal-card", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("div", { className: "modal-title", children: "Register New Customer" }), _jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setShowAdd(false), children: "\u2715" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Full Name *" }), _jsx("input", { placeholder: "e.g. Ali Ahmed", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Phone Number *" }), _jsx("input", { placeholder: "0300-1234567", value: form.phone, onChange: (e) => setForm({ ...form, phone: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Email Address" }), _jsx("input", { type: "email", placeholder: "customer@example.com", value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Delivery Address" }), _jsx("input", { placeholder: "Street address, city", value: form.address, onChange: (e) => setForm({ ...form, address: e.target.value }) })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { className: "btn btn-ghost", onClick: () => setShowAdd(false), children: "Cancel" }), _jsx("button", { className: "btn btn-gold", onClick: createCustomer, children: "Save Customer" })] })] }) })), editCustomer && (_jsx("div", { className: "modal-overlay", onClick: () => setEditCustomer(null), children: _jsxs("div", { className: "modal-card", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("div", { className: "modal-title", children: "Edit Customer Record" }), _jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setEditCustomer(null), children: "\u2715" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Full Name *" }), _jsx("input", { value: editCustomer.name, onChange: (e) => setEditCustomer({ ...editCustomer, name: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Phone Number *" }), _jsx("input", { value: editCustomer.phone, onChange: (e) => setEditCustomer({ ...editCustomer, phone: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Email Address" }), _jsx("input", { type: "email", value: editCustomer.email || "", onChange: (e) => setEditCustomer({ ...editCustomer, email: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Delivery Address" }), _jsx("input", { value: editCustomer.address || "", onChange: (e) => setEditCustomer({ ...editCustomer, address: e.target.value }) })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { className: "btn btn-ghost", onClick: () => setEditCustomer(null), children: "Cancel" }), _jsx("button", { className: "btn btn-gold", onClick: updateCustomer, children: "Update Customer" })] })] }) })), viewHistoryCustId && custHistory && (_jsx("div", { className: "modal-overlay", onClick: () => setViewHistoryCustId(null), children: _jsxs("div", { className: "modal-card", style: { maxWidth: 640 }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { className: "modal-title", children: ["\uD83D\uDCDC Customer History & Spendings \u2014 ", custHistory.name] }), _jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setViewHistoryCustId(null), children: "\u2715" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "kpi-grid", style: { marginBottom: 16 }, children: [_jsxs("div", { className: "kpi-card", style: { "--kpi-color": "var(--gold)" }, children: [_jsx("div", { className: "kpi-label", children: "Lifetime Spendings" }), _jsx("div", { className: "kpi-value", children: formatRs(custHistory.totalSpending || 0) })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#3b82f6" }, children: [_jsx("div", { className: "kpi-label", children: "Total Orders" }), _jsx("div", { className: "kpi-value", children: custHistory.orders?.length || 0 })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#fbbf24" }, children: [_jsx("div", { className: "kpi-label", children: "Loyalty Points" }), _jsxs("div", { className: "kpi-value", children: [custHistory.loyaltyPoints || 0, " pts"] })] })] }), _jsxs("div", { style: { marginBottom: 12, fontSize: 13, color: "var(--fg-2)" }, children: [_jsxs("div", { children: ["\uD83D\uDCDE Phone: ", _jsx("span", { className: "mono", children: custHistory.phone })] }), custHistory.email && _jsxs("div", { children: ["\u2709 Email: ", custHistory.email] }), custHistory.address && _jsxs("div", { children: ["\uD83D\uDCCD Address: ", custHistory.address] })] }), _jsx("div", { style: { fontWeight: 800, fontSize: 14, marginBottom: 10 }, children: "Order History & Past Purchased Items:" }), _jsxs("div", { className: "table-wrap", children: [_jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Invoice No" }), _jsx("th", { children: "Date" }), _jsx("th", { children: "Items Purchased" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Total" })] }) }), _jsx("tbody", { children: custHistory.orders?.map((o) => (_jsxs("tr", { children: [_jsx("td", { className: "mono", children: o.invoiceNo }), _jsx("td", { className: "text-muted", style: { fontSize: 11 }, children: new Date(o.createdAt).toLocaleDateString() }), _jsx("td", { style: { fontSize: 12 }, children: o.items?.map((i) => `${i.item.name} x${i.quantity}`).join(", ") }), _jsx("td", { children: _jsx("span", { className: `badge badge-${o.status.toLowerCase()}`, children: o.status }) }), _jsx("td", { className: "font-mono font-bold text-gold", children: formatRs(o.total) })] }, o.id))) })] }), (!custHistory.orders || custHistory.orders.length === 0) && (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "No past orders recorded for this customer" }) }))] })] }), _jsx("div", { className: "modal-footer", children: _jsx("button", { className: "btn btn-gold", onClick: () => setViewHistoryCustId(null), children: "Close History" }) })] }) }))] })] }));
}
