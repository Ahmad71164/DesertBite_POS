import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders } from "../lib/api";
import { PageHeader } from "../App";
function Icon({ d, size = 18 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: d }) }));
}
export function BranchesPage({ token }) {
    const qc = useQueryClient();
    const [search, setSearch] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [editBranch, setEditBranch] = useState(null);
    const [form, setForm] = useState({
        name: "",
        code: "",
        address: "",
        phone: "",
        city: "",
    });
    const { data: branches = [], isLoading } = useQuery({
        queryKey: ["branches"],
        queryFn: async () => (await api.get("/branches", { headers: authHeaders(token) })).data,
    });
    const createBranch = async () => {
        if (!form.name || !form.code)
            return;
        try {
            await api.post("/branches", form, { headers: authHeaders(token) });
            setShowAdd(false);
            setForm({ name: "", code: "", address: "", phone: "", city: "" });
            qc.invalidateQueries({ queryKey: ["branches"] });
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to create branch");
        }
    };
    const updateBranch = async () => {
        if (!editBranch)
            return;
        try {
            await api.patch(`/branches/${editBranch.id}`, {
                name: editBranch.name,
                address: editBranch.address,
                phone: editBranch.phone,
                isActive: editBranch.isActive,
            }, { headers: authHeaders(token) });
            setEditBranch(null);
            qc.invalidateQueries({ queryKey: ["branches"] });
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to update branch");
        }
    };
    const deleteBranch = async (id) => {
        if (!confirm("Are you sure you want to delete this branch location?"))
            return;
        try {
            await api.delete(`/branches/${id}`, { headers: authHeaders(token) });
            qc.invalidateQueries({ queryKey: ["branches"] });
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to delete branch");
        }
    };
    const filtered = branches.filter((b) => !search ||
        b.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.code?.toLowerCase().includes(search.toLowerCase()) ||
        b.city?.toLowerCase().includes(search.toLowerCase()));
    const activeCount = branches.filter((b) => b.isActive).length;
    return (_jsxs(_Fragment, { children: [_jsx(PageHeader, { title: "Branch Management", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10", children: _jsxs("button", { className: "btn btn-gold btn-sm", onClick: () => { setForm({ name: "", code: "", address: "", phone: "", city: "" }); setShowAdd(true); }, children: [_jsx(Icon, { d: "M12 5v14M5 12h14", size: 14 }), "New Branch"] }) }), _jsxs("div", { className: "page-body", children: [_jsxs("div", { className: "kpi-grid", children: [_jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#f97316" }, children: [_jsx("div", { className: "kpi-icon-wrap", children: _jsx(Icon, { d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Total Branches" }), _jsx("div", { className: "kpi-value", children: branches.length })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#10b981" }, children: [_jsx("div", { className: "kpi-icon-wrap", children: _jsx(Icon, { d: "M22 11.08V12a10 10 0 11-5.93-9.14", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Active Locations" }), _jsx("div", { className: "kpi-value", children: activeCount })] })] }), _jsx("div", { style: { maxWidth: 360 }, children: _jsx("input", { placeholder: "Search branch by name, code or city\u2026", value: search, onChange: (e) => setSearch(e.target.value) }) }), isLoading ? (_jsxs("div", { className: "loading-state", children: [_jsx("div", { className: "spinner" }), " Loading branches\u2026"] })) : filtered.length === 0 ? (_jsx("div", { className: "card", children: _jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-state-icon", children: "\uD83C\uDFEA" }), _jsx("p", { children: "No branch locations found" }), _jsx("small", { children: "Click \"New Branch\" to add your first branch" })] }) })) : (_jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }, children: filtered.map((branch) => (_jsxs("div", { className: "card card-p", style: { position: "relative", overflow: "hidden" }, children: [_jsx("div", { style: {
                                        position: "absolute", top: 0, left: 0, right: 0, height: 4,
                                        background: branch.isActive ? "linear-gradient(90deg, var(--gold), var(--success))" : "var(--danger)"
                                    } }), _jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [_jsx("div", { style: {
                                                        width: 44, height: 44, borderRadius: 12,
                                                        background: "linear-gradient(135deg, var(--gold), #d97706)",
                                                        display: "grid", placeItems: "center",
                                                        fontSize: "1.4rem", flexShrink: 0
                                                    }, children: "\uD83C\uDFEA" }), _jsxs("div", { children: [_jsx("div", { className: "font-bold", style: { fontSize: 16 }, children: branch.name }), _jsxs("div", { className: "mono", style: { fontSize: 11 }, children: ["Code: ", branch.code] })] })] }), _jsxs("span", { className: `badge ${branch.isActive ? "badge-success" : "badge-danger"}`, children: [_jsx("span", { className: "badge-dot" }), branch.isActive ? "Active" : "Inactive"] })] }), _jsxs("div", { style: { display: "grid", gap: 8, fontSize: 13, color: "var(--fg-2)" }, children: [branch.address && (_jsxs("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" }, children: [_jsx("span", { children: "\uD83D\uDCCD" }), _jsx("span", { children: branch.address })] })), branch.phone && (_jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [_jsx("span", { children: "\uD83D\uDCDE" }), _jsx("span", { className: "mono", children: branch.phone })] })), branch.city && (_jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [_jsx("span", { children: "\uD83C\uDFD9\uFE0F" }), _jsxs("span", { children: ["City: ", _jsx("strong", { children: branch.city })] })] }))] }), _jsxs("div", { style: { marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsxs("span", { className: "text-muted", style: { fontSize: 11 }, children: ["Created: ", new Date(branch.createdAt).toLocaleDateString()] }), _jsxs("div", { style: { display: "flex", gap: 6 }, children: [_jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setEditBranch(branch), children: "Edit" }), _jsx("button", { className: "btn btn-danger btn-sm", onClick: () => deleteBranch(branch.id), children: "Delete" })] })] })] }, branch.id))) })), showAdd && (_jsx("div", { className: "modal-overlay", onClick: () => setShowAdd(false), children: _jsxs("div", { className: "modal-card", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("div", { className: "modal-title", children: "Register New Branch" }), _jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setShowAdd(false), children: "\u2715" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Branch Name *" }), _jsx("input", { placeholder: "e.g. Main Boulevard Branch", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Branch Code *" }), _jsx("input", { placeholder: "e.g. LHR-01", value: form.code, onChange: (e) => setForm({ ...form, code: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "City" }), _jsx("input", { placeholder: "Lahore, Karachi...", value: form.city, onChange: (e) => setForm({ ...form, city: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Address" }), _jsx("input", { placeholder: "Street address", value: form.address, onChange: (e) => setForm({ ...form, address: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Contact Phone" }), _jsx("input", { placeholder: "042-xxxxxxx", value: form.phone, onChange: (e) => setForm({ ...form, phone: e.target.value }) })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { className: "btn btn-ghost", onClick: () => setShowAdd(false), children: "Cancel" }), _jsx("button", { className: "btn btn-gold", onClick: createBranch, children: "Save Branch" })] })] }) })), editBranch && (_jsx("div", { className: "modal-overlay", onClick: () => setEditBranch(null), children: _jsxs("div", { className: "modal-card", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { className: "modal-title", children: ["Edit Branch \u2014 ", editBranch.name] }), _jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setEditBranch(null), children: "\u2715" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Branch Name *" }), _jsx("input", { value: editBranch.name, onChange: (e) => setEditBranch({ ...editBranch, name: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Address" }), _jsx("input", { value: editBranch.address || "", onChange: (e) => setEditBranch({ ...editBranch, address: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Phone Number" }), _jsx("input", { value: editBranch.phone || "", onChange: (e) => setEditBranch({ ...editBranch, phone: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Status" }), _jsxs("select", { value: editBranch.isActive ? "active" : "inactive", onChange: (e) => setEditBranch({ ...editBranch, isActive: e.target.value === "active" }), children: [_jsx("option", { value: "active", children: "Active Branch" }), _jsx("option", { value: "inactive", children: "Closed / Inactive" })] })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { className: "btn btn-ghost", onClick: () => setEditBranch(null), children: "Cancel" }), _jsx("button", { className: "btn btn-gold", onClick: updateBranch, children: "Update Branch" })] })] }) }))] })] }));
}
