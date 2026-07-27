import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders } from "../lib/api";

type Table = {
  id: string;
  name: string;
  capacity: number;
  isOccupied: boolean;
  isReserved: boolean;
};

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function TablesPage({ token }: { token: string }) {
  const qc = useQueryClient();
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => (await api.get<Table[]>("/tables", { headers: authHeaders(token) })).data,
    refetchInterval: 5000,
  });

  const updateTable = async (id: string, data: Partial<Table>) => {
    await api.patch(`/tables/${id}`, data, { headers: authHeaders(token) });
    qc.invalidateQueries({ queryKey: ["tables"] });
  };

  const statusClass = (t: Table) => {
    if (t.isOccupied) return "table-occupied";
    if (t.isReserved) return "table-reserved";
    return "table-available";
  };
  const statusLabel = (t: Table) => {
    if (t.isOccupied) return "Occupied";
    if (t.isReserved) return "Reserved";
    return "Available";
  };

  const counts = {
    available: tables.filter((t) => !t.isOccupied && !t.isReserved).length,
    occupied: tables.filter((t) => t.isOccupied).length,
    reserved: tables.filter((t) => t.isReserved && !t.isOccupied).length,
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon" style={{ background: "rgba(59,130,246,0.12)", borderColor: "rgba(59,130,246,0.30)", color: "#3b82f6" }}>
            <Icon d="M4 7h16M4 12h16M9 17h6M3 4h18v2H3zM3 18h18v2H3z" size={20} />
          </div>
          <div>
            <div className="page-title">Dining Tables</div>
            <div className="page-subtitle">Visual floor layout · Live status</div>
          </div>
        </div>
        <div className="page-actions">
          <span className="badge badge-success"><span className="badge-dot" />Available: {counts.available}</span>
          <span className="badge badge-danger"><span className="badge-dot" />Occupied: {counts.occupied}</span>
          <span className="badge badge-gold"><span className="badge-dot" />Reserved: {counts.reserved}</span>
        </div>
      </div>

      <div className="page-body">
        {isLoading && <div className="loading-state"><div className="spinner" />Loading floor plan…</div>}

        <div className="table-floor-grid">
          {tables.map((t) => (
            <div className={`table-card ${statusClass(t)}`} key={t.id}>
              <div className="table-icon">
                {t.isOccupied ? "🍽️" : t.isReserved ? "📋" : "🪑"}
              </div>
              <div className="table-name">{t.name}</div>
              <div className="table-capacity">
                <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8z" size={11} />
                {" "}{t.capacity} seats
              </div>
              <div className="table-status-label">{statusLabel(t)}</div>
              <div className="table-card-actions">
                {!t.isOccupied && !t.isReserved && (
                  <button className="btn btn-crimson btn-sm" onClick={() => updateTable(t.id, { isOccupied: true })}>
                    Occupy
                  </button>
                )}
                {t.isOccupied && (
                  <button className="btn btn-success btn-sm" onClick={() => updateTable(t.id, { isOccupied: false })}>
                    Free Up
                  </button>
                )}
                {!t.isReserved && !t.isOccupied && (
                  <button className="btn btn-ghost btn-sm" onClick={() => updateTable(t.id, { isReserved: true })}>
                    Reserve
                  </button>
                )}
                {t.isReserved && !t.isOccupied && (
                  <button className="btn btn-ghost btn-sm" onClick={() => updateTable(t.id, { isReserved: false })}>
                    Unreserve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {tables.length === 0 && !isLoading && (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">🪑</div>
              <p>No tables configured</p>
              <small>Add tables from the Settings page</small>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
