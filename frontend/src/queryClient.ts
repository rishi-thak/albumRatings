import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes before considered stale
      gcTime: 10 * 60 * 1000,   // replaces `cacheTime` in v5
      refetchOnWindowFocus: false, // avoid refetching when switching tabs
      // refetchInterval: 5 * 60 * 1000, // refresh every 5 minutes
    },
  },
});
