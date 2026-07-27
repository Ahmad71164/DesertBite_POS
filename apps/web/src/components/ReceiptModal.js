import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, authHeaders } from "../lib/api";
import { printReceiptWindow } from "../lib/receipt";
export function ReceiptModal({ orderId, token, onClose, autoPrint = false }) {
    const [printers, setPrinters] = useState([]);
    const [selectedPrinter, setSelectedPrinter] = useState("");
    const [useSystemDialog, setUseSystemDialog] = useState(false);
    const [printStatus, setPrintStatus] = useState("");
    const electronAPI = window.electronAPI;
    const { data, isLoading, isError } = useQuery({
        queryKey: ["receipt", orderId],
        enabled: !!orderId,
        queryFn: async () => (await api.get(`/receipt/${orderId}`, { headers: authHeaders(token) })).data,
    });
    // Fetch installed Windows printers if running in Electron app
    useEffect(() => {
        if (electronAPI?.getPrinters) {
            electronAPI.getPrinters().then((list) => {
                if (Array.isArray(list) && list.length > 0) {
                    setPrinters(list);
                    const def = list.find((p) => p.isDefault) || list[0];
                    setSelectedPrinter(def?.name || "");
                }
            }).catch(() => { });
        }
    }, []);
    const handlePrint = (receiptData) => {
        setPrintStatus("Sending print job...");
        try {
            printReceiptWindow(receiptData, true, {
                printerName: selectedPrinter || undefined,
                silent: !useSystemDialog, // Default to true (direct silent thermal print)
            });
            setPrintStatus(`✓ Sent to ${selectedPrinter || "Default Printer"}`);
        }
        catch {
            setPrintStatus("✕ Print failed");
        }
    };
    useEffect(() => {
        if (data && autoPrint) {
            handlePrint(data);
        }
    }, [data, autoPrint]);
    if (!orderId)
        return null;
    return (_jsx("div", { className: "modal-overlay", onClick: onClose, children: _jsxs("div", { className: "modal-card receipt-modal", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsx("h3", { children: "Order Receipt" }), _jsx("button", { className: "btn btn-ghost btn-sm", onClick: onClose, children: "\u2715" })] }), isLoading && _jsx("p", { className: "muted", children: "Loading receipt..." }), isError && _jsx("p", { className: "error-msg", children: "Failed to load receipt" }), data && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "receipt-preview", children: [_jsxs("div", { className: "receipt-header-preview", children: [_jsx("strong", { className: "gold", children: "Desert Bite" }), _jsx("span", { children: "PIZZA KITCHEN" })] }), _jsxs("p", { style: { fontWeight: 700, margin: "4px 0" }, children: [data.invoiceNo, " \u00B7 ", formatRs(data.total)] }), _jsx("ul", { className: "receipt-items-preview", children: data.items.map((line, i) => (_jsxs("li", { children: [line.quantity, "x ", line.item.name, " \u2014 ", formatRs(line.unitPrice * line.quantity)] }, i))) })] }), electronAPI && (_jsxs("div", { style: { background: "var(--bg-2)", padding: "10px 12px", borderRadius: 8, margin: "10px 0", fontSize: 12 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [_jsx("span", { style: { fontWeight: 700, color: "var(--fg-2)" }, children: "\uD83D\uDDA8\uFE0F Printer Selection:" }), printStatus && _jsx("span", { style: { color: printStatus.includes("✓") ? "var(--success)" : "var(--gold)", fontWeight: 700 }, children: printStatus })] }), printers.length > 0 ? (_jsx("select", { value: selectedPrinter, onChange: (e) => setSelectedPrinter(e.target.value), style: { width: "100%", padding: "6px 8px", fontSize: 12, borderRadius: 6, marginBottom: 6 }, children: printers.map((p) => (_jsxs("option", { value: p.name, children: [p.name, " ", p.isDefault ? "(Default)" : ""] }, p.name))) })) : (_jsx("div", { style: { fontSize: 11, color: "var(--fg-3)" }, children: "Using Default Windows Thermal Printer" })), _jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--fg-2)", cursor: "pointer", marginTop: 4 }, children: [_jsx("input", { type: "checkbox", checked: useSystemDialog, onChange: (e) => setUseSystemDialog(e.target.checked) }), _jsxs("span", { children: ["Show System Print Dialog (Slow) \u2014 ", _jsx("em", { children: "Uncheck for 1-click Thermal Direct Print" })] })] })] })), _jsxs("div", { className: "modal-actions", style: { marginTop: 12 }, children: [_jsxs("button", { className: "btn-primary full", onClick: () => handlePrint(data), children: ["\uD83D\uDDA8 Print Receipt ", selectedPrinter ? `(${selectedPrinter})` : ""] }), _jsx("button", { className: "btn-secondary", onClick: onClose, children: "Close" })] })] }))] }) }));
}
function formatRs(n) {
    return `Rs. ${Math.round(n).toLocaleString("en-PK")}`;
}
export async function fetchAndPrintReceipt(orderId, token) {
    const { data } = await api.get(`/receipt/${orderId}`, { headers: authHeaders(token) });
    printReceiptWindow(data, true, { silent: true });
}
