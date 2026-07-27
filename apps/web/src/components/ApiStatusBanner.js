import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { checkApiHealth } from "../lib/api";
export function ApiStatusBanner() {
    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ["api-health"],
        queryFn: checkApiHealth,
        refetchInterval: 4000,
        retry: 3,
    });
    if (isLoading || isFetching && !data)
        return null;
    if (data?.ok)
        return null;
    return (_jsxs("div", { className: "api-offline-banner", children: [_jsx("strong", { children: "\u26A0\uFE0F Server Starting\u2026" }), _jsx("span", { children: "Please wait \u2014 the backend server is starting up. This may take up to 30 seconds." }), _jsx("button", { type: "button", onClick: () => refetch(), children: "Retry Now" })] }));
}
