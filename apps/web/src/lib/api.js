import axios from "axios";
const rawEnvUrl = import.meta.env.VITE_API_URL;
const envApiUrl = rawEnvUrl ? (rawEnvUrl.endsWith("/api") ? rawEnvUrl : `${rawEnvUrl.replace(/\/$/, "")}/api`) : null;
const isBrowser = typeof window !== "undefined";
const isLocalhost = isBrowser && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
/** Try VITE_API_URL, relative /api, or direct localhost URL */
const API_BASES = [
    ...(envApiUrl ? [envApiUrl] : []),
    ...(isBrowser && !isLocalhost ? ["/api"] : []),
    "http://localhost:5000/api",
    "/api"
];
export const api = axios.create({
    baseURL: API_BASES[0],
    timeout: 15000,
});
export function authHeaders(token) {
    return { Authorization: `Bearer ${token}` };
}
export function formatRs(amount, symbol = "Rs.") {
    return `${symbol} ${amount.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}
let resolvedBase = API_BASES[0];
export function getApiBase() {
    return resolvedBase;
}
/** Ping API and pick working base URL */
export async function checkApiHealth() {
    for (const base of API_BASES) {
        try {
            const root = base.endsWith("/api") ? base.slice(0, -4) : base;
            const { data } = await axios.get(`${root}/api/health`, { timeout: 4000 });
            if (data.ok) {
                resolvedBase = base;
                api.defaults.baseURL = base;
                return data;
            }
        }
        catch {
            /* try next base */
        }
    }
    return { ok: false, error: "API server is not running. Start: npm run dev:api" };
}
export async function repairDatabase() {
    const health = await checkApiHealth();
    if (!health.ok)
        throw new Error(health.error);
    const { data } = await axios.post(`${getApiBase().replace(/\/api$/, "")}/api/setup/repair`, {}, { timeout: 60000 });
    return data;
}
