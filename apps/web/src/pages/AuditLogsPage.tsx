import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, authHeaders } from "../lib/api";
import { PageHeader } from "../App";

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const MODULE_COLORS: Record<string, string> = {
  AUTH: "#3b82f6",
  POS: "#f97316",
  ORDERS: "#8b5cf6",
  INVENTORY: "#10b981",
  MENU: "#ec4899",
  CRM: "#06b6d4",
  SYSTEM: "#ef4444",
  TABLES: "#fbbf24",
  FINANCE: "#22c55e",
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "#10b981",
  UPDATE: "#3b82f6",
  DELETE: "#ef4444",
  LOGIN: "#8b5cf6",
  CHANGE: "#f97316",
};

function getActionColor(action: string) {
  const prefix = Object.keys(ACTION_COLORS).find((k) => action.includes(k));
  return prefix ? ACTION_COLORS[prefix] : "var(--muted)";
}

export function AuditLogsPage({ token }: { token: string }) {
  const [module, setModule] = useState("ALL");
  const [search, setSearch] = useState("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => (await api.get("/audit-logs", { headers: authHeaders(token) })).data,
  });

  const modules = ["ALL", ...Object.keys(MODULE_COLORS)];

  const filtered = logs.filter((log: any) => {
    if (module !== "ALL" && log.module !== module) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.action?.toLowerCase().includes(q) ||
        log.userEmail?.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <>
      <PageHeader title="Audit Logs" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z">
        <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{filtered.length} records</span>
      </PageHeader>

      <div className="page-body">
        <div className="pill-group" style={{ marginBottom: 16 }}>
          {modules.map((m) => (
            <button key={m} className={`pill ${module === m ? "active" : ""}`} onClick={() => setModule(m)}>
              {m !== "ALL" && (
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: MODULE_COLORS[m], display: "inline-block", marginRight: 6 }} />
              )}
              {m}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 14, maxWidth: 360 }}>
          <input placeholder="Search action, email, details…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {isLoading ? (
          <div className="loading-state"><div className="spinner" /> Loading audit logs…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Module</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 200).map((log: any) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: "0.73rem", color: "var(--muted)", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>
                        {new Date(log.createdAt).toLocaleString("en-PK", {
                          month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit", second: "2-digit"
                        })}
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--fg-2)" }}>{log.userEmail || "System"}</td>
                      <td>
                        <span className="badge" style={{
                          background: `${MODULE_COLORS[log.module] || "var(--muted)"}20`,
                          color: MODULE_COLORS[log.module] || "var(--muted)",
                          border: `1px solid ${MODULE_COLORS[log.module] || "var(--muted)"}40`
                        }}>
                          {log.module}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: getActionColor(log.action), fontFamily: "'JetBrains Mono', monospace" }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.78rem", color: "var(--fg-2)", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
