import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders } from "../lib/api";

type InvItem = {
  id: string;
  name: string;
  stockLevel: number;
  unit: string;
  lowStockLevel: number;
  supplier: string | null;
};

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function InventoryPage({ token }: { token: string }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [stock, setStock] = useState(10);
  const [unit, setUnit] = useState("kg");
  const [lowAlert, setLowAlert] = useState(5);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => (await api.get<InvItem[]>("/inventory", { headers: authHeaders(token) })).data,
  });

  const lowStockItems = items.filter((i) => i.stockLevel <= i.lowStockLevel);

  const addItem = async () => {
    if (!name) return;
    await api.post("/inventory", { name, stockLevel: stock, unit, lowStockLevel: lowAlert }, { headers: authHeaders(token) });
    setName("");
    setStock(10);
    qc.invalidateQueries({ queryKey: ["inventory"] });
  };

  const adjustStock = async (id: string, current: number, delta: number) => {
    await api.patch(`/inventory/${id}`, { stockLevel: Math.max(0, current + delta) }, { headers: authHeaders(token) });
    qc.invalidateQueries({ queryKey: ["inventory"] });
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon" style={{ background: "rgba(245,158,11,0.15)", borderColor: "var(--border-gold)", color: "var(--gold)" }}>
            <Icon d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" size={20} />
          </div>
          <div>
            <div className="page-title">Inventory & Ingredients</div>
            <div className="page-subtitle">{items.length} ingredients tracked · Real-time alerts</div>
          </div>
        </div>
        <div className="page-actions">
          {lowStockItems.length > 0 ? (
            <span className="badge badge-danger">
              <span className="badge-dot" /> {lowStockItems.length} Low Stock Alert(s)
            </span>
          ) : (
            <span className="badge badge-success">
              <span className="badge-dot" /> All Stock Levels Healthy
            </span>
          )}
        </div>
      </div>

      <div className="page-body">
        {lowStockItems.length > 0 && (
          <div className="alert-banner alert-danger">
            <Icon d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" size={18} />
            <div>
              <strong>Low Stock Items Requiring Restock:</strong>{" "}
              {lowStockItems.map((i) => `${i.name} (${i.stockLevel} ${i.unit})`).join(" · ")}
            </div>
          </div>
        )}

        {/* Quick Add Form */}
        <div className="card card-p">
          <div className="card-title" style={{ marginBottom: 14 }}>
            <Icon d="M12 4v16m8-8H4" size={16} />
            Add New Ingredient / Inventory Item
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Item / Ingredient Name</label>
              <input placeholder="e.g., Mozzarella Cheese" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Stock</label>
              <input type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <input placeholder="kg, liters, pcs..." value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Low Alert Threshold</label>
              <input type="number" min={0} value={lowAlert} onChange={(e) => setLowAlert(Number(e.target.value))} />
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-gold" onClick={addItem}>
              <Icon d="M12 4v16m8-8H4" size={14} />
              Add Stock Entry
            </button>
          </div>
        </div>

        {/* Stock Table */}
        <div className="card">
          {isLoading && <div className="loading-state"><div className="spinner" />Loading inventory database...</div>}
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Current Level</th>
                  <th>Low Threshold</th>
                  <th>Visual Status</th>
                  <th>Restock Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => {
                  const isCritical = i.stockLevel <= 0;
                  const isLow = i.stockLevel <= i.lowStockLevel;
                  const percent = Math.min(100, Math.round((i.stockLevel / Math.max(i.lowStockLevel * 3, 1)) * 100));
                  return (
                    <tr key={i.id} className={isLow ? "row-alert" : ""}>
                      <td className="font-bold">{i.name}</td>
                      <td>
                        <span className="mono font-bold" style={{ color: isLow ? "var(--danger)" : "var(--gold)" }}>
                          {i.stockLevel} {i.unit}
                        </span>
                      </td>
                      <td className="text-muted">{i.lowStockLevel} {i.unit}</td>
                      <td style={{ minWidth: 160 }}>
                        <div className="stock-bar-wrap">
                          <div className="stock-bar-bg">
                            <div
                              className={`stock-bar-fill ${isCritical ? "stock-critical" : isLow ? "stock-low" : "stock-ok"}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="stock-value">{percent}%</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => adjustStock(i.id, i.stockLevel, 10)}>
                            +10 {i.unit}
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => adjustStock(i.id, i.stockLevel, 50)}>
                            +50 {i.unit}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => adjustStock(i.id, i.stockLevel, -5)}>
                            -5
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {items.length === 0 && !isLoading && (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <p>No inventory items registered</p>
                <small>Use the form above to add your first ingredient</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
