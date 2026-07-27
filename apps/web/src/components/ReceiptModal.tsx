import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, authHeaders } from "../lib/api";
import { printReceiptWindow, type ReceiptData } from "../lib/receipt";

type Props = {
  orderId: string | null;
  token: string;
  onClose: () => void;
  autoPrint?: boolean;
};

type PrinterInfo = {
  name: string;
  isDefault: boolean;
};

export function ReceiptModal({ orderId, token, onClose, autoPrint = false }: Props) {
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [useSystemDialog, setUseSystemDialog] = useState<boolean>(false);
  const [printStatus, setPrintStatus] = useState<string>("");

  const electronAPI = (window as any).electronAPI;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["receipt", orderId],
    enabled: !!orderId,
    queryFn: async () => (await api.get<ReceiptData>(`/receipt/${orderId}`, { headers: authHeaders(token) })).data,
  });

  // Fetch installed Windows printers if running in Electron app
  useEffect(() => {
    if (electronAPI?.getPrinters) {
      electronAPI.getPrinters().then((list: PrinterInfo[]) => {
        if (Array.isArray(list) && list.length > 0) {
          setPrinters(list);
          const def = list.find((p) => p.isDefault) || list[0];
          setSelectedPrinter(def?.name || "");
        }
      }).catch(() => {});
    }
  }, []);

  const handlePrint = (receiptData: ReceiptData) => {
    setPrintStatus("Sending print job...");
    try {
      printReceiptWindow(receiptData, true, {
        printerName: selectedPrinter || undefined,
        silent: !useSystemDialog, // Default to true (direct silent thermal print)
      });
      setPrintStatus(`✓ Sent to ${selectedPrinter || "Default Printer"}`);
    } catch {
      setPrintStatus("✕ Print failed");
    }
  };

  useEffect(() => {
    if (data && autoPrint) {
      handlePrint(data);
    }
  }, [data, autoPrint]);

  if (!orderId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Order Receipt</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {isLoading && <p className="muted">Loading receipt...</p>}
        {isError && <p className="error-msg">Failed to load receipt</p>}

        {data && (
          <>
            <div className="receipt-preview">
              <div className="receipt-header-preview">
                <strong className="gold">Desert Bite</strong>
                <span>PIZZA KITCHEN</span>
              </div>
              <p style={{ fontWeight: 700, margin: "4px 0" }}>{data.invoiceNo} · {formatRs(data.total)}</p>
              <ul className="receipt-items-preview">
                {data.items.map((line, i) => (
                  <li key={i}>
                    {line.quantity}x {line.item.name} — {formatRs(line.unitPrice * line.quantity)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Electron Printer Settings */}
            {electronAPI && (
              <div style={{ background: "var(--bg-2)", padding: "10px 12px", borderRadius: 8, margin: "10px 0", fontSize: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: "var(--fg-2)" }}>🖨️ Printer Selection:</span>
                  {printStatus && <span style={{ color: printStatus.includes("✓") ? "var(--success)" : "var(--gold)", fontWeight: 700 }}>{printStatus}</span>}
                </div>
                {printers.length > 0 ? (
                  <select
                    value={selectedPrinter}
                    onChange={(e) => setSelectedPrinter(e.target.value)}
                    style={{ width: "100%", padding: "6px 8px", fontSize: 12, borderRadius: 6, marginBottom: 6 }}
                  >
                    {printers.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name} {p.isDefault ? "(Default)" : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ fontSize: 11, color: "var(--fg-3)" }}>Using Default Windows Thermal Printer</div>
                )}
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--fg-2)", cursor: "pointer", marginTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={useSystemDialog}
                    onChange={(e) => setUseSystemDialog(e.target.checked)}
                  />
                  <span>Show System Print Dialog (Slow) — <em>Uncheck for 1-click Thermal Direct Print</em></span>
                </label>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: 12 }}>
              <button className="btn-primary full" onClick={() => handlePrint(data)}>
                🖨 Print Receipt {selectedPrinter ? `(${selectedPrinter})` : ""}
              </button>
              <button className="btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function formatRs(n: number) {
  return `Rs. ${Math.round(n).toLocaleString("en-PK")}`;
}

export async function fetchAndPrintReceipt(orderId: string, token: string) {
  const { data } = await api.get<ReceiptData>(`/receipt/${orderId}`, { headers: authHeaders(token) });
  printReceiptWindow(data, true, { silent: true });
}
