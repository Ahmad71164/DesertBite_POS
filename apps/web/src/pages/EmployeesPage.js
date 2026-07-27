import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders } from "../lib/api";
import { PageHeader } from "../App";
function Icon({ d, size = 18 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: d }) }));
}
const ROLE_OPTIONS = [
    { value: "CASHIER", label: "Cashier" },
    { value: "KITCHEN", label: "Kitchen KDS" },
    { value: "MANAGER", label: "Restaurant Manager" },
    { value: "OWNER", label: "Owner" },
    { value: "DELIVERY", label: "Delivery Rider" },
    { value: "SUPER_ADMIN", label: "Super Admin" },
];
const ROLE_COLORS = {
    SUPER_ADMIN: "#ef4444",
    OWNER: "#f97316",
    MANAGER: "#8b5cf6",
    CASHIER: "#3b82f6",
    KITCHEN: "#10b981",
    DELIVERY: "#fbbf24",
};
export function EmployeesPage({ token }) {
    const qc = useQueryClient();
    const [search, setSearch] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "CASHIER",
        branchId: "",
    });
    const { data: users = [], isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: async () => (await api.get("/users", { headers: authHeaders(token) })).data,
    });
    const { data: branches = [] } = useQuery({
        queryKey: ["branches"],
        queryFn: async () => (await api.get("/branches", { headers: authHeaders(token) })).data,
    });
    const createUser = async () => {
        if (!form.name || !form.email || !form.password)
            return;
        try {
            await api.post("/users", {
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
                branchId: form.branchId || undefined,
            }, { headers: authHeaders(token) });
            setShowAdd(false);
            setForm({ name: "", email: "", password: "", role: "CASHIER", branchId: "" });
            qc.invalidateQueries({ queryKey: ["users"] });
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to create employee user");
        }
    };
    const updateUser = async () => {
        if (!editUser)
            return;
        try {
            await api.patch(`/users/${editUser.id}`, {
                name: editUser.name,
                role: editUser.role,
                active: editUser.active,
                branchId: editUser.branchId || null,
            }, { headers: authHeaders(token) });
            setEditUser(null);
            qc.invalidateQueries({ queryKey: ["users"] });
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to update employee");
        }
    };
    const deleteUser = async (id) => {
        if (!confirm("Are you sure you want to deactivate this employee account?"))
            return;
        try {
            await api.delete(`/users/${id}`, { headers: authHeaders(token) });
            qc.invalidateQueries({ queryKey: ["users"] });
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to deactivate employee");
        }
    };
    const filtered = users.filter((u) => !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.role?.toLowerCase().includes(search.toLowerCase()));
    const activeCount = users.filter((u) => u.active).length;
    const managerCount = users.filter((u) => u.role === "MANAGER" || u.role === "OWNER").length;
    const cashierCount = users.filter((u) => u.role === "CASHIER").length;
    return (_jsxs(_Fragment, { children: [_jsx(PageHeader, { title: "Employee Management", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z", children: _jsxs("button", { className: "btn btn-gold btn-sm", onClick: () => { setForm({ name: "", email: "", password: "", role: "CASHIER", branchId: "" }); setShowAdd(true); }, children: [_jsx(Icon, { d: "M12 5v14M5 12h14", size: 14 }), "Add Employee"] }) }), _jsxs("div", { className: "page-body", children: [_jsxs("div", { className: "kpi-grid", children: [_jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#06b6d4" }, children: [_jsx("div", { className: "kpi-icon-wrap", children: _jsx(Icon, { d: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Total Staff Accounts" }), _jsx("div", { className: "kpi-value", children: users.length })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#10b981" }, children: [_jsx("div", { className: "kpi-icon-wrap", children: _jsx(Icon, { d: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Active Staff" }), _jsx("div", { className: "kpi-value", children: activeCount })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#8b5cf6" }, children: [_jsx("div", { className: "kpi-icon-wrap", children: _jsx(Icon, { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Management / Owners" }), _jsx("div", { className: "kpi-value", children: managerCount })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#3b82f6" }, children: [_jsx("div", { className: "kpi-icon-wrap", children: _jsx(Icon, { d: "M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Frontline Cashiers" }), _jsx("div", { className: "kpi-value", children: cashierCount })] })] }), _jsx("div", { style: { maxWidth: 360 }, children: _jsx("input", { placeholder: "Search employee by name, email or role\u2026", value: search, onChange: (e) => setSearch(e.target.value) }) }), _jsxs("div", { className: "card", children: [isLoading && _jsxs("div", { className: "loading-state", children: [_jsx("div", { className: "spinner" }), " Loading staff accounts\u2026"] }), _jsxs("div", { className: "table-wrap", children: [_jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Employee Name" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "System Role" }), _jsx("th", { children: "Assigned Branch" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Created Date" }), _jsx("th", { style: { textAlign: "right" }, children: "Actions" })] }) }), _jsx("tbody", { children: filtered.map((u) => (_jsxs("tr", { children: [_jsx("td", { children: _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [_jsx("div", { style: {
                                                                            width: 32, height: 32, borderRadius: "50%",
                                                                            background: `linear-gradient(135deg, ${ROLE_COLORS[u.role] || "var(--gold)"}, ${ROLE_COLORS[u.role] || "var(--gold)"}aa)`,
                                                                            display: "grid", placeItems: "center",
                                                                            fontSize: 13, fontWeight: 900, color: "#fff", flexShrink: 0
                                                                        }, children: u.name?.charAt(0).toUpperCase() }), _jsx("span", { className: "font-bold", children: u.name })] }) }), _jsx("td", { className: "text-muted", style: { fontSize: 12 }, children: u.email }), _jsx("td", { children: _jsx("span", { className: "badge", style: {
                                                                    background: `${ROLE_COLORS[u.role] || "var(--gold)"}20`,
                                                                    color: ROLE_COLORS[u.role] || "var(--gold)",
                                                                    border: `1px solid ${ROLE_COLORS[u.role] || "var(--gold)"}40`
                                                                }, children: u.role?.replace("_", " ") }) }), _jsx("td", { className: "text-muted", style: { fontSize: 12 }, children: u.branch?.name || "All Branches" }), _jsx("td", { children: _jsxs("span", { className: `badge ${u.active ? "badge-success" : "badge-danger"}`, children: [_jsx("span", { className: "badge-dot" }), u.active ? "Active" : "Inactive"] }) }), _jsx("td", { className: "text-muted", style: { fontSize: 11 }, children: new Date(u.createdAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" }) }), _jsx("td", { children: _jsxs("div", { style: { display: "flex", gap: 6, justifyContent: "flex-end" }, children: [_jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setEditUser(u), children: "Edit" }), _jsx("button", { className: "btn btn-danger btn-sm", onClick: () => deleteUser(u.id), children: "Deactivate" })] }) })] }, u.id))) })] }), filtered.length === 0 && !isLoading && (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-state-icon", children: "\uD83D\uDC64" }), _jsx("p", { children: "No employee accounts found" }), _jsx("small", { children: "Click \"Add Employee\" to create a new staff account" })] }))] })] }), showAdd && (_jsx("div", { className: "modal-overlay", onClick: () => setShowAdd(false), children: _jsxs("div", { className: "modal-card", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("div", { className: "modal-title", children: "Add Staff / Employee Account" }), _jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setShowAdd(false), children: "\u2715" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Full Name *" }), _jsx("input", { placeholder: "e.g. Usman Khan", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Email Address *" }), _jsx("input", { type: "email", placeholder: "usman@desertbite.local", value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Password *" }), _jsx("input", { type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: form.password, onChange: (e) => setForm({ ...form, password: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Role *" }), _jsx("select", { value: form.role, onChange: (e) => setForm({ ...form, role: e.target.value }), children: ROLE_OPTIONS.map((r) => _jsx("option", { value: r.value, children: r.label }, r.value)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Branch Assignment" }), _jsxs("select", { value: form.branchId, onChange: (e) => setForm({ ...form, branchId: e.target.value }), children: [_jsx("option", { value: "", children: "All Branches / Main" }), branches.map((b) => _jsx("option", { value: b.id, children: b.name }, b.id))] })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { className: "btn btn-ghost", onClick: () => setShowAdd(false), children: "Cancel" }), _jsx("button", { className: "btn btn-gold", onClick: createUser, children: "Create Employee" })] })] }) })), editUser && (_jsx("div", { className: "modal-overlay", onClick: () => setEditUser(null), children: _jsxs("div", { className: "modal-card", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { className: "modal-title", children: ["Edit Staff Account \u2014 ", editUser.name] }), _jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setEditUser(null), children: "\u2715" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Full Name *" }), _jsx("input", { value: editUser.name, onChange: (e) => setEditUser({ ...editUser, name: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "System Role *" }), _jsx("select", { value: editUser.role, onChange: (e) => setEditUser({ ...editUser, role: e.target.value }), children: ROLE_OPTIONS.map((r) => _jsx("option", { value: r.value, children: r.label }, r.value)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Branch" }), _jsxs("select", { value: editUser.branchId || "", onChange: (e) => setEditUser({ ...editUser, branchId: e.target.value || null }), children: [_jsx("option", { value: "", children: "All Branches / Main" }), branches.map((b) => _jsx("option", { value: b.id, children: b.name }, b.id))] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Account Status" }), _jsxs("select", { value: editUser.active ? "active" : "inactive", onChange: (e) => setEditUser({ ...editUser, active: e.target.value === "active" }), children: [_jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" })] })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { className: "btn btn-ghost", onClick: () => setEditUser(null), children: "Cancel" }), _jsx("button", { className: "btn btn-gold", onClick: updateUser, children: "Save Changes" })] })] }) }))] })] }));
}
