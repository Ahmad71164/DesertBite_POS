import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders } from "../lib/api";
import { PageHeader } from "../App";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  branchId?: string | null;
  branch?: { id: string; name: string } | null;
  createdAt: string;
};

type Branch = { id: string; name: string };

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ROLE_OPTIONS = [
  { value: "CASHIER", label: "Cashier" },
  { value: "KITCHEN", label: "Kitchen KDS" },
  { value: "MANAGER", label: "Restaurant Manager" },
  { value: "OWNER", label: "Owner" },
  { value: "DELIVERY", label: "Delivery Rider" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "#ef4444",
  OWNER: "#f97316",
  MANAGER: "#8b5cf6",
  CASHIER: "#3b82f6",
  KITCHEN: "#10b981",
  DELIVERY: "#fbbf24",
};

export function EmployeesPage({ token }: { token: string }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CASHIER",
    branchId: "",
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await api.get<User[]>("/users", { headers: authHeaders(token) })).data,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => (await api.get<Branch[]>("/branches", { headers: authHeaders(token) })).data,
  });

  const createUser = async () => {
    if (!form.name || !form.email || !form.password) return;
    try {
      await api.post(
        "/users",
        {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          branchId: form.branchId || undefined,
        },
        { headers: authHeaders(token) }
      );
      setShowAdd(false);
      setForm({ name: "", email: "", password: "", role: "CASHIER", branchId: "" });
      qc.invalidateQueries({ queryKey: ["users"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create employee user");
    }
  };

  const updateUser = async () => {
    if (!editUser) return;
    try {
      await api.patch(
        `/users/${editUser.id}`,
        {
          name: editUser.name,
          role: editUser.role,
          active: editUser.active,
          branchId: editUser.branchId || null,
        },
        { headers: authHeaders(token) }
      );
      setEditUser(null);
      qc.invalidateQueries({ queryKey: ["users"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update employee");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this employee account?")) return;
    try {
      await api.delete(`/users/${id}`, { headers: authHeaders(token) });
      qc.invalidateQueries({ queryKey: ["users"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to deactivate employee");
    }
  };

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = users.filter((u) => u.active).length;
  const managerCount = users.filter((u) => u.role === "MANAGER" || u.role === "OWNER").length;
  const cashierCount = users.filter((u) => u.role === "CASHIER").length;

  return (
    <>
      <PageHeader title="Employee Management" icon="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z">
        <button className="btn btn-gold btn-sm" onClick={() => { setForm({ name: "", email: "", password: "", role: "CASHIER", branchId: "" }); setShowAdd(true); }}>
          <Icon d="M12 5v14M5 12h14" size={14} />
          Add Employee
        </button>
      </PageHeader>

      <div className="page-body">
        {/* KPI Grid */}
        <div className="kpi-grid">
          <div className="kpi-card" style={{ "--kpi-color": "#06b6d4" } as React.CSSProperties}>
            <div className="kpi-icon-wrap"><Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" size={16} /></div>
            <div className="kpi-label">Total Staff Accounts</div>
            <div className="kpi-value">{users.length}</div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "#10b981" } as React.CSSProperties}>
            <div className="kpi-icon-wrap"><Icon d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" size={16} /></div>
            <div className="kpi-label">Active Staff</div>
            <div className="kpi-value">{activeCount}</div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "#8b5cf6" } as React.CSSProperties}>
            <div className="kpi-icon-wrap"><Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={16} /></div>
            <div className="kpi-label">Management / Owners</div>
            <div className="kpi-value">{managerCount}</div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "#3b82f6" } as React.CSSProperties}>
            <div className="kpi-icon-wrap"><Icon d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3" size={16} /></div>
            <div className="kpi-label">Frontline Cashiers</div>
            <div className="kpi-value">{cashierCount}</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ maxWidth: 360 }}>
          <input
            placeholder="Search employee by name, email or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="card">
          {isLoading && <div className="loading-state"><div className="spinner" /> Loading staff accounts…</div>}
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Email</th>
                  <th>System Role</th>
                  <th>Assigned Branch</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: `linear-gradient(135deg, ${ROLE_COLORS[u.role] || "var(--gold)"}, ${ROLE_COLORS[u.role] || "var(--gold)"}aa)`,
                          display: "grid", placeItems: "center",
                          fontSize: 13, fontWeight: 900, color: "#fff", flexShrink: 0
                        }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold">{u.name}</span>
                      </div>
                    </td>
                    <td className="text-muted" style={{ fontSize: 12 }}>{u.email}</td>
                    <td>
                      <span className="badge" style={{
                        background: `${ROLE_COLORS[u.role] || "var(--gold)"}20`,
                        color: ROLE_COLORS[u.role] || "var(--gold)",
                        border: `1px solid ${ROLE_COLORS[u.role] || "var(--gold)"}40`
                      }}>
                        {u.role?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: 12 }}>{u.branch?.name || "All Branches"}</td>
                    <td>
                      <span className={`badge ${u.active ? "badge-success" : "badge-danger"}`}>
                        <span className="badge-dot" />
                        {u.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: 11 }}>
                      {new Date(u.createdAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditUser(u)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && !isLoading && (
              <div className="empty-state">
                <div className="empty-state-icon">👤</div>
                <p>No employee accounts found</p>
                <small>Click "Add Employee" to create a new staff account</small>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Create Staff */}
        {showAdd && (
          <div className="modal-overlay" onClick={() => setShowAdd(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Add Staff / Employee Account</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input placeholder="e.g. Usman Khan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" placeholder="usman@desertbite.local" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Branch Assignment</label>
                  <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
                    <option value="">All Branches / Main</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-gold" onClick={createUser}>Create Employee</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Staff */}
        {editUser && (
          <div className="modal-overlay" onClick={() => setEditUser(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Edit Staff Account — {editUser.name}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditUser(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">System Role *</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  >
                    {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <select
                    value={editUser.branchId || ""}
                    onChange={(e) => setEditUser({ ...editUser, branchId: e.target.value || null })}
                  >
                    <option value="">All Branches / Main</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Account Status</label>
                  <select
                    value={editUser.active ? "active" : "inactive"}
                    onChange={(e) => setEditUser({ ...editUser, active: e.target.value === "active" })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setEditUser(null)}>Cancel</button>
                <button className="btn btn-gold" onClick={updateUser}>Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
