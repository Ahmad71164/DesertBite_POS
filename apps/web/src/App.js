import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { POS } from "./components/POS";
import { ApiStatusBanner } from "./components/ApiStatusBanner";
import { api, authHeaders, checkApiHealth } from "./lib/api";
import { DashboardPage } from "./pages/DashboardPage";
import { OrdersPage } from "./pages/OrdersPage";
import { KitchenPage } from "./pages/KitchenPage";
import { TablesPage } from "./pages/TablesPage";
import { MenuManagementPage } from "./pages/MenuManagementPage";
import { InventoryPage } from "./pages/InventoryPage";
import { CustomersPage } from "./pages/CustomersPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { BranchesPage } from "./pages/BranchesPage";
import { FinancePage } from "./pages/FinancePage";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
export function PageHeader({ title, icon, children, }) {
    return (_jsxs("div", { className: "page-header", children: [_jsxs("div", { className: "page-header-left", children: [_jsx("div", { className: "page-icon", children: _jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: icon || "M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" }) }) }), _jsx("div", { children: _jsx("div", { className: "page-title", children: title }) })] }), children && _jsx("div", { className: "page-actions", children: children })] }));
}
function Icon({ d, size = 18 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: d }) }));
}
function useAuth() {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [role, setRole] = useState(localStorage.getItem("role") || "");
    const [userName, setUserName] = useState(localStorage.getItem("userName") || "User");
    const login = async (email, pass) => {
        const { data } = await api.post("/auth/login", { email, password: pass });
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("userName", data.user.name);
        setToken(data.token);
        setRole(data.user.role);
        setUserName(data.user.name);
    };
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        setToken(null);
        setRole("");
        setUserName("User");
    };
    return { token, role, userName, login, logout };
}
const NAV_SECTIONS = [
    {
        label: "Operations",
        items: [
            { path: "/", label: "Dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
            { path: "/pos", label: "POS Terminal", icon: "M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3M16 5l3 3-3 3M13 8h6" },
            { path: "/orders", label: "Orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
            { path: "/kitchen", label: "Kitchen KDS", icon: "M12 2v3M17 4.5l-2.5 2M22 9.5h-3M17 14.5l-2.5-2M12 16v3M7 14.5l2.5-2M2 9.5h3M7 4.5l2.5 2M12 9a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" },
            { path: "/tables", label: "Dining Tables", icon: "M4 7h16M4 12h16M9 17h6M3 4h18v2H3zM3 18h18v2H3z" },
        ],
    },
    {
        label: "Catalog",
        items: [
            { path: "/menu", label: "Menu & Items", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
            { path: "/inventory", label: "Inventory", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
        ],
    },
    {
        label: "People",
        items: [
            { path: "/customers", label: "Customers", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8z" },
            { path: "/employees", label: "Employees", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" },
            { path: "/branches", label: "Branches", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10" },
        ],
    },
    {
        label: "Finance & Admin",
        items: [
            { path: "/finance", label: "Finance & P&L", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
            { path: "/reports", label: "Reports", icon: "M18 20V10M12 20V4M6 20v-6" },
            { path: "/audit", label: "Audit Logs", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" },
            { path: "/settings", label: "Settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" },
        ],
    },
];
function Sidebar({ userName, role, logout, theme, toggleTheme }) {
    const location = useLocation();
    return (_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "brand", children: [_jsxs("div", { className: "brand-logo", children: [_jsx("div", { className: "brand-emoji", children: "\uD83C\uDF55" }), _jsx("div", { children: _jsx("h1", { children: "Desert Bite" }) })] }), _jsx("div", { className: "brand-sub", children: "PIZZA KITCHEN" }), _jsx("div", { className: "brand-tagline", children: "A Product of GHOSIA Juice" })] }), _jsx("nav", { className: "sidebar-nav", children: NAV_SECTIONS.map((section) => (_jsxs("div", { children: [_jsx("div", { className: "nav-section-label", children: section.label }), section.items.map((item) => {
                            const isActive = item.path === "/"
                                ? location.pathname === "/"
                                : location.pathname.startsWith(item.path);
                            return (_jsxs(Link, { to: item.path, className: `nav-item ${isActive ? "active" : ""}`, children: [_jsx(Icon, { d: item.icon }), _jsx("span", { children: item.label })] }, item.path));
                        })] }, section.label))) }), _jsxs("div", { className: "sidebar-footer", children: [_jsxs("div", { className: "user-chip", children: [_jsx("div", { className: "user-avatar", children: userName.charAt(0).toUpperCase() }), _jsxs("div", { style: { minWidth: 0 }, children: [_jsx("div", { className: "user-name", children: userName }), _jsx("div", { className: "user-role", children: role || "Staff" })] })] }), _jsxs("div", { className: "sidebar-btns", children: [_jsx("button", { className: "btn-theme", onClick: toggleTheme, children: theme === "dark" ? "☀️ Light" : "🌙 Dark" }), _jsx("button", { className: "btn-logout-sm", onClick: logout, children: "Sign Out" })] })] })] }));
}
function LoginPage({ onLogin }) {
    const [email, setEmail] = useState("Admin");
    const [password, setPassword] = useState("DesertBite@786");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { data: health } = useQuery({ queryKey: ["api-health"], queryFn: checkApiHealth, refetchInterval: 5000 });
    return (_jsx("div", { className: "login-screen", children: _jsxs("div", { className: "login-card", children: [_jsxs("div", { className: "login-brand", children: [_jsx("div", { className: "login-brand-icon", children: "\uD83C\uDF55" }), _jsx("h2", { children: "Desert Bite" }), _jsx("p", { children: "PIZZA KITCHEN \u00B7 ERP & POS" })] }), _jsx("div", { className: `login-api-status ${health?.ok ? "login-api-ok" : "login-api-off"}`, children: health?.ok
                        ? `⚡ System Online · ${health.items ?? 0} menu items loaded`
                        : "⚠️ API Offline — run: npm run dev:api" }), _jsxs("form", { className: "login-form", onSubmit: async (e) => {
                        e.preventDefault();
                        setError("");
                        setLoading(true);
                        try {
                            await onLogin(email, password);
                        }
                        catch (err) {
                            setError(err.response?.data?.message || "Invalid credentials. Ensure API is running.");
                        }
                        finally {
                            setLoading(false);
                        }
                    }, children: [_jsxs("div", { children: [_jsx("label", { className: "login-label", children: "Username / Email" }), _jsx("input", { className: "login-input", type: "text", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "Admin", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "login-label", children: "Password" }), _jsx("input", { className: "login-input", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true })] }), error && _jsx("div", { className: "login-error", children: error }), _jsx("button", { type: "submit", className: "login-submit", disabled: loading || !health?.ok, children: loading ? "Signing in…" : "Sign In to System" })] }), _jsxs("div", { className: "login-demo", children: [_jsx("span", { children: "Admin Credentials:" }), _jsx("button", { type: "button", className: "demo-btn", onClick: () => { setEmail("Admin"); setPassword("DesertBite@786"); }, children: "Auto-fill Admin (DesertBite@786)" })] })] }) }));
}
export function App() {
    const auth = useAuth();
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
    const toggleTheme = () => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        localStorage.setItem("theme", next);
        document.documentElement.className = next === "light" ? "light" : "";
    };
    useEffect(() => {
        document.documentElement.className = theme === "light" ? "light" : "";
    }, [theme]);
    useEffect(() => {
        if (!auth.token)
            return;
        checkApiHealth().then((h) => {
            if (!h.ok)
                return;
            api.get("/settings", { headers: authHeaders(auth.token) }).catch(() => auth.logout());
        });
    }, [auth.token]);
    if (!auth.token)
        return _jsx(LoginPage, { onLogin: auth.login });
    return (_jsxs("div", { className: "app", children: [_jsx(Sidebar, { userName: auth.userName, role: auth.role, logout: auth.logout, theme: theme, toggleTheme: toggleTheme }), _jsxs("main", { className: "content", children: [_jsx(ApiStatusBanner, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(DashboardPage, { token: auth.token, theme: theme, onThemeToggle: toggleTheme }) }), _jsx(Route, { path: "/pos", element: _jsx(POS, { token: auth.token }) }), _jsx(Route, { path: "/orders", element: _jsx(OrdersPage, { token: auth.token }) }), _jsx(Route, { path: "/kitchen", element: _jsx(KitchenPage, { token: auth.token }) }), _jsx(Route, { path: "/tables", element: _jsx(TablesPage, { token: auth.token }) }), _jsx(Route, { path: "/menu", element: _jsx(MenuManagementPage, { token: auth.token }) }), _jsx(Route, { path: "/inventory", element: _jsx(InventoryPage, { token: auth.token }) }), _jsx(Route, { path: "/customers", element: _jsx(CustomersPage, { token: auth.token }) }), _jsx(Route, { path: "/employees", element: _jsx(EmployeesPage, { token: auth.token }) }), _jsx(Route, { path: "/branches", element: _jsx(BranchesPage, { token: auth.token }) }), _jsx(Route, { path: "/finance", element: _jsx(FinancePage, { token: auth.token }) }), _jsx(Route, { path: "/audit", element: _jsx(AuditLogsPage, { token: auth.token }) }), _jsx(Route, { path: "/reports", element: _jsx(ReportsPage, { token: auth.token }) }), _jsx(Route, { path: "/settings", element: _jsx(SettingsPage, { token: auth.token }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] })] })] }));
}
