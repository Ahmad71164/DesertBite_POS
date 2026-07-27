import axios from "axios";

const rawEnvUrl = import.meta.env.VITE_API_URL as string | undefined;
const envApiUrl = rawEnvUrl ? (rawEnvUrl.endsWith("/api") ? rawEnvUrl : `${rawEnvUrl.replace(/\/$/, "")}/api`) : null;

/** Try VITE_API_URL, direct localhost URL, or Vite proxy fallback */
const API_BASES = [
  ...(envApiUrl ? [envApiUrl] : []),
  "http://localhost:5000/api",
  "/api"
];

export const api = axios.create({
  baseURL: API_BASES[0],
  timeout: 15000,
});

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function formatRs(amount: number, symbol = "Rs.") {
  return `${symbol} ${amount.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

export type HealthStatus = {
  ok: boolean;
  database?: string;
  categories?: number;
  items?: number;
  users?: number;
  error?: string;
};

let resolvedBase = API_BASES[0];

export function getApiBase() {
  return resolvedBase;
}

/** Ping API and pick working base URL */
export async function checkApiHealth(): Promise<HealthStatus> {
  for (const base of API_BASES) {
    try {
      const root = base.endsWith("/api") ? base.slice(0, -4) : base;
      const { data } = await axios.get<HealthStatus>(`${root}/api/health`, { timeout: 4000 });
      if (data.ok) {
        resolvedBase = base;
        api.defaults.baseURL = base;
        return data;
      }
    } catch {
      /* try next base */
    }
  }
  return { ok: false, error: "API server is not running. Start: npm run dev:api" };
}

export async function repairDatabase(): Promise<HealthStatus> {
  const health = await checkApiHealth();
  if (!health.ok) throw new Error(health.error);
  const { data } = await axios.post(`${getApiBase().replace(/\/api$/, "")}/api/setup/repair`, {}, { timeout: 60000 });
  return data;
}
