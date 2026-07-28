import axios from "axios";
const rawEnvUrl = import.meta.env.VITE_API_URL;
const envApiUrl = rawEnvUrl ? (rawEnvUrl.endsWith("/api") ? rawEnvUrl : `${rawEnvUrl.replace(/\/$/, "")}/api`) : null;
const API_BASES = [
    ...(envApiUrl ? [envApiUrl] : []),
    "http://localhost:5000/api",
    "/api"
];
let resolvedBase = API_BASES[0];
export const apiClient = axios.create({
    baseURL: resolvedBase,
    timeout: 15000,
});
// Interceptor for JWT injection
apiClient.interceptors.request.use((config) => {
    // In a real app, get token from Zustand store or localStorage
    const token = localStorage.getItem("auth-token");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));
// Interceptor for Error Handling and Response Normalization
apiClient.interceptors.response.use((response) => {
    // Normalization logic could go here
    return response;
}, async (error) => {
    if (error.response?.status === 401) {
        // Handle token expiry / refresh token logic
        console.error("Unauthorized! Token may be expired.");
        // localStorage.removeItem("auth-token");
        // window.location.href = "/login";
    }
    // Implement request retry logic here if needed for 500s or network errors
    return Promise.reject(error);
});
export function setApiBase(base) {
    resolvedBase = base;
    apiClient.defaults.baseURL = base;
}
export function getApiBase() {
    return resolvedBase;
}
