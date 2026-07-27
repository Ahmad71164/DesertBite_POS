import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders } from "../lib/api";
import { PageHeader } from "../App";

type Branch = {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  city?: string;
  isActive: boolean;
  createdAt: string;
};

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function BranchesPage({ token }: { token: string }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    city: "",
  });

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => (await api.get<Branch[]>("/branches", { headers: authHeaders(token) })).data,
  });

  const createBranch = async () => {
    if (!form.name || !form.code) return;
    try {
      await api.post("/branches", form, { headers: authHeaders(token) });
      setShowAdd(false);
      setForm({ name: "", code: "", address: "", phone: "", city: "" });
      qc.invalidateQueries({ queryKey: ["branches"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create branch");
    }
  };

  const updateBranch = async () => {
    if (!editBranch) return;
    try {
      await api.patch(
        `/branches/${editBranch.id}`,
        {
          name: editBranch.name,
          address: editBranch.address,
          phone: editBranch.phone,
          isActive: editBranch.isActive,
        },
        { headers: authHeaders(token) }
      );
      setEditBranch(null);
      qc.invalidateQueries({ queryKey: ["branches"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update branch");
    }
  };

  const deleteBranch = async (id: string) => {
    if (!confirm("Are you sure you want to delete this branch location?")) return;
    try {
      await api.delete(`/branches/${id}`, { headers: authHeaders(token) });
      qc.invalidateQueries({ queryKey: ["branches"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete branch");
    }
  };

  const filtered = branches.filter(
    (b) =>
      !search ||
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.code?.toLowerCase().includes(search.toLowerCase()) ||
      b.city?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = branches.filter((b) => b.isActive).length;

  return (
    <>
      <PageHeader title="Branch Management" icon="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10">
        <button className="btn btn-gold btn-sm" onClick={() => { setForm({ name: "", code: "", address: "", phone: "", city: "" }); setShowAdd(true); }}>
          <Icon d="M12 5v14M5 12h14" size={14} />
          New Branch
        </button>
      </PageHeader>

      <div className="page-body">
        {/* KPI Grid */}
        <div className="kpi-grid">
          <div className="kpi-card" style={{ "--kpi-color": "#f97316" } as React.CSSProperties}>
            <div className="kpi-icon-wrap"><Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" size={16} /></div>
            <div className="kpi-label">Total Branches</div>
            <div className="kpi-value">{branches.length}</div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "#10b981" } as React.CSSProperties}>
            <div className="kpi-icon-wrap"><Icon d="M22 11.08V12a10 10 0 11-5.93-9.14" size={16} /></div>
            <div className="kpi-label">Active Locations</div>
            <div className="kpi-value">{activeCount}</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ maxWidth: 360 }}>
          <input
            placeholder="Search branch by name, code or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="loading-state"><div className="spinner" /> Loading branches…</div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">🏪</div>
              <p>No branch locations found</p>
              <small>Click "New Branch" to add your first branch</small>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {filtered.map((branch) => (
              <div key={branch.id} className="card card-p" style={{ position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 4,
                  background: branch.isActive ? "linear-gradient(90deg, var(--gold), var(--success))" : "var(--danger)"
                }} />
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: "linear-gradient(135deg, var(--gold), #d97706)",
                      display: "grid", placeItems: "center",
                      fontSize: "1.4rem", flexShrink: 0
                    }}>🏪</div>
                    <div>
                      <div className="font-bold" style={{ fontSize: 16 }}>{branch.name}</div>
                      <div className="mono" style={{ fontSize: 11 }}>Code: {branch.code}</div>
                    </div>
                  </div>
                  <span className={`badge ${branch.isActive ? "badge-success" : "badge-danger"}`}>
                    <span className="badge-dot" />
                    {branch.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div style={{ display: "grid", gap: 8, fontSize: 13, color: "var(--fg-2)" }}>
                  {branch.address && (
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span>📍</span>
                      <span>{branch.address}</span>
                    </div>
                  )}
                  {branch.phone && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span>📞</span>
                      <span className="mono">{branch.phone}</span>
                    </div>
                  )}
                  {branch.city && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span>🏙️</span>
                      <span>City: <strong>{branch.city}</strong></span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="text-muted" style={{ fontSize: 11 }}>
                    Created: {new Date(branch.createdAt).toLocaleDateString()}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditBranch(branch)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteBranch(branch.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Create Branch */}
        {showAdd && (
          <div className="modal-overlay" onClick={() => setShowAdd(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Register New Branch</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Branch Name *</label>
                  <input placeholder="e.g. Main Boulevard Branch" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Branch Code *</label>
                  <input placeholder="e.g. LHR-01" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input placeholder="Lahore, Karachi..." value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input placeholder="Street address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input placeholder="042-xxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-gold" onClick={createBranch}>Save Branch</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Branch */}
        {editBranch && (
          <div className="modal-overlay" onClick={() => setEditBranch(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Edit Branch — {editBranch.name}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditBranch(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Branch Name *</label>
                  <input
                    value={editBranch.name}
                    onChange={(e) => setEditBranch({ ...editBranch, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    value={editBranch.address || ""}
                    onChange={(e) => setEditBranch({ ...editBranch, address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    value={editBranch.phone || ""}
                    onChange={(e) => setEditBranch({ ...editBranch, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={editBranch.isActive ? "active" : "inactive"}
                    onChange={(e) => setEditBranch({ ...editBranch, isActive: e.target.value === "active" })}
                  >
                    <option value="active">Active Branch</option>
                    <option value="inactive">Closed / Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setEditBranch(null)}>Cancel</button>
                <button className="btn btn-gold" onClick={updateBranch}>Update Branch</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
