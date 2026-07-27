import { useQuery } from "@tanstack/react-query";
import { checkApiHealth } from "../lib/api";

export function ApiStatusBanner() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["api-health"],
    queryFn: checkApiHealth,
    refetchInterval: 4000,
    retry: 3,
  });

  if (isLoading || isFetching && !data) return null;
  if (data?.ok) return null;

  return (
    <div className="api-offline-banner">
      <strong>⚠️ Server Starting…</strong>
      <span>Please wait — the backend server is starting up. This may take up to 30 seconds.</span>
      <button type="button" onClick={() => refetch()}>
        Retry Now
      </button>
    </div>
  );
}
