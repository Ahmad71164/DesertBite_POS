import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders, formatRs } from "../lib/api";
import { PageHeader } from "../App";

type MenuItem = {
  id: string;
  name: string;
  categoryId: string;
  category?: { id: string; name: string };
  sellingPrice: number;
  costPrice: number;
  preparationTime: number;
  description?: string;
  availability: boolean;
  recipeMapped?: boolean;
};

type Category = {
  id: string;
  name: string;
  sortOrder?: number;
  isActive?: boolean;
  _count?: { items: number };
};

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function MenuManagementPage({ token }: { token: string }) {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"items" | "categories">("items");
  const [search, setSearch] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCat, setShowAddCat] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editCat, setEditCat] = useState<Category | null>(null);

  const [itemForm, setItemForm] = useState({
    name: "",
    categoryId: "",
    sellingPrice: 0,
    costPrice: 0,
    preparationTime: 10,
    description: "",
  });

  const [catForm, setCatForm] = useState({
    name: "",
    sortOrder: 1,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["menu-items"],
    queryFn: async () => (await api.get<MenuItem[]>("/menu/items", { headers: authHeaders(token) })).data,
  });

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ["menu-categories"],
    queryFn: async () => (await api.get<Category[]>("/menu/categories", { headers: authHeaders(token) })).data,
  });

  // Create Item
  const addItem = async () => {
    if (!itemForm.name || !itemForm.categoryId || itemForm.sellingPrice <= 0) return;
    try {
      await api.post("/menu/items", itemForm, { headers: authHeaders(token) });
      setShowAddItem(false);
      setItemForm({ name: "", categoryId: "", sellingPrice: 0, costPrice: 0, preparationTime: 10, description: "" });
      qc.invalidateQueries({ queryKey: ["menu-items"] });
      qc.invalidateQueries({ queryKey: ["menu"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add menu item");
    }
  };

  // Edit Item
  const updateItem = async () => {
    if (!editItem) return;
    try {
      await api.patch(
        `/menu/items/${editItem.id}`,
        {
          name: editItem.name,
          sellingPrice: editItem.sellingPrice,
          costPrice: editItem.costPrice,
          preparationTime: editItem.preparationTime,
          description: editItem.description,
          categoryId: editItem.categoryId,
          availability: editItem.availability,
        },
        { headers: authHeaders(token) }
      );
      setEditItem(null);
      qc.invalidateQueries({ queryKey: ["menu-items"] });
      qc.invalidateQueries({ queryKey: ["menu"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update menu item");
    }
  };

  // Delete Item
  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await api.delete(`/menu/items/${id}`, { headers: authHeaders(token) });
      qc.invalidateQueries({ queryKey: ["menu-items"] });
      qc.invalidateQueries({ queryKey: ["menu"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete item");
    }
  };

  // Create Category
  const addCategory = async () => {
    if (!catForm.name) return;
    try {
      await api.post("/menu/categories", catForm, { headers: authHeaders(token) });
      setShowAddCat(false);
      setCatForm({ name: "", sortOrder: 1 });
      qc.invalidateQueries({ queryKey: ["menu-categories"] });
      qc.invalidateQueries({ queryKey: ["menu"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add category");
    }
  };

  // Edit Category
  const updateCategory = async () => {
    if (!editCat) return;
    try {
      await api.patch(
        `/menu/categories/${editCat.id}`,
        {
          name: editCat.name,
          isActive: editCat.isActive,
          sortOrder: editCat.sortOrder,
        },
        { headers: authHeaders(token) }
      );
      setEditCat(null);
      qc.invalidateQueries({ queryKey: ["menu-categories"] });
      qc.invalidateQueries({ queryKey: ["menu"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update category");
    }
  };

  // Delete Category
  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/menu/categories/${id}`, { headers: authHeaders(token) });
      qc.invalidateQueries({ queryKey: ["menu-categories"] });
      qc.invalidateQueries({ queryKey: ["menu"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete category");
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await api.patch(`/menu/items/${id}`, { availability: !current }, { headers: authHeaders(token) });
    qc.invalidateQueries({ queryKey: ["menu-items"] });
    qc.invalidateQueries({ queryKey: ["menu"] });
  };

  const filteredItems = items.filter(
    (i) =>
      !search ||
      i.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCats = categories.filter(
    (c) => !search || c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const margin = (item: MenuItem) => {
    if (!item.costPrice || !item.sellingPrice) return null;
    return Math.round(((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100);
  };

  return (
    <>
      <PageHeader title="Menu Management" icon="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z">
        <div style={{ display: "flex", gap: 8 }}>
          <div className="pill-tabs">
            <button className={`pill-tab ${activeTab === "items" ? "active" : ""}`} onClick={() => setActiveTab("items")}>
              Menu Items ({items.length})
            </button>
            <button className={`pill-tab ${activeTab === "categories" ? "active" : ""}`} onClick={() => setActiveTab("categories")}>
              Categories ({categories.length})
            </button>
          </div>
          {activeTab === "items" ? (
            <button className="btn btn-gold btn-sm" onClick={() => setShowAddItem(true)}>
              <Icon d="M12 5v14M5 12h14" size={14} />
              Add Item
            </button>
          ) : (
            <button className="btn btn-gold btn-sm" onClick={() => setShowAddCat(true)}>
              <Icon d="M12 5v14M5 12h14" size={14} />
              Add Category
            </button>
          )}
        </div>
      </PageHeader>

      <div className="page-body">
        {/* KPI Grid */}
        <div className="kpi-grid">
          <div className="kpi-card" style={{ "--kpi-color": "#ec4899" } as React.CSSProperties}>
            <div className="kpi-icon-wrap"><Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" size={16} /></div>
            <div className="kpi-label">Total Items</div>
            <div className="kpi-value">{items.length}</div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "#10b981" } as React.CSSProperties}>
            <div className="kpi-icon-wrap"><Icon d="M22 11.08V12a10 10 0 11-5.93-9.14" size={16} /></div>
            <div className="kpi-label">Active Items</div>
            <div className="kpi-value">{items.filter((i) => i.availability).length}</div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "#8b5cf6" } as React.CSSProperties}>
            <div className="kpi-icon-wrap"><Icon d="M4 6h16M4 12h16M4 18h16" size={16} /></div>
            <div className="kpi-label">Menu Categories</div>
            <div className="kpi-value">{categories.length}</div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "var(--gold)" } as React.CSSProperties}>
            <div className="kpi-icon-wrap"><Icon d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" size={16} /></div>
            <div className="kpi-label">Average Item Price</div>
            <div className="kpi-value">
              {items.length > 0 ? formatRs(items.reduce((s, i) => s + i.sellingPrice, 0) / items.length) : "—"}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div style={{ maxWidth: 360 }}>
          <input
            placeholder={`Search ${activeTab === "items" ? "items or categories" : "categories"}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {activeTab === "items" ? (
          /* ITEMS TABLE */
          <div className="card">
            {itemsLoading && <div className="loading-state"><div className="spinner" /> Loading menu items…</div>}
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Selling Price</th>
                    <th>Cost Price</th>
                    <th>Margin</th>
                    <th>Prep Time</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const m = margin(item);
                    return (
                      <tr key={item.id}>
                        <td className="font-bold">{item.name}</td>
                        <td>
                          <span className="badge badge-gold">{item.category?.name || "Uncategorized"}</span>
                        </td>
                        <td className="font-mono font-bold text-gold">{formatRs(item.sellingPrice)}</td>
                        <td className="text-muted" style={{ fontSize: 12 }}>
                          {item.costPrice > 0 ? formatRs(item.costPrice) : "—"}
                        </td>
                        <td>
                          {m !== null ? (
                            <span style={{ color: m >= 50 ? "var(--success)" : m >= 30 ? "var(--warning)" : "var(--danger)", fontWeight: 800, fontSize: 12 }}>
                              {m}%
                            </span>
                          ) : "—"}
                        </td>
                        <td className="text-muted" style={{ fontSize: 12 }}>{item.preparationTime} min</td>
                        <td>
                          <button
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                            onClick={() => toggleAvailability(item.id, item.availability)}
                            title="Click to toggle availability"
                          >
                            <span className={`badge ${item.availability ? "badge-success" : "badge-danger"}`}>
                              <span className="badge-dot" />
                              {item.availability ? "Active" : "Hidden"}
                            </span>
                          </button>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditItem(item)}>
                              Edit
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteItem(item.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredItems.length === 0 && !itemsLoading && (
                <div className="empty-state">
                  <div className="empty-state-icon">🍕</div>
                  <p>No menu items found</p>
                  <small>Click "Add Item" to create your first menu item</small>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* CATEGORIES TABLE */
          <div className="card">
            {catsLoading && <div className="loading-state"><div className="spinner" /> Loading categories…</div>}
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Sort Order</th>
                    <th>Item Count</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCats.map((cat) => (
                    <tr key={cat.id}>
                      <td className="font-bold">{cat.name}</td>
                      <td className="mono">{cat.sortOrder ?? 1}</td>
                      <td className="text-muted" style={{ fontSize: 12 }}>
                        {items.filter((i) => i.categoryId === cat.id).length} items registered
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditCat(cat)}>
                            Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(cat.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCats.length === 0 && !catsLoading && (
                <div className="empty-state">
                  <div className="empty-state-icon">📁</div>
                  <p>No categories found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Add Item */}
        {showAddItem && (
          <div className="modal-overlay" onClick={() => setShowAddItem(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Add New Menu Item</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAddItem(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Item Name *</label>
                  <input placeholder="e.g. Chicken Tikka Pizza (Large)" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select value={itemForm.categoryId} onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}>
                    <option value="">Select category…</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Selling Price (Rs.) *</label>
                    <input type="number" min={1} value={itemForm.sellingPrice || ""} onChange={(e) => setItemForm({ ...itemForm, sellingPrice: Number(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cost Price (Rs.)</label>
                    <input type="number" min={0} value={itemForm.costPrice || ""} onChange={(e) => setItemForm({ ...itemForm, costPrice: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Preparation Time (minutes)</label>
                  <input type="number" min={1} value={itemForm.preparationTime} onChange={(e) => setItemForm({ ...itemForm, preparationTime: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea rows={2} placeholder="Ingredients, size specs..." value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowAddItem(false)}>Cancel</button>
                <button className="btn btn-gold" onClick={addItem}>Save Item</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Item */}
        {editItem && (
          <div className="modal-overlay" onClick={() => setEditItem(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Edit Menu Item — {editItem.name}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditItem(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Item Name *</label>
                  <input value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select value={editItem.categoryId} onChange={(e) => setEditItem({ ...editItem, categoryId: e.target.value })}>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Selling Price (Rs.) *</label>
                    <input type="number" value={editItem.sellingPrice} onChange={(e) => setEditItem({ ...editItem, sellingPrice: Number(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cost Price (Rs.)</label>
                    <input type="number" value={editItem.costPrice || 0} onChange={(e) => setEditItem({ ...editItem, costPrice: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Prep Time (minutes)</label>
                  <input type="number" value={editItem.preparationTime} onChange={(e) => setEditItem({ ...editItem, preparationTime: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select value={editItem.availability ? "active" : "hidden"} onChange={(e) => setEditItem({ ...editItem, availability: e.target.value === "active" })}>
                    <option value="active">Active (Visible in POS)</option>
                    <option value="hidden">Hidden / Out of Stock</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setEditItem(null)}>Cancel</button>
                <button className="btn btn-gold" onClick={updateItem}>Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Category */}
        {showAddCat && (
          <div className="modal-overlay" onClick={() => setShowAddCat(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Create Menu Category</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAddCat(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input placeholder="e.g. Specialty Pizzas" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sort Order</label>
                  <input type="number" value={catForm.sortOrder} onChange={(e) => setCatForm({ ...catForm, sortOrder: Number(e.target.value) })} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowAddCat(false)}>Cancel</button>
                <button className="btn btn-gold" onClick={addCategory}>Create Category</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Category */}
        {editCat && (
          <div className="modal-overlay" onClick={() => setEditCat(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Edit Category — {editCat.name}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditCat(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input value={editCat.name} onChange={(e) => setEditCat({ ...editCat, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sort Order</label>
                  <input type="number" value={editCat.sortOrder || 1} onChange={(e) => setEditCat({ ...editCat, sortOrder: Number(e.target.value) })} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setEditCat(null)}>Cancel</button>
                <button className="btn btn-gold" onClick={updateCategory}>Update Category</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
