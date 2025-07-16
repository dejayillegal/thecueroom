import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get API base URL for free deployment stack
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // try VITE_API_BASE_URL first
    return import.meta.env.VITE_API_BASE_URL || window.location.origin
  }
  
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  retries = 2,
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(fullUrl, {
        method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });

      await throwIfResNotOk(res);
      return res;
    } catch (err) {
      if (attempt >= retries) throw err;
      // simple backoff
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  retries?: number;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, retries = 2 }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiBaseUrl();
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    for (let attempt = 0; ; attempt++) {
      try {
        const res = await fetch(fullUrl, {
          credentials: "include",
        });

        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
          return null;
        }

        await throwIfResNotOk(res);
        return await res.json();
      } catch (err) {
        if (attempt >= retries) throw err;
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
