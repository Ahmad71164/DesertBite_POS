import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders } from "../lib/api";
function Icon({ d, size = 16 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: d }) }));
}
export function SettingsPage({ token }) {
    const qc = useQueryClient();
    const { data: settings, isLoading } = useQuery({
        queryKey: ["settings"],
        queryFn: async () => (await api.get("/settings", { headers: authHeaders(token) })).data,
    });
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const merged = { ...settings, ...form };
    const save = async () => {
        setSaving(true);
        try {
            await api.patch("/settings", {
                name: merged.name,
                tagline: merged.tagline,
                address: merged.address,
                phone: merged.phone,
                whatsapp: merged.whatsapp,
                taxRate: merged.taxRate,
                serviceChargeRate: merged.serviceChargeRate,
            }, { headers: authHeaders(token) });
            qc.invalidateQueries({ queryKey: ["settings"] });
            alert("Settings saved successfully!");
        }
        catch {
            alert("Failed to save settings.");
        }
        finally {
            setSaving(false);
        }
    };
    const reseedMenu = async () => {
        if (!confirm("Reload full Desert Bite menu database seed?"))
            return;
        const { data } = await api.post("/menu/reseed", {}, { headers: authHeaders(token) });
        alert(`Menu database reloaded: ${data.itemCount} items!`);
        qc.invalidateQueries({ queryKey: ["menu"] });
        qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    };
    if (isLoading) {
        return (_jsxs("div", { className: "loading-state", children: [_jsx("div", { className: "spinner" }), " Loading restaurant settings..."] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "page-header", children: _jsxs("div", { className: "page-header-left", children: [_jsx("div", { className: "page-icon", style: { background: "rgba(113,113,122,0.15)", borderColor: "var(--border)", color: "var(--fg)" }, children: _jsx(Icon, { d: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z", size: 20 }) }), _jsxs("div", { children: [_jsx("div", { className: "page-title", children: "System & Restaurant Settings" }), _jsx("div", { className: "page-subtitle", children: "Configure receipt details, tax rates, contact numbers and database reseed" })] })] }) }), _jsx("div", { className: "page-body", children: _jsxs("div", { className: "card card-p", children: [_jsxs("div", { className: "card-title", style: { marginBottom: 18 }, children: [_jsx(Icon, { d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", size: 18 }), "Restaurant Details & Branding"] }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Restaurant Name" }), _jsx("input", { value: merged.name ?? "", onChange: (e) => setForm({ ...form, name: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Tagline / Subheader" }), _jsx("input", { value: merged.tagline ?? "", onChange: (e) => setForm({ ...form, tagline: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Address" }), _jsx("input", { value: merged.address ?? "", onChange: (e) => setForm({ ...form, address: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Phone Number" }), _jsx("input", { value: merged.phone ?? "", onChange: (e) => setForm({ ...form, phone: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "WhatsApp Contact" }), _jsx("input", { value: merged.whatsapp ?? "", onChange: (e) => setForm({ ...form, whatsapp: e.target.value }) })] })] }), _jsx("div", { className: "divider" }), _jsxs("div", { className: "card-title", style: { marginBottom: 18 }, children: [_jsx(Icon, { d: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z", size: 18 }), "Taxation & Service Rates"] }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Sales Tax Rate (e.g., 0.05 = 5%)" }), _jsx("input", { type: "number", step: 0.01, min: 0, max: 1, value: merged.taxRate ?? 0.05, onChange: (e) => setForm({ ...form, taxRate: Number(e.target.value) }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Service Charge Rate (e.g., 0.02 = 2%)" }), _jsx("input", { type: "number", step: 0.01, min: 0, max: 1, value: merged.serviceChargeRate ?? 0, onChange: (e) => setForm({ ...form, serviceChargeRate: Number(e.target.value) }) })] })] }), _jsxs("div", { style: { marginTop: 24, display: "flex", gap: 12, justifyContent: "flex-end" }, children: [_jsxs("button", { className: "btn btn-ghost", onClick: reseedMenu, children: [_jsx(Icon, { d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", size: 14 }), "Reload Full Menu Database Seed"] }), _jsxs("button", { className: "btn btn-gold", onClick: save, disabled: saving, children: [_jsx(Icon, { d: "M5 13l4 4L19 7", size: 14 }), saving ? "Saving Changes..." : "Save Settings"] })] })] }) })] }));
}
