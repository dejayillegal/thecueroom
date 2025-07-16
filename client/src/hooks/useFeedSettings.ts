import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export interface FeedSettings {
  enabled: boolean;
  refreshInterval: number;
  maxItems: number;
  sources: string[];
  categories: string[];
  moderation: boolean;
}

export function useFeedSettings() {
  const { data } = useQuery<Record<string, FeedSettings>>({
    queryKey: ["/api/feed-settings"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  return data;
}
